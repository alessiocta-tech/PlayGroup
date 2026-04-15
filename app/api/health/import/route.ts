import { auth } from '@/lib/auth'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Apple Health export CSV format (from Health Auto Export app or similar):
// Date,Steps,Active Energy (kcal),Heart Rate (bpm),Weight (kg),Sleep Analysis (hr),HRV (ms)
// 2024-01-15,8432,450,72,78.5,7.2,45

interface HealthRow {
  date: string
  steps?: string
  calories?: string
  heartRate?: string
  weight?: string
  sleep?: string
  hrv?: string
}

function parseNum(val: string | undefined): number | null {
  if (!val || val.trim() === '' || val.trim() === '-') return null
  const n = parseFloat(val.trim())
  return isNaN(n) ? null : n
}

function parseCSV(text: string): HealthRow[] {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)
  if (lines.length < 2) return []

  const header = lines[0].toLowerCase()
  // Try to detect column positions from header
  const cols = header.split(',').map((c) => c.trim())

  const dateIdx = cols.findIndex((c) => c.includes('date'))
  const stepsIdx = cols.findIndex((c) => c.includes('step'))
  const caloriesIdx = cols.findIndex((c) => c.includes('energy') || c.includes('calori') || c.includes('kcal'))
  const hrIdx = cols.findIndex((c) => c.includes('heart rate') || c === 'hr')
  const weightIdx = cols.findIndex((c) => c.includes('weight') || c.includes('peso'))
  const sleepIdx = cols.findIndex((c) => c.includes('sleep') || c.includes('sonno'))
  const hrvIdx = cols.findIndex((c) => c === 'hrv' || c.includes('hrv'))

  if (dateIdx === -1) return []

  const rows: HealthRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',')
    rows.push({
      date: parts[dateIdx]?.trim() ?? '',
      steps: stepsIdx >= 0 ? parts[stepsIdx] : undefined,
      calories: caloriesIdx >= 0 ? parts[caloriesIdx] : undefined,
      heartRate: hrIdx >= 0 ? parts[hrIdx] : undefined,
      weight: weightIdx >= 0 ? parts[weightIdx] : undefined,
      sleep: sleepIdx >= 0 ? parts[sleepIdx] : undefined,
      hrv: hrvIdx >= 0 ? parts[hrvIdx] : undefined,
    })
  }
  return rows
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'Nessun file caricato' }, { status: 400 })
  }

  const text = await file.text()
  const rows = parseCSV(text)

  if (rows.length === 0) {
    return NextResponse.json({ error: 'CSV non riconosciuto o vuoto' }, { status: 400 })
  }

  let imported = 0
  let skipped = 0

  for (const row of rows) {
    if (!row.date) { skipped++; continue }

    const date = new Date(row.date)
    if (isNaN(date.getTime())) { skipped++; continue }

    const steps = parseNum(row.steps)
    const calories = parseNum(row.calories)
    const heartRate = parseNum(row.heartRate)
    const weight = parseNum(row.weight)
    const sleepHours = parseNum(row.sleep)
    const hrv = parseNum(row.hrv)

    // Skip completely empty rows
    if (steps === null && calories === null && heartRate === null && weight === null && sleepHours === null && hrv === null) {
      skipped++
      continue
    }

    await prisma.healthMetric.upsert({
      where: { date },
      update: {
        ...(steps !== null && { steps }),
        ...(calories !== null && { calories }),
        ...(heartRate !== null && { heartRate }),
        ...(weight !== null && { weight }),
        ...(sleepHours !== null && { sleepHours }),
        ...(hrv !== null && { hrv }),
      },
      create: {
        date,
        steps,
        calories,
        heartRate,
        weight: weight !== null ? weight : null,
        sleepHours: sleepHours !== null ? sleepHours : null,
        hrv,
      },
    })
    imported++
  }

  return NextResponse.json({ success: true, imported, skipped, total: rows.length })
}
