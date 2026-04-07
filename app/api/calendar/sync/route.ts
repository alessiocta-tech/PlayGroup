import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { syncGoogleCalendar } from '@/lib/google-cal'

export async function POST() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await syncGoogleCalendar()
    return NextResponse.json({ success: true, message: 'Calendario sincronizzato' })
  } catch (err) {
    console.error('[Calendar Sync] Error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
