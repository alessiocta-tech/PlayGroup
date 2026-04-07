import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { syncGmail } from '@/lib/gmail'

export async function POST() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await syncGmail()
    return NextResponse.json({ success: true, message: 'Gmail sync completato' })
  } catch (err) {
    console.error('[Email Sync] Error:', err)
    return NextResponse.json({ error: 'Sync fallito' }, { status: 500 })
  }
}
