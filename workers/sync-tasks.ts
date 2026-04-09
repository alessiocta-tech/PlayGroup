import { Worker, Job } from 'bullmq'
import { connection } from './queues'
import { syncGoogleTasks } from '@/lib/google-tasks'

export function startSyncTasksWorker() {
  const worker = new Worker(
    'sync-tasks',
    async (job: Job) => {
      console.log('[Tasks] Syncing Google Tasks:', job.id)
      const result = await syncGoogleTasks()
      console.log(`[Tasks] Done: ${result.synced} synced, ${result.skipped} skipped`)
    },
    { connection }
  )

  worker.on('completed', (job) => console.log(`[Tasks] Job ${job.id} completed`))
  worker.on('failed', (job, err) => console.error(`[Tasks] Job ${job?.id} failed:`, err))

  return worker
}
