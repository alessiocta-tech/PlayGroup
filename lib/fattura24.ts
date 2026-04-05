import { prisma } from '@/lib/prisma'

const API_KEY = process.env.FATTURA24_API_KEY
const BASE_URL = 'https://www.app.fattura24.com/api/v0.3'

interface Fattura24Document {
  DocumentType: string
  Number: string
  Date: string
  TotalAmount: string
  PaymentStatus: string // 'Pagata' | 'Non pagata' | 'Parzialmente pagata'
  CustomerName?: string
  Notes?: string
}

interface Fattura24Response {
  error: string // '0' = ok
  description?: string
  document?: Fattura24Document[]
}

async function fetchFattura24(
  endpoint: string,
  params: Record<string, string> = {}
): Promise<Fattura24Response | null> {
  if (!API_KEY) {
    console.warn('[Fattura24] Missing API key')
    return null
  }

  const url = new URL(`${BASE_URL}/${endpoint}`)
  url.searchParams.set('ApiKey', API_KEY)
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v)
  }

  try {
    const res = await fetch(url.toString())
    if (!res.ok) {
      console.error('[Fattura24] HTTP error:', res.status)
      return null
    }
    return (await res.json()) as Fattura24Response
  } catch (err) {
    console.error('[Fattura24] Fetch error:', err)
    return null
  }
}

export async function syncFattura24(): Promise<void> {
  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .slice(0, 10)
  const today = now.toISOString().slice(0, 10)

  const data = await fetchFattura24('GetDocumentList', {
    DocumentType: 'FT', // Fattura
    DateFrom: monthStart,
    DateTo: today,
  })

  if (!data || data.error !== '0' || !data.document) {
    console.warn('[Fattura24] No data or error:', data?.description)
    return
  }

  let synced = 0

  for (const doc of data.document) {
    const amount = parseFloat(doc.TotalAmount.replace(',', '.')) || 0
    const date = new Date(doc.Date)
    const isPaid = doc.PaymentStatus === 'Pagata'

    // Upsert into PersonalFinance as income entries
    const existing = await prisma.personalFinance.findFirst({
      where: {
        meta: {
          path: ['fattura24_number'],
          equals: doc.Number,
        },
        date,
      },
    })

    if (!existing) {
      await prisma.personalFinance.create({
        data: {
          date,
          amount,
          category: 'fattura',
          description: `Fattura ${doc.Number}${doc.CustomerName ? ` — ${doc.CustomerName}` : ''}`,
          type: 'income',
          meta: {
            fattura24_number: doc.Number,
            payment_status: doc.PaymentStatus,
            paid: isPaid,
          },
        },
      })
      synced++
    }
  }

  // Also check for pending tax deadlines (IVA quarterly)
  await checkTaxDeadlines()

  console.log(`[Fattura24] Synced ${synced} new invoices`)
}

async function checkTaxDeadlines(): Promise<void> {
  const now = new Date()
  const month = now.getMonth() + 1 // 1-based

  // IVA quarterly deadlines: March 16, June 16, Sept 16, Nov 30, + annual March 31
  const quarterlyMonths: Record<number, { day: number; label: string }> = {
    3:  { day: 16, label: 'IVA I trimestre (gen-mar)' },
    6:  { day: 16, label: 'IVA II trimestre (apr-giu)' },
    9:  { day: 16, label: 'IVA III trimestre (lug-set)' },
    11: { day: 30, label: 'IVA IV trimestre (ott-dic)' },
  }

  const entry = quarterlyMonths[month]
  if (!entry) return

  const deadlineDate = new Date(now.getFullYear(), month - 1, entry.day)
  const daysUntil = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysUntil < 0 || daysUntil > 30) return

  const existing = await prisma.taxDeadline.findFirst({
    where: {
      title: entry.label,
      dueDate: deadlineDate,
    },
  })

  if (!existing) {
    await prisma.taxDeadline.create({
      data: {
        title: entry.label,
        dueDate: deadlineDate,
        status: 'pending',
      },
    })
    console.log(`[Fattura24] Created tax deadline: ${entry.label}`)
  }
}
