import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible'
import IORedis from 'ioredis'
import { NextRequest, NextResponse } from 'next/server'

const redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379/0', {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  lazyConnect: true,
})

// Chat AI: 30 richieste / minuto per IP
const chatLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl_chat',
  points: 30,
  duration: 60,
})

// WhatsApp webhook: 100 richieste / minuto (webhook Whapi può inviare burst)
const whatsappLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl_whatsapp',
  points: 100,
  duration: 60,
})

// Sync API: 10 richieste / minuto per IP (sync manuale)
const syncLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl_sync',
  points: 10,
  duration: 60,
})

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  )
}

// Login: max 5 tentativi / 15 minuti per IP — anti brute-force
const loginLimiter = new RateLimiterRedis({
  storeClient: redis,
  keyPrefix: 'rl_login',
  points: 5,
  duration: 15 * 60,
  blockDuration: 15 * 60, // blocca per 15min dopo il superamento
})

type LimiterKey = 'chat' | 'whatsapp' | 'sync' | 'login'

const limiters: Record<LimiterKey, RateLimiterRedis> = {
  chat: chatLimiter,
  whatsapp: whatsappLimiter,
  sync: syncLimiter,
  login: loginLimiter,
}

// Espone i punti rimanenti per il login (usato per audit log)
export async function loginConsumeOrThrow(ip: string): Promise<void> {
  await loginLimiter.consume(ip)
}

export async function loginReward(ip: string): Promise<void> {
  // Login riuscito: azzera i tentativi falliti per quell'IP
  await loginLimiter.reward(ip).catch(() => null)
}

export async function rateLimit(
  req: NextRequest,
  key: LimiterKey
): Promise<NextResponse | null> {
  const ip = getIp(req)
  try {
    await limiters[key].consume(ip)
    return null // OK
  } catch (err) {
    if (err instanceof RateLimiterRes) {
      return NextResponse.json(
        { error: 'Troppe richieste. Riprova tra poco.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil(err.msBeforeNext / 1000)),
            'X-RateLimit-Reset': String(Date.now() + err.msBeforeNext),
          },
        }
      )
    }
    // Se Redis non è disponibile, lascia passare (fail open) con warning
    console.warn('[RateLimit] Redis unavailable, skipping rate limit:', err)
    return null
  }
}
