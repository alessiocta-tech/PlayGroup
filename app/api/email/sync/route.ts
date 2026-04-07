import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { syncGmailWithResult } from '@/lib/gmail'

export async function POST() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await syncGmailWithResult()
    return NextResponse.json(result)
  } catch (err) {
    console.error('[Email Sync] Error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
