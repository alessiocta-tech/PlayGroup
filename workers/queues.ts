import { Queue } from 'bullmq'
import IORedis from 'ioredis'

export const connection = new IORedis(process.env.REDIS_URL ?? 'redis://localhost:6379/0', {
  maxRetriesPerRequest: null,
})

export const briefingQueue = new Queue('morning-briefing', { connection })
export const syncKpiQueue = new Queue('sync-kpi', { connection })
export const syncCalendarQueue = new Queue('sync-calendar', { connection })
export const syncEmailQueue = new Queue('sync-email', { connection })
export const alertsQueue = new Queue('alerts', { connection })
