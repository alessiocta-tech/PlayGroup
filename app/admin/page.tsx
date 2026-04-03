import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const [
    companies,
    todayKpi,
    yesterdayKpi,
    agents,
    pendingWa,
    openBugs,
    upcomingEvents,
    pendingTasks,
    notifications,
  ] = await Promise.all([
    prisma.company.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.dailyKpi.findMany({ where: { date: today } }),
    prisma.dailyKpi.findMany({ where: { date: yesterday } }),
    prisma.agent.findMany({ orderBy: { name: 'asc' } }),
    prisma.waMessage.count({ where: { direction: 'inbound', escalated: true, handledByAi: false } }),
    prisma.bug.count({ where: { status: { in: ['open', 'in_progress'] } } }),
    prisma.event.findMany({
      where: { startAt: { gte: new Date() } },
      orderBy: { startAt: 'asc' },
      take: 5,
    }),
    prisma.task.findMany({
      where: { status: { in: ['open', 'in_progress'] } },
      orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
      take: 5,
    }),
    prisma.notification.findMany({
      where: { read: false },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ])

  const totalRevenueToday = todayKpi.reduce((sum, k) => sum + k.revenue.toNumber(), 0)
  const totalRevenueYesterday = yesterdayKpi.reduce((sum, k) => sum + k.revenue.toNumber(), 0)
  const activeAgents = agents.filter((a) => a.status === 'active').length
  const errorAgents = agents.filter((a) => a.status === 'error').length

  return {
    companies,
    todayKpi,
    totalRevenueToday,
    totalRevenueYesterday,
    agents,
    activeAgents,
    errorAgents,
    pendingWa,
    openBugs,
    upcomingEvents,
    pendingTasks,
    notifications,
  }
}

const priorityColor: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-500',
}

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  idle: 'bg-gray-100 text-gray-500',
  error: 'bg-red-100 text-red-700',
  paused: 'bg-yellow-100 text-yellow-700',
}

export default async function AdminDashboard() {
  const d = await getDashboardData()

  const revenueChange = d.totalRevenueYesterday > 0
    ? ((d.totalRevenueToday - d.totalRevenueYesterday) / d.totalRevenueYesterday) * 100
    : 0

  return (
    <div className="space-y-6">

      {/* KPI Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <div className="text-xs text-gray-400 mb-1">Incasso oggi</div>
          <div className="text-3xl font-extrabold">
            €{d.totalRevenueToday.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
          </div>
          <div className={`text-xs mt-1 font-medium ${revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}% vs ieri
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-1">Agenti AI</div>
          <div className="text-3xl font-extrabold text-[#111111]">{d.activeAgents}</div>
          <div className="text-xs mt-1 text-gray-500">
            attivi · {d.errorAgents > 0 ? <span className="text-red-500">{d.errorAgents} in errore</span> : 'nessun errore'}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-1">WhatsApp escalation</div>
          <div className={`text-3xl font-extrabold ${d.pendingWa > 0 ? 'text-red-500' : 'text-[#111111]'}`}>
            {d.pendingWa}
          </div>
          <div className="text-xs mt-1 text-gray-500">da gestire manualmente</div>
        </div>

        <div className="bg-[#F0C040] rounded-2xl p-5">
          <div className="text-xs text-[#111111]/60 mb-1">Bug aperti</div>
          <div className="text-3xl font-extrabold text-[#111111]">{d.openBugs}</div>
          <div className="text-xs mt-1 text-[#111111]/60">su tutti i progetti</div>
        </div>
      </div>

      {/* Grid principale */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Aziende KPI */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[#111111]">Aziende — incassi oggi</h2>
            <Link href="/admin/aziende" className="text-xs text-gray-400 hover:text-[#111111]">Vedi tutto →</Link>
          </div>
          <div className="space-y-3">
            {d.companies.map((company) => {
              const kpi = d.todayKpi.find((k) => k.companyId === company.id)
              const revenue = kpi?.revenue.toNumber() ?? 0
              return (
                <div key={company.id} className="flex items-center gap-4">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: company.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#111111] truncate">{company.name}</div>
                    <div className="text-xs text-gray-400 capitalize">{company.type}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-extrabold text-[#111111]">
                      €{revenue.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
                    </div>
                    {kpi && kpi.bookings > 0 && (
                      <div className="text-xs text-gray-400">{kpi.bookings} prenotazioni</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Notifiche */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[#111111]">Notifiche</h2>
            <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">
              {d.notifications.length}
            </span>
          </div>
          <div className="space-y-3">
            {d.notifications.length === 0 && (
              <p className="text-sm text-gray-400">Nessuna notifica</p>
            )}
            {d.notifications.map((n) => (
              <div key={n.id} className="flex gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  n.priority === 'critical' ? 'bg-red-500' :
                  n.priority === 'high' ? 'bg-orange-400' : 'bg-yellow-400'
                }`} />
                <div>
                  <div className="text-xs font-semibold text-[#111111]">{n.title}</div>
                  <div className="text-xs text-gray-400 mt-0.5 leading-snug">{n.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agenti + Task + Agenda */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Agenti AI */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[#111111]">Agenti AI</h2>
            <Link href="/admin/agenti" className="text-xs text-gray-400 hover:text-[#111111]">Gestisci →</Link>
          </div>
          <div className="space-y-3">
            {d.agents.map((agent) => {
              const rate = agent.totalHandled > 0
                ? Math.round((agent.resolvedCount / agent.totalHandled) * 100)
                : 0
              return (
                <div key={agent.id} className="flex items-start gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg mt-0.5 flex-shrink-0 ${statusColor[agent.status]}`}>
                    {agent.status}
                  </span>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#111111] truncate">{agent.name}</div>
                    <div className="text-xs text-gray-400">{rate}% risolti</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Task */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold text-[#111111]">Task aperti</h2>
            <Link href="/admin/calendario" className="text-xs text-gray-400 hover:text-[#111111]">Vedi tutti →</Link>
          </div>
          <div className="space-y-2">
            {d.pendingTasks.length === 0 && (
              <p className="text-sm text-gray-400">Nessun task aperto</p>
            )}
            {d.pendingTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-2">
                <span className={`text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0 mt-0.5 ${priorityColor[task.priority]}`}>
                  {task.priority}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#111111] leading-snug">{task.title}</div>
                  {task.dueDate && (
                    <div className="text-xs text-gray-400">
                      Scadenza: {new Date(task.dueDate).toLocaleDateString('it-IT')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prossimi eventi */}
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-extrabold">Prossimi eventi</h2>
            <Link href="/admin/calendario" className="text-xs text-gray-400 hover:text-white">Calendario →</Link>
          </div>
          <div className="space-y-3">
            {d.upcomingEvents.length === 0 && (
              <p className="text-sm text-gray-500">Nessun evento</p>
            )}
            {d.upcomingEvents.map((event) => (
              <div key={event.id} className="flex gap-3">
                <div className="text-center flex-shrink-0 w-10">
                  <div className="text-lg font-extrabold text-[#F0C040]">
                    {new Date(event.startAt).getDate()}
                  </div>
                  <div className="text-xs text-gray-500 uppercase">
                    {new Date(event.startAt).toLocaleDateString('it-IT', { month: 'short' })}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold leading-snug">{event.title}</div>
                  {event.location && (
                    <div className="text-xs text-gray-500 mt-0.5">{event.location}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}
