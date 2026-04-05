import { Worker, Job } from 'bullmq'
import { connection } from './queues'
import { syncFattura24 } from '@/lib/fattura24'

export function startSyncFattureWorker() {
  const worker = new Worker(
    'sync-fatture',
    async (job: Job) => {
      console.log('[SyncFatture] Syncing Fattura24:', job.id)
      await syncFattura24()
    },
    { connection }
  )

  worker.on('completed', (job) => console.log(`[SyncFatture] Job ${job.id} completed`))
  worker.on('failed', (job, err) => console.error(`[SyncFatture] Job ${job?.id} failed:`, err))

  return worker
}
