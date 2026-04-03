import { Worker, Job } from 'bullmq'
import { connection } from './queues'
import { syncGoogleCalendar } from '@/lib/google-cal'

export function startCalendarWorker() {
  const worker = new Worker(
    'sync-calendar',
    async (job: Job) => {
      console.log('[Calendar] Syncing Google Calendar:', job.id)
      await syncGoogleCalendar()
    },
    { connection }
  )

  worker.on('completed', (job) => console.log(`[Calendar] Job ${job.id} completed`))
  worker.on('failed', (job, err) => console.error(`[Calendar] Job ${job?.id} failed:`, err))

  return worker
}
