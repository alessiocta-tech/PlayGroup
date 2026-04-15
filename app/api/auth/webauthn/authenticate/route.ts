import { NextResponse } from 'next/server'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { prisma } from '@/lib/prisma'
import { getRpSettings, consumeAuthChallenge, createWebAuthnToken } from '@/lib/webauthn'
import { z } from 'zod'

const BodySchema = z.object({
  sessionId: z.string(),
  response: z.record(z.unknown()),
})

export async function POST(req: Request): Promise<NextResponse> {
  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 })
  }

  // Retrieve and consume challenge
  const expectedChallenge = await consumeAuthChallenge(body.sessionId)
  if (!expectedChallenge) {
    return NextResponse.json(
      { error: 'Challenge scaduta. Riprova.' },
      { status: 400 }
    )
  }

  // Extract credential ID from the assertion response
  const authResponse = body.response as { id: string; [key: string]: unknown }
  const credentialIdB64 = authResponse.id

  // Look up stored credential
  const storedCredential = await prisma.webAuthnCredential.findUnique({
    where: { credentialId: credentialIdB64 },
    include: { user: true },
  })

  if (!storedCredential) {
    return NextResponse.json(
      { error: 'Credenziale non trovata' },
      { status: 400 }
    )
  }

  const { rpID, origin } = getRpSettings()

  let verification
  try {
    verification = await verifyAuthenticationResponse({
      response: body.response as unknown as Parameters<typeof verifyAuthenticationResponse>[0]['response'],
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        // v9: credentialID is Uint8Array
        credentialID: Buffer.from(storedCredential.credentialId, 'base64url'),
        credentialPublicKey: new Uint8Array(storedCredential.publicKey),
        counter: Number(storedCredential.counter),
        // transports optional in v9
      },
      requireUserVerification: true,
    })
  } catch (err) {
    console.error('[WebAuthn Auth] Verification error:', err)
    return NextResponse.json({ error: 'Autenticazione fallita' }, { status: 400 })
  }

  if (!verification.verified) {
    return NextResponse.json({ error: 'Verifica fallita' }, { status: 400 })
  }

  // Update counter to prevent replay attacks
  await prisma.webAuthnCredential.update({
    where: { credentialId: credentialIdB64 },
    data: {
      counter: BigInt(verification.authenticationInfo.newCounter),
      lastUsed: new Date(),
    },
  })

  // Issue short-lived token the client can exchange for a NextAuth session
  const token = createWebAuthnToken(storedCredential.userId)
  return NextResponse.json({ token, userId: storedCredential.userId })
}
