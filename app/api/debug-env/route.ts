import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  return NextResponse.json({
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? `set (${process.env.GOOGLE_CLIENT_ID.slice(0, 10)}...)` : 'MISSING',
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? `set (${process.env.GOOGLE_CLIENT_SECRET.slice(0, 6)}...)` : 'MISSING',
    GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN ? `set (${process.env.GOOGLE_REFRESH_TOKEN.slice(0, 6)}...)` : 'MISSING',
  })
}
