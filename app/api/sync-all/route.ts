import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'
import { syncGmailWithResult } from '@/lib/gmail'
import { syncGoogleCalendar } from '@/lib/google-cal'
import { syncGoogleContacts } from '@/lib/google-contacts'
import { syncGoogleTasks } from '@/lib/google-tasks'

export async function POST() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, unknown> = {}

  // Run all syncs in parallel
  const [emailRes, calRes, contactsRes, tasksRes] = await Promise.allSettled([
    syncGmailWithResult(),
    syncGoogleCalendar(),
    syncGoogleContacts(),
    syncGoogleTasks(),
  ])

  results.email = emailRes.status === 'fulfilled'
    ? emailRes.value
    : { error: String((emailRes as PromiseRejectedResult).reason) }

  results.calendar = calRes.status === 'fulfilled'
    ? { success: true }
    : { error: String((calRes as PromiseRejectedResult).reason) }

  results.contacts = contactsRes.status === 'fulfilled'
    ? contactsRes.value
    : { error: String((contactsRes as PromiseRejectedResult).reason) }

  results.tasks = tasksRes.status === 'fulfilled'
    ? tasksRes.value
    : { error: String((tasksRes as PromiseRejectedResult).reason) }

  return NextResponse.json({ success: true, results })
}
