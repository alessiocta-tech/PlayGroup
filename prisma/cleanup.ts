/**
 * Cleanup script: rimuove tutti i dati fake/seed dal database.
 * Mantiene:
 *  - Company (aziende reali di Alessio)
 *  - Email (sincronizzate da Gmail reale)
 *  - Event con googleEventId (sincronizzati da Google Calendar reale)
 *
 * Eseguire con: npx tsx prisma/cleanup.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Avvio pulizia dati fake...\n')

  // 1. Notifiche fake
  const notif = await prisma.notification.deleteMany({})
  console.log(`✅ Notification: ${notif.count} eliminate`)

  // 2. Domotica fake
  const homeEvents = await prisma.homeEvent.deleteMany({})
  console.log(`✅ HomeEvent: ${homeEvents.count} eliminati`)
  const homeDevices = await prisma.homeDevice.deleteMany({})
  console.log(`✅ HomeDevice: ${homeDevices.count} eliminati`)

  // 3. Salute fake
  const workouts = await prisma.workout.deleteMany({})
  console.log(`✅ Workout: ${workouts.count} eliminati`)
  const healthMetrics = await prisma.healthMetric.deleteMany({})
  console.log(`✅ HealthMetric: ${healthMetrics.count} eliminate`)

  // 4. Casa/condominio fake
  const condoMeetings = await prisma.condoMeeting.deleteMany({})
  console.log(`✅ CondoMeeting: ${condoMeetings.count} eliminate`)
  const condoExpenses = await prisma.condoExpense.deleteMany({})
  console.log(`✅ CondoExpense: ${condoExpenses.count} eliminate`)

  // 5. Contabilità fake
  const taxDeadlines = await prisma.taxDeadline.deleteMany({})
  console.log(`✅ TaxDeadline: ${taxDeadlines.count} eliminate`)
  const personalFinances = await prisma.personalFinance.deleteMany({})
  console.log(`✅ PersonalFinance: ${personalFinances.count} eliminate`)

  // 6. Task fake (seed) — elimina tutti i task
  const tasks = await prisma.task.deleteMany({})
  console.log(`✅ Task: ${tasks.count} eliminati`)

  // 7. Interazioni CRM fake
  const interactions = await prisma.contactInteraction.deleteMany({})
  console.log(`✅ ContactInteraction: ${interactions.count} eliminate`)

  // 8. Contatti CRM fake
  const contacts = await prisma.contact.deleteMany({})
  console.log(`✅ Contact: ${contacts.count} eliminati`)

  // 9. WhatsApp messaggi fake
  const waMessages = await prisma.waMessage.deleteMany({})
  console.log(`✅ WaMessage: ${waMessages.count} eliminati`)

  // 10. Bug fake
  const bugs = await prisma.bug.deleteMany({})
  console.log(`✅ Bug: ${bugs.count} eliminati`)

  // 11. Claude Code instances fake
  const ccInstances = await prisma.ccInstance.deleteMany({})
  console.log(`✅ CcInstance: ${ccInstances.count} eliminate`)

  // 12. Agent logs fake
  const agentLogs = await prisma.agentLog.deleteMany({})
  console.log(`✅ AgentLog: ${agentLogs.count} eliminati`)

  // 13. Agent fake
  const agents = await prisma.agent.deleteMany({})
  console.log(`✅ Agent: ${agents.count} eliminati`)

  // 14. KPI fake
  const kpis = await prisma.dailyKpi.deleteMany({})
  console.log(`✅ DailyKpi: ${kpis.count} eliminati`)

  // 15. Eventi fake dal seed (quelli senza googleEventId)
  //     Mantiene solo gli eventi sincronizzati da Google Calendar
  const fakeEvents = await prisma.event.deleteMany({
    where: { googleEventId: null },
  })
  console.log(`✅ Event (fake, senza googleEventId): ${fakeEvents.count} eliminati`)

  // Email: MANTIENI TUTTE (sono reali da Gmail)
  const emailCount = await prisma.email.count()
  console.log(`📧 Email: ${emailCount} mantenute (reali da Gmail)`)

  // Aziende: MANTIENI TUTTE (sono le aziende reali di Alessio)
  const companyCount = await prisma.company.count()
  console.log(`🏢 Company: ${companyCount} mantenute`)

  // Eventi reali: mostra quanti rimangono
  const realEvents = await prisma.event.count()
  console.log(`📅 Event (reali da Google Calendar): ${realEvents} mantenuti`)

  console.log('\n✅ Pulizia completata! Il gestionale ora mostra solo dati reali.')
}

main()
  .catch((e) => {
    console.error('❌ Errore durante la pulizia:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
