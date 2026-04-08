import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { syncGoogleTasks } from '@/lib/google-tasks'

export async function POST() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await syncGoogleTasks()
    return NextResponse.json(result)
  } catch (err) {
    console.error('[Tasks Sync] Error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
