import IORedis from 'ioredis'
import crypto from 'crypto'

// ── Redis client (challenge storage) ──────────────────────────────────────────

let _redis: IORedis | null = null
function getRedis(): IORedis {
  if (!_redis) {
    _redis = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379/0', {
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      lazyConnect: true,
    })
  }
  return _redis
}

// ── RP settings (Relying Party) ───────────────────────────────────────────────

export function getRpSettings(): { rpID: string; rpName: string; origin: string } {
  const raw = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
  const url = new URL(raw)
  return {
    rpID: url.hostname,           // "localhost" | "www.playgroupsrl.it"
    rpName: 'Play Group',
    origin: url.origin,           // "https://www.playgroupsrl.it"
  }
}

// ── Challenge storage (Redis, 2min TTL) ───────────────────────────────────────

const TTL = 120 // seconds

/** Store registration challenge for a user */
export async function storeRegChallenge(userId: string, challenge: string): Promise<void> {
  await getRedis().set(`webauthn:reg:${userId}`, challenge, 'EX', TTL)
}

export async function consumeRegChallenge(userId: string): Promise<string | null> {
  const redis = getRedis()
  const val = await redis.get(`webauthn:reg:${userId}`)
  if (val) await redis.del(`webauthn:reg:${userId}`)
  return val
}

/** Store authentication challenge mapped to a sessionId */
export async function storeAuthChallenge(sessionId: string, challenge: string): Promise<void> {
  await getRedis().set(`webauthn:auth:${sessionId}`, challenge, 'EX', TTL)
}

export async function consumeAuthChallenge(sessionId: string): Promise<string | null> {
  const redis = getRedis()
  const val = await redis.get(`webauthn:auth:${sessionId}`)
  if (val) await redis.del(`webauthn:auth:${sessionId}`)
  return val
}

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('base64url')
}

// ── Short-lived WebAuthn token (bridges WebAuthn ↔ NextAuth) ─────────────────
// Valid for 60 seconds only — enough for the client to call signIn('credentials')

export function createWebAuthnToken(userId: string): string {
  const payload = JSON.stringify({ userId, exp: Date.now() + 60_000 })
  const b64 = Buffer.from(payload).toString('base64url')
  const secret = process.env.NEXTAUTH_SECRET ?? 'fallback-secret'
  const sig = crypto.createHmac('sha256', secret).update(b64).digest('base64url')
  return `${b64}.${sig}`
}

export function verifyWebAuthnToken(token: string): { userId: string } | null {
  try {
    const [b64, sig] = token.split('.')
    if (!b64 || !sig) return null
    const secret = process.env.NEXTAUTH_SECRET ?? 'fallback-secret'
    const expected = crypto.createHmac('sha256', secret).update(b64).digest('base64url')
    if (expected !== sig) return null
    const payload = JSON.parse(Buffer.from(b64, 'base64url').toString()) as {
      userId: string
      exp: number
    }
    if (Date.now() > payload.exp) return null
    return { userId: payload.userId }
  } catch {
    return null
  }
}
