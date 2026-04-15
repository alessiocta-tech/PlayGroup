import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { prisma } from '@/lib/prisma'
import { getRpSettings, storeRegChallenge } from '@/lib/webauthn'

export async function POST(): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { webAuthnCredentials: true },
  })

  if (!user) {
    return NextResponse.json({ error: 'Utente non trovato' }, { status: 404 })
  }

  const { rpID, rpName } = getRpSettings()

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    // v9: userID is a string (Base64URLString or plain string)
    userID: userId,
    userName: user.email ?? userId,
    userDisplayName: user.name ?? user.email ?? 'Alessio',
    attestationType: 'none',
    // Prevent re-registering existing credentials
    excludeCredentials: user.webAuthnCredentials.map((c) => ({
      id: Buffer.from(c.credentialId, 'base64url'),
      type: 'public-key' as const,
      transports: c.transports as ('usb' | 'ble' | 'nfc' | 'internal' | 'hybrid' | 'smart-card')[],
    })),
    authenticatorSelection: {
      // Prefer platform authenticator (Touch ID / Face ID / fingerprint)
      authenticatorAttachment: 'platform',
      userVerification: 'required',
      residentKey: 'preferred',
    },
  })

  // Store challenge in Redis (consumed by /register)
  await storeRegChallenge(userId, options.challenge)

  return NextResponse.json(options)
}
