import { Worker, Job } from 'bullmq'
import { connection } from './queues'
import { prisma } from '@/lib/prisma'

// deRione uses a remote MySQL/PostgreSQL DB exposed via env var DERIONE_DATABASE_URL
// We pull yesterday's revenue + covers by querying their reporting endpoint or DB.
// If DERIONE_DATABASE_URL is not set, we skip with a warning.

interface DeRioneKpiRow {
  date: string
  revenue: number
  bookings: number
  covers: number
}

async function fetchDeRioneKpi(): Promise<DeRioneKpiRow[]> {
  const url = process.env.DERIONE_KPI_URL
  const token = process.env.DERIONE_KPI_TOKEN

  if (!url) {
    console.warn('[SyncKpi] DERIONE_KPI_URL not set — skipping deRione KPI sync')
    return []
  }

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().slice(0, 10)

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  try {
    const res = await fetch(`${url}?date=${dateStr}`, { headers })
    if (!res.ok) {
      console.error('[SyncKpi] deRione API error:', res.status, await res.text())
      return []
    }
    const data = (await res.json()) as DeRioneKpiRow | DeRioneKpiRow[]
    return Array.isArray(data) ? data : [data]
  } catch (err) {
    console.error('[SyncKpi] Fetch error:', err)
    return []
  }
}

export function startSyncKpiWorker() {
  const worker = new Worker(
    'sync-kpi',
    async (job: Job) => {
      console.log('[SyncKpi] Running KPI sync:', job.id)

      // Get all active companies
      const companies = await prisma.company.findMany({ where: { active: true } })

      // deRione specific: fetch from their API
      const deRione = companies.find((c) => c.slug === 'derione')
      if (deRione) {
        const rows = await fetchDeRioneKpi()
        for (const row of rows) {
          const date = new Date(row.date)
          date.setHours(0, 0, 0, 0)

          await prisma.dailyKpi.upsert({
            where: { companyId_date: { companyId: deRione.id, date } },
            update: {
              revenue: row.revenue,
              bookings: row.bookings,
              covers: row.covers,
            },
            create: {
              companyId: deRione.id,
              date,
              revenue: row.revenue,
              bookings: row.bookings,
              covers: row.covers,
            },
          })
        }
        console.log(`[SyncKpi] Upserted ${rows.length} deRione KPI rows`)
      }

      // For other companies without direct API, just ensure today's row exists with 0 defaults
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (const company of companies) {
        if (company.slug === 'derione') continue
        await prisma.dailyKpi.upsert({
          where: { companyId_date: { companyId: company.id, date: today } },
          update: {},
          create: {
            companyId: company.id,
            date: today,
            revenue: 0,
            bookings: 0,
            covers: 0,
          },
        })
      }
    },
    { connection }
  )

  worker.on('completed', (job) => console.log(`[SyncKpi] Job ${job.id} completed`))
  worker.on('failed', (job, err) => console.error(`[SyncKpi] Job ${job?.id} failed:`, err))

  return worker
}
