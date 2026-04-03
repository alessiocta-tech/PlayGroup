import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/lib/prisma'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export { anthropic }

export async function buildDashboardContext(): Promise<string> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    companies,
    todayKpi,
    agents,
    pendingWa,
    openBugs,
    upcomingEvents,
    pendingTasks,
    notifications,
  ] = await Promise.all([
    prisma.company.findMany({ where: { active: true } }),
    prisma.dailyKpi.findMany({ where: { date: today } }),
    prisma.agent.findMany(),
    prisma.waMessage.count({
      where: { direction: 'inbound', escalated: true, handledByAi: false },
    }),
    prisma.bug.count({ where: { status: { in: ['open', 'in_progress'] } } }),
    prisma.event.findMany({
      where: { startAt: { gte: new Date() } },
      orderBy: { startAt: 'asc' },
      take: 5,
    }),
    prisma.task.findMany({
      where: { status: { in: ['open', 'in_progress'] } },
      orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
      take: 10,
    }),
    prisma.notification.findMany({
      where: { read: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const totalRevenue = todayKpi.reduce((s, k) => s + k.revenue.toNumber(), 0)
  const activeAgents = agents.filter((a) => a.status === 'active').length
  const errorAgents = agents.filter((a) => a.status === 'error').length

  const companyRevenue = companies
    .map((c) => {
      const kpi = todayKpi.find((k) => k.companyId === c.id)
      return `${c.name}: €${(kpi?.revenue.toNumber() ?? 0).toLocaleString('it-IT')}`
    })
    .join(', ')

  const eventList = upcomingEvents
    .map(
      (e) =>
        `- ${new Date(e.startAt).toLocaleDateString('it-IT')} ${e.title}${e.location ? ` (${e.location})` : ''}`
    )
    .join('\n')

  const taskList = pendingTasks
    .map(
      (t) =>
        `- [${t.priority}] ${t.title}${t.dueDate ? ` (scad. ${new Date(t.dueDate).toLocaleDateString('it-IT')})` : ''}`
    )
    .join('\n')

  const notifList = notifications
    .map((n) => `- [${n.priority}] ${n.title}: ${n.body ?? ''}`)
    .join('\n')

  return `=== CONTESTO SISTEMA PLAY GROUP ===
Data: ${new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

INCASSI OGGI:
- Totale: €${totalRevenue.toLocaleString('it-IT')}
- Per azienda: ${companyRevenue}

AGENTI AI:
- Attivi: ${activeAgents}/${agents.length}
- In errore: ${errorAgents}
- Escalation WhatsApp pendenti: ${pendingWa}

SISTEMA:
- Bug aperti: ${openBugs}

AGENDA (prossimi eventi):
${eventList || '- Nessun evento'}

TASK APERTI (${pendingTasks.length}):
${taskList || '- Nessun task'}

NOTIFICHE NON LETTE:
${notifList || '- Nessuna notifica'}
===`
}
