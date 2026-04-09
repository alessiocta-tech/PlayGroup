import { Worker, Job } from 'bullmq'
import { connection } from './queues'
import { syncGoogleContacts } from '@/lib/google-contacts'

export function startSyncContactsWorker() {
  const worker = new Worker(
    'sync-contacts',
    async (job: Job) => {
      console.log('[Contacts] Syncing Google Contacts:', job.id)
      const result = await syncGoogleContacts()
      console.log(`[Contacts] Done: ${result.synced} synced, ${result.skipped} skipped`)
    },
    { connection }
  )

  worker.on('completed', (job) => console.log(`[Contacts] Job ${job.id} completed`))
  worker.on('failed', (job, err) => console.error(`[Contacts] Job ${job?.id} failed:`, err))

  return worker
}
