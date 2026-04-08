import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Endpoint temporaneo per pulizia dati fake — rimuovere dopo uso
// Protetto da secret token
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-cleanup-secret')
  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results: Record<string, number> = {}

  // Elimina dati fake in ordine di dipendenza (FK)
  results.notification = (await prisma.notification.deleteMany({})).count
  results.homeEvent = (await prisma.homeEvent.deleteMany({})).count
  results.homeDevice = (await prisma.homeDevice.deleteMany({})).count
  results.workout = (await prisma.workout.deleteMany({})).count
  results.healthMetric = (await prisma.healthMetric.deleteMany({})).count
  results.condoMeeting = (await prisma.condoMeeting.deleteMany({})).count
  results.condoExpense = (await prisma.condoExpense.deleteMany({})).count
  results.taxDeadline = (await prisma.taxDeadline.deleteMany({})).count
  results.personalFinance = (await prisma.personalFinance.deleteMany({})).count
  results.task = (await prisma.task.deleteMany({})).count
  results.contactInteraction = (await prisma.contactInteraction.deleteMany({})).count
  results.contact = (await prisma.contact.deleteMany({})).count
  results.waMessage = (await prisma.waMessage.deleteMany({})).count
  results.bug = (await prisma.bug.deleteMany({})).count
  results.ccInstance = (await prisma.ccInstance.deleteMany({})).count
  results.agentLog = (await prisma.agentLog.deleteMany({})).count
  results.agent = (await prisma.agent.deleteMany({})).count
  results.dailyKpi = (await prisma.dailyKpi.deleteMany({})).count

  // Elimina solo eventi senza googleEventId (fake del seed)
  results.fakeEvents = (await prisma.event.deleteMany({
    where: { googleEventId: null },
  })).count

  // Conta dati mantenuti
  const kept = {
    emails: await prisma.email.count(),
    companies: await prisma.company.count(),
    realEvents: await prisma.event.count(),
  }

  return NextResponse.json({ success: true, deleted: results, kept })
}
