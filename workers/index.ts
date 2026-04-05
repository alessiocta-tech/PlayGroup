import 'dotenv/config'
import {
  briefingQueue,
  syncKpiQueue,
  syncCalendarQueue,
  syncEmailQueue,
  syncFattureQueue,
  alertsQueue,
} from './queues'
import { startBriefingWorker } from './briefing'
import { startCalendarWorker } from './sync-calendar'
import { startEmailWorker } from './sync-email'
import { startAlertsWorker } from './alerts'
import { startSyncKpiWorker } from './sync-kpi'
import { startSyncFattureWorker } from './sync-fatture'

console.log('[Worker] Starting Play Group background workers...')

// Start all workers
startBriefingWorker()
startCalendarWorker()
startEmailWorker()
startAlertsWorker()
startSyncKpiWorker()
startSyncFattureWorker()

// Schedule recurring jobs
async function scheduleJobs(): Promise<void> {
  // Morning briefing every day at 8:00 AM Rome time
  await briefingQueue.add(
    'daily-briefing',
    {},
    {
      repeat: { pattern: '0 8 * * *', tz: 'Europe/Rome' },
      removeOnComplete: 10,
      removeOnFail: 5,
    }
  )

  // Sync KPI (deRione + others) every hour
  await syncKpiQueue.add(
    'kpi-sync',
    {},
    {
      repeat: { pattern: '0 * * * *' },
      removeOnComplete: 5,
      removeOnFail: 5,
    }
  )

  // Sync Google Calendar every 30 minutes
  await syncCalendarQueue.add(
    'calendar-sync',
    {},
    {
      repeat: { pattern: '*/30 * * * *' },
      removeOnComplete: 5,
      removeOnFail: 5,
    }
  )

  // Sync Gmail every 15 minutes
  await syncEmailQueue.add(
    'email-sync',
    {},
    {
      repeat: { pattern: '*/15 * * * *' },
      removeOnComplete: 5,
      removeOnFail: 5,
    }
  )

  // Sync Fattura24 every 6 hours
  await syncFattureQueue.add(
    'fatture-sync',
    {},
    {
      repeat: { pattern: '0 */6 * * *' },
      removeOnComplete: 5,
      removeOnFail: 5,
    }
  )

  // Check alerts (tax deadlines, KPI anomalies) every hour
  await alertsQueue.add(
    'alerts-check',
    {},
    {
      repeat: { pattern: '0 * * * *' },
      removeOnComplete: 5,
      removeOnFail: 5,
    }
  )

  console.log('[Worker] All recurring jobs scheduled')
}

scheduleJobs().catch(console.error)

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[Worker] Shutting down...')
  process.exit(0)
})
