import { NextRequest, NextResponse } from 'next/server'

// Temporary endpoint to capture Google OAuth code and exchange for refresh token
// Remove after getting the refresh token
export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const error = req.nextUrl.searchParams.get('error')

  if (error) {
    return NextResponse.json({ error }, { status: 400 })
  }

  if (!code) {
    // Step 1: redirect to Google
    const clientId = process.env.GOOGLE_CLIENT_ID
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/google-auth`
    const scopes = [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/contacts.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/tasks.readonly',
    ].join(' ')

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
    url.searchParams.set('client_id', clientId!)
    url.searchParams.set('redirect_uri', redirectUri)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('scope', scopes)
    url.searchParams.set('access_type', 'offline')
    url.searchParams.set('prompt', 'consent')
    // Legge l'email dal query param o dall'env — non hardcoded
    const hint = req.nextUrl.searchParams.get('hint') ?? process.env.GOOGLE_LOGIN_HINT ?? ''
    if (hint) url.searchParams.set('login_hint', hint)

    return NextResponse.redirect(url.toString())
  }

  // Step 2: exchange code for tokens
  const clientId = process.env.GOOGLE_CLIENT_ID!
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET!
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/google-auth`

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  })

  const tokens = await tokenRes.json() as {
    access_token?: string
    refresh_token?: string
    error?: string
  }

  if (tokens.error || !tokens.refresh_token) {
    return NextResponse.json({
      error: tokens.error ?? 'No refresh token received',
      tokens,
    }, { status: 400 })
  }

  // Show the refresh token — copy it to Railway env vars
  return NextResponse.json({
    success: true,
    message: 'Copia il GOOGLE_REFRESH_TOKEN nelle variabili Railway',
    GOOGLE_REFRESH_TOKEN: tokens.refresh_token,
  })
}
