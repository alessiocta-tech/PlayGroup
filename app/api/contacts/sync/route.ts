import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { syncGoogleContacts } from '@/lib/google-contacts'

export async function POST() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await syncGoogleContacts()
    return NextResponse.json(result)
  } catch (err) {
    console.error('[Contacts Sync] Error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
