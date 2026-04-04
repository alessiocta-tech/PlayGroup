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

const priorityBadge: Record<string, string> = {
  urgent: 'bg-red-100 text-red-600',
  high: 'bg-orange-100 text-orange-600',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-500',
}

const statusDot: Record<string, string> = {
  active: 'bg-green-400',
  idle: 'bg-gray-300',
  error: 'bg-red-400',
  paused: 'bg-yellow-400',
}

const statusLabel: Record<string, string> = {
  active: 'Attivo',
  idle: 'Inattivo',
  error: 'Errore',
  paused: 'In pausa',
}

export default async function AdminDashboard() {
  const d = await getDashboardData()

  const revenueChange = d.totalRevenueYesterday > 0
    ? ((d.totalRevenueToday - d.totalRevenueYesterday) / d.totalRevenueYesterday) * 100
    : 0

  const now = new Date()
  const ora = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  const dataOggi = now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="space-y-5">

      {/* ── HEADER ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] capitalize">{dataOggi}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Ore {ora} · Benvenuto, Alessio</p>
        </div>
        <Link
          href="/admin/agenti"
          className="bg-[#111111] text-white text-sm font-bold px-5 py-2.5 rounded-2xl hover:bg-[#222] transition-colors"
        >
          + Nuova azione
        </Link>
      </div>

      {/* ── KPI BAR ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Incasso */}
        <div className="bg-[#111111] rounded-3xl p-6 text-white col-span-1">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Incasso oggi</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${revenueChange >= 0 ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
              {revenueChange >= 0 ? '+' : ''}{revenueChange.toFixed(1)}%
            </span>
          </div>
          <div className="text-4xl font-extrabold tracking-tight">
            €{d.totalRevenueToday.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            ieri €{d.totalRevenueYesterday.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
          </div>
        </div>

        {/* Agenti AI */}
        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Agenti AI</span>
            {d.errorAgents > 0 && (
              <span className="w-2 h-2 bg-red-400 rounded-full" />
            )}
          </div>
          <div className="text-4xl font-extrabold text-[#111111] tracking-tight">{d.activeAgents}</div>
          <div className="text-xs text-gray-400 mt-1">
            {d.errorAgents > 0
              ? <span className="text-red-500">{d.errorAgents} in errore</span>
              : 'Tutti operativi'
            }
          </div>
        </div>

        {/* WhatsApp */}
        <div className={`rounded-3xl p-6 ${d.pendingWa > 0 ? 'bg-red-50' : 'bg-white'}`}>
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">WA escalation</span>
            {d.pendingWa > 0 && <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />}
          </div>
          <div className={`text-4xl font-extrabold tracking-tight ${d.pendingWa > 0 ? 'text-red-500' : 'text-[#111111]'}`}>
            {d.pendingWa}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {d.pendingWa > 0 ? 'Da gestire manualmente' : 'Nessuna escalation'}
          </div>
        </div>

        {/* Bug aperti */}
        <div className="bg-[#F0C040] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-[#111111]/50 uppercase tracking-wide">Bug aperti</span>
          </div>
          <div className="text-4xl font-extrabold text-[#111111] tracking-tight">{d.openBugs}</div>
          <div className="text-xs text-[#111111]/50 mt-1">Su tutti i progetti</div>
        </div>
      </div>

      {/* ── RIGA 2: Aziende + Notifiche ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Aziende — incassi */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-[#111111]">Aziende — incassi oggi</h2>
            <Link href="/admin/aziende" className="text-xs font-semibold text-gray-400 hover:text-[#111111] transition-colors">
              Vedi tutto →
            </Link>
          </div>
          <div className="space-y-4">
            {d.companies.map((company) => {
              const kpi = d.todayKpi.find((k) => k.companyId === company.id)
              const revenue = kpi?.revenue.toNumber() ?? 0
              const maxRevenue = Math.max(...d.companies.map((c) => {
                const k = d.todayKpi.find((kk) => kk.companyId === c.id)
                return k?.revenue.toNumber() ?? 0
              }), 1)
              const pct = Math.round((revenue / maxRevenue) * 100)
              return (
                <div key={company.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: company.color }} />
                      <span className="text-sm font-semibold text-[#111111]">{company.name}</span>
                      <span className="text-xs text-gray-400 capitalize">{company.type}</span>
                    </div>
                    <div className="text-sm font-extrabold text-[#111111]">
                      €{revenue.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
                    </div>
                  </div>
                  <div className="h-1.5 bg-[#EFEFEA] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: company.color }}
                    />
                  </div>
                  {kpi && kpi.bookings > 0 && (
                    <div className="text-xs text-gray-400 mt-1">{kpi.bookings} prenotazioni</div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Notifiche */}
        <div className="bg-[#111111] rounded-3xl p-6 text-white">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold">Notifiche</h2>
            {d.notifications.length > 0 && (
              <span className="text-xs bg-[#F0C040] text-[#111111] font-bold px-2.5 py-0.5 rounded-full">
                {d.notifications.length}
              </span>
            )}
          </div>
          <div className="space-y-4">
            {d.notifications.length === 0 && (
              <div className="text-center py-6">
                <div className="text-2xl mb-2">✓</div>
                <p className="text-sm text-gray-500">Nessuna notifica</p>
              </div>
            )}
            {d.notifications.map((n) => (
              <div key={n.id} className="flex gap-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                  n.priority === 'critical' ? 'bg-red-400' :
                  n.priority === 'high' ? 'bg-orange-400' : 'bg-[#F0C040]'
                }`} />
                <div>
                  <div className="text-xs font-semibold">{n.title}</div>
                  {n.body && <div className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGA 3: Agenti + Task + Agenda ── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Agenti AI */}
        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-[#111111]">Agenti AI</h2>
            <Link href="/admin/agenti" className="text-xs font-semibold text-gray-400 hover:text-[#111111] transition-colors">
              Gestisci →
            </Link>
          </div>
          <div className="space-y-3">
            {d.agents.length === 0 && (
              <p className="text-sm text-gray-400">Nessun agente configurato</p>
            )}
            {d.agents.map((agent) => {
              const rate = agent.totalHandled > 0
                ? Math.round((agent.resolvedCount / agent.totalHandled) * 100)
                : 0
              return (
                <div key={agent.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot[agent.status] ?? 'bg-gray-300'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#111111] truncate">{agent.name}</div>
                    <div className="text-xs text-gray-400">{statusLabel[agent.status]} · {rate}% risolti</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Task aperti */}
        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-[#111111]">Task aperti</h2>
            <Link href="/admin/calendario" className="text-xs font-semibold text-gray-400 hover:text-[#111111] transition-colors">
              Vedi tutti →
            </Link>
          </div>
          <div className="space-y-2">
            {d.pendingTasks.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400">Nessun task aperto</p>
              </div>
            )}
            {d.pendingTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className={`text-xs px-2 py-0.5 rounded-lg font-bold flex-shrink-0 mt-0.5 ${priorityBadge[task.priority]}`}>
                  {task.priority === 'urgent' ? 'URG' : task.priority.slice(0, 3).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-[#111111] leading-snug">{task.title}</div>
                  {task.dueDate && (
                    <div className="text-xs text-gray-400 mt-0.5">
                      {new Date(task.dueDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prossimi eventi */}
        <div className="bg-[#F0C040] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-[#111111]">Prossimi eventi</h2>
            <Link href="/admin/calendario" className="text-xs font-semibold text-[#111111]/50 hover:text-[#111111] transition-colors">
              Calendario →
            </Link>
          </div>
          <div className="space-y-3">
            {d.upcomingEvents.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-[#111111]/50">Nessun evento in programma</p>
              </div>
            )}
            {d.upcomingEvents.map((event) => (
              <div key={event.id} className="flex gap-4 items-start py-2 border-b border-[#111111]/10 last:border-0">
                <div className="bg-[#111111] rounded-2xl px-3 py-2 text-center flex-shrink-0">
                  <div className="text-xl font-extrabold text-[#F0C040] leading-none">
                    {new Date(event.startAt).getDate()}
                  </div>
                  <div className="text-xs text-gray-400 uppercase mt-0.5">
                    {new Date(event.startAt).toLocaleDateString('it-IT', { month: 'short' })}
                  </div>
                </div>
                <div className="min-w-0 pt-1">
                  <div className="text-sm font-semibold text-[#111111] leading-snug">{event.title}</div>
                  {event.location && (
                    <div className="text-xs text-[#111111]/50 mt-0.5">{event.location}</div>
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
