import { Worker, Job } from 'bullmq'
import { connection } from './queues'
import { syncGmail } from '@/lib/gmail'

export function startEmailWorker() {
  const worker = new Worker(
    'sync-email',
    async (job: Job) => {
      console.log('[Email] Syncing Gmail:', job.id)
      await syncGmail()
    },
    { connection }
  )

  worker.on('completed', (job) => console.log(`[Email] Job ${job.id} completed`))
  worker.on('failed', (job, err) => console.error(`[Email] Job ${job?.id} failed:`, err))

  return worker
}
