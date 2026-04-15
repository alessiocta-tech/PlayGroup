import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { prisma } from '@/lib/prisma'
import { getRpSettings, consumeRegChallenge } from '@/lib/webauthn'
import { z } from 'zod'

const BodySchema = z.object({
  response: z.record(z.unknown()),
  label: z.string().max(50).optional(),
})

export async function POST(req: Request): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id

  let body: z.infer<typeof BodySchema>
  try {
    body = BodySchema.parse(await req.json())
  } catch {
    return NextResponse.json({ error: 'Dati non validi' }, { status: 400 })
  }

  // Retrieve and consume challenge from Redis
  const expectedChallenge = await consumeRegChallenge(userId)
  if (!expectedChallenge) {
    return NextResponse.json(
      { error: 'Challenge scaduta o non trovata. Riprova.' },
      { status: 400 }
    )
  }

  const { rpID, origin } = getRpSettings()

  let verification
  try {
    verification = await verifyRegistrationResponse({
      response: body.response as unknown as Parameters<typeof verifyRegistrationResponse>[0]['response'],
      expectedChallenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      requireUserVerification: true,
    })
  } catch (err) {
    console.error('[WebAuthn Register] Verification error:', err)
    return NextResponse.json({ error: 'Verifica fallita' }, { status: 400 })
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: 'Registrazione non verificata' }, { status: 400 })
  }

  const { registrationInfo } = verification
  // v9 uses credentialID (Uint8Array) and credentialPublicKey (Uint8Array)
  const {
    credentialID,
    credentialPublicKey,
    counter,
    credentialDeviceType,
    credentialBackedUp,
  } = registrationInfo

  // Convert Uint8Array credentialID to base64url string for storage
  const credentialIdB64 = Buffer.from(credentialID).toString('base64url')

  // Save credential to DB
  await prisma.webAuthnCredential.create({
    data: {
      userId,
      credentialId: credentialIdB64,
      publicKey: Buffer.from(credentialPublicKey),
      counter: BigInt(counter),
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: [], // v9 doesn't always expose transports at registration
      label: body.label ?? 'Dispositivo',
    },
  })

  return NextResponse.json({ verified: true })
}
