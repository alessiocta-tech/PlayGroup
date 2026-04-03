import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { briefingQueue, syncCalendarQueue, syncEmailQueue, alertsQueue } from '@/workers/queues'

const VALID_JOBS = ['briefing', 'sync-calendar', 'sync-email', 'alerts'] as const
type ValidJob = (typeof VALID_JOBS)[number]

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json() as { job?: string }
  const job = body.job as ValidJob

  if (!VALID_JOBS.includes(job)) {
    return NextResponse.json({ error: `Invalid job. Valid: ${VALID_JOBS.join(', ')}` }, { status: 400 })
  }

  try {
    switch (job) {
      case 'briefing':
        await briefingQueue.add('manual-briefing', {})
        break
      case 'sync-calendar':
        await syncCalendarQueue.add('manual-calendar', {})
        break
      case 'sync-email':
        await syncEmailQueue.add('manual-email', {})
        break
      case 'alerts':
        await alertsQueue.add('manual-alerts', {})
        break
    }
    return NextResponse.json({ success: true, job })
  } catch (err) {
    console.error('[Cron API] Error:', err)
    return NextResponse.json({ error: 'Failed to queue job' }, { status: 500 })
  }
}
