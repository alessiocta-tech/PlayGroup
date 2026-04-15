import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { authConfig } from '@/lib/auth.config'
import { sendTelegram } from '@/lib/telegram'
import { RateLimiterRes } from 'rate-limiter-flexible'
import { loginConsumeOrThrow, loginReward } from '@/lib/rate-limit'
import { verifyWebAuthnToken } from '@/lib/webauthn'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// Orario notturno anomalo: 02:00–06:00 ora Roma
function isNocturnalAccess(): boolean {
  const hour = new Date().toLocaleString('it-IT', {
    timeZone: 'Europe/Rome',
    hour: '2-digit',
    hour12: false,
  })
  const h = parseInt(hour, 10)
  return h >= 2 && h < 6
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials, request) {
        // ── WebAuthn fast-path ───────────────────────────────────────────────
        // Short-lived HMAC token issued after fingerprint verification
        if (typeof credentials?.webauthnToken === 'string' && credentials.webauthnToken) {
          const data = verifyWebAuthnToken(credentials.webauthnToken)
          if (!data) return null

          const user = await prisma.user.findUnique({ where: { id: data.userId } })
          if (!user) return null

          const ip =
            request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ??
            request?.headers?.get('x-real-ip') ??
            '0.0.0.0'

          await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })
          await prisma.auditLog.create({
            data: { userId: user.id, action: 'LOGIN', resource: 'auth', ip, meta: { method: 'webauthn' } },
          }).catch(() => null)

          return { id: user.id, email: user.email, name: user.name }
        }

        const parsed = loginSchema.safeParse(credentials)
        if (!parsed.success) return null

        const ip =
          request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ??
          request?.headers?.get('x-real-ip') ??
          '0.0.0.0'

        // ── Rate limiting anti brute-force ──────────────────────────────────
        try {
          await loginConsumeOrThrow(ip)
        } catch (err) {
          if (err instanceof RateLimiterRes) {
            const waitMin = Math.ceil(err.msBeforeNext / 60000)
            await sendTelegram(
              `🚨 <b>Brute-force bloccato</b>\nIP: <code>${ip}</code>\nTentativi esauriti — bloccato per ${waitMin} minuti`
            ).catch(() => null)
            // Torna null: NextAuth interpreta come credenziali errate
            return null
          }
          // Redis down → lascia passare, logga
          console.warn('[Auth] Rate limit Redis error:', err)
        }

        // ── Verifica credenziali ─────────────────────────────────────────────
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user || !user.passwordHash) {
          // Audit: login fallito — utente non trovato
          await prisma.auditLog.create({
            data: {
              userId: 'unknown',
              action: 'FAILED_LOGIN',
              resource: 'auth',
              ip,
              meta: { reason: 'user_not_found', email: parsed.data.email },
            },
          }).catch(() => null)
          return null
        }

        const valid = await bcrypt.compare(parsed.data.password, user.passwordHash)

        if (!valid) {
          // Audit: password errata
          await prisma.auditLog.create({
            data: {
              userId: user.id,
              action: 'FAILED_LOGIN',
              resource: 'auth',
              ip,
              meta: { reason: 'wrong_password' },
            },
          }).catch(() => null)
          return null
        }

        // ── Login riuscito ───────────────────────────────────────────────────
        await loginReward(ip)

        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        })

        // Audit: login ok
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN',
            resource: 'auth',
            ip,
            meta: { email: user.email },
          },
        }).catch(() => null)

        // ── Alert Telegram: accesso anomalo ──────────────────────────────────
        const nocturnal = isNocturnalAccess()
        // Controlla se l'IP è già stato visto negli ultimi 30 giorni
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        const knownIp = await prisma.auditLog.findFirst({
          where: {
            userId: user.id,
            action: 'LOGIN',
            ip,
            timestamp: { gte: thirtyDaysAgo },
          },
          orderBy: { timestamp: 'desc' },
          skip: 1, // salta il record appena creato
        })

        if (!knownIp || nocturnal) {
          const reasons: string[] = []
          if (!knownIp) reasons.push('IP non riconosciuto')
          if (nocturnal) reasons.push('accesso notturno (02:00–06:00)')
          await sendTelegram(
            `⚠️ <b>Login anomalo rilevato</b>\n` +
            `IP: <code>${ip}</code>\n` +
            `Motivo: ${reasons.join(', ')}\n` +
            `Orario: ${new Date().toLocaleString('it-IT', { timeZone: 'Europe/Rome' })}`
          ).catch(() => null)
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        }
      },
    }),
  ],
})
