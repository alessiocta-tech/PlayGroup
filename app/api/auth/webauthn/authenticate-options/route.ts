import { NextResponse } from 'next/server'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { getRpSettings, storeAuthChallenge, generateSessionId } from '@/lib/webauthn'

export async function POST(): Promise<NextResponse> {
  const { rpID } = getRpSettings()

  // Discoverable credential flow — empty allowCredentials means the browser
  // shows a picker of all registered passkeys for this rpID.
  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: 'required',
    allowCredentials: [],
  })

  // Map challenge to a sessionId so the client can reference it during verify
  const sessionId = generateSessionId()
  await storeAuthChallenge(sessionId, options.challenge)

  return NextResponse.json({ ...options, sessionId })
}
