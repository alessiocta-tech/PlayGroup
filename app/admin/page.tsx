import { prisma } from '@/lib/prisma'
import Link from 'next/link'

async function getDashboardData() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [
    companies,
    todayKpi,
    yesterdayKpi,
    weekKpi,
    agents,
    pendingWa,
    openBugs,
    upcomingEvents,
    pendingTasks,
    notifications,
    totalContacts,
  ] = await Promise.all([
    prisma.company.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.dailyKpi.findMany({ where: { date: today } }),
    prisma.dailyKpi.findMany({ where: { date: yesterday } }),
    prisma.dailyKpi.findMany({ where: { date: { gte: weekAgo } } }),
    prisma.agent.findMany({ orderBy: { name: 'asc' } }),
    prisma.waMessage.count({ where: { direction: 'inbound', escalated: true, handledByAi: false } }),
    prisma.bug.count({ where: { status: { in: ['open', 'in_progress'] } } }),
    prisma.event.findMany({
      where: { startAt: { gte: new Date() } },
      orderBy: { startAt: 'asc' },
      take: 4,
    }),
    prisma.task.findMany({
      where: { status: { in: ['open', 'in_progress'] } },
      orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
      take: 6,
    }),
    prisma.notification.findMany({
      where: { read: false },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.contact.count(),
  ])

  const totalRevenueToday = todayKpi.reduce((s, k) => s + k.revenue.toNumber(), 0)
  const totalRevenueYesterday = yesterdayKpi.reduce((s, k) => s + k.revenue.toNumber(), 0)
  const totalRevenueWeek = weekKpi.reduce((s, k) => s + k.revenue.toNumber(), 0)
  const activeAgents = agents.filter((a) => a.status === 'active').length
  const errorAgents = agents.filter((a) => a.status === 'error').length
  const revenueChange = totalRevenueYesterday > 0
    ? ((totalRevenueToday - totalRevenueYesterday) / totalRevenueYesterday) * 100
    : 0

  // Weekly revenue by day (last 7 days)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    const label = d.toLocaleDateString('it-IT', { weekday: 'short' }).slice(0, 1).toUpperCase()
    const rev = weekKpi
      .filter((k) => new Date(k.date).toDateString() === d.toDateString())
      .reduce((s, k) => s + k.revenue.toNumber(), 0)
    return { label, rev, date: d }
  })
  const maxWeekRev = Math.max(...weekDays.map((d) => d.rev), 1)

  return {
    companies, todayKpi, totalRevenueToday, totalRevenueYesterday, totalRevenueWeek,
    agents, activeAgents, errorAgents, pendingWa, openBugs,
    upcomingEvents, pendingTasks, notifications, totalContacts,
    revenueChange, weekDays, maxWeekRev,
  }
}

const priorityColor: Record<string, string> = {
  urgent: 'bg-red-400',
  high: 'bg-orange-400',
  medium: 'bg-[#F0C040]',
  low: 'bg-gray-300',
}

const agentDot: Record<string, string> = {
  active: 'bg-green-400',
  idle: 'bg-gray-400',
  error: 'bg-red-400',
  paused: 'bg-yellow-400',
}

export default async function AdminDashboard() {
  const d = await getDashboardData()

  const now = new Date()
  const ora = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
  const dataOggi = now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' })

  const totalBookingsToday = d.todayKpi.reduce((s, k) => s + k.bookings, 0)
  const resolvedWa = d.agents.reduce((s, a) => s + a.resolvedCount, 0)
  const totalWa = d.agents.reduce((s, a) => s + a.totalHandled, 0)
  const waRate = totalWa > 0 ? Math.round((resolvedWa / totalWa) * 100) : 0

  return (
    <div className="space-y-4">

      {/* ── TOP HEADER ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111] capitalize">{dataOggi}</h1>
          <p className="text-sm text-gray-400 mt-0.5">Ore {ora} · Benvenuto, Alessio</p>
        </div>
        {/* Big stats right */}
        <div className="flex items-center gap-8">
          {[
            { label: 'Aziende', value: d.companies.length },
            { label: 'Agenti AI', value: d.agents.length },
            { label: 'Task aperti', value: d.pendingTasks.length },
            { label: 'Contatti', value: d.totalContacts },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-[#111111] leading-none">{s.value}</div>
              <div className="text-xs text-gray-400 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PROGRESS PILLS ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Agenti attivi', value: d.agents.length > 0 ? Math.round((d.activeAgents / d.agents.length) * 100) : 0, color: 'bg-[#111111]' },
          { label: 'WA risolti AI', value: waRate, color: 'bg-[#F0C040]' },
          { label: 'Prenotazioni', value: Math.min(totalBookingsToday * 2, 100), color: 'bg-[#111111]' },
          { label: 'Incasso vs ieri', value: Math.min(Math.abs(d.revenueChange), 100), color: 'bg-[#F0C040]' },
        ].map((p) => (
          <div key={p.label} className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-400 mb-1.5">{p.label}</div>
              <div className="h-2 bg-[#EFEFEA] rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${p.color}`} style={{ width: `${p.value}%` }} />
              </div>
            </div>
            <div className="text-sm font-extrabold text-[#111111] flex-shrink-0">{p.value}%</div>
          </div>
        ))}
      </div>

      {/* ── MAIN GRID ── */}
      <div className="grid grid-cols-4 gap-4">

        {/* ── COL 1: Hero card ── */}
        <div className="bg-[#111111] rounded-3xl p-6 flex flex-col justify-between min-h-[340px]">
          <div>
            <div className="w-10 h-10 bg-[#F0C040] rounded-2xl flex items-center justify-center mb-4">
              <span className="text-xs font-extrabold text-[#111111]">PG</span>
            </div>
            <div className="text-white text-lg font-extrabold leading-tight">Play Group</div>
            <div className="text-gray-500 text-xs mt-1">Sistema operativo</div>
          </div>

          <div className="space-y-3 mt-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Incasso oggi</div>
              <div className="text-3xl font-extrabold text-white">
                €{d.totalRevenueToday.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
              </div>
              <div className={`text-xs mt-0.5 font-semibold ${d.revenueChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {d.revenueChange >= 0 ? '+' : ''}{d.revenueChange.toFixed(1)}% vs ieri
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <div>
                <div className="text-xs text-gray-500">Settimana</div>
                <div className="text-sm font-extrabold text-[#F0C040]">
                  €{d.totalRevenueWeek.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Prenotazioni</div>
                <div className="text-sm font-extrabold text-white">{totalBookingsToday}</div>
              </div>
            </div>
          </div>

          <Link
            href="/admin/contabilita"
            className="mt-4 text-xs text-gray-500 hover:text-[#F0C040] transition-colors font-semibold"
          >
            Vedi contabilità →
          </Link>
        </div>

        {/* ── COL 2: Revenue bar chart ── */}
        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-extrabold text-[#111111]">Incassi settimana</h2>
            <Link href="/admin/aziende" className="text-xs text-gray-400 hover:text-[#111111]">→</Link>
          </div>
          <div className="text-xs text-gray-400 mb-5">Totale per giorno</div>

          {/* Bar chart */}
          <div className="flex items-end justify-between gap-1.5 h-28 mb-3">
            {d.weekDays.map((day, i) => {
              const isToday = i === 6
              const pct = Math.round((day.rev / d.maxWeekRev) * 100)
              return (
                <div key={day.label} className="flex flex-col items-center gap-1 flex-1">
                  {isToday && day.rev > 0 && (
                    <div className="text-[9px] font-bold text-[#111111] whitespace-nowrap">
                      €{(day.rev / 1000).toFixed(1)}k
                    </div>
                  )}
                  <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                    <div
                      className={`w-full rounded-lg transition-all ${isToday ? 'bg-[#F0C040]' : 'bg-[#EFEFEA]'}`}
                      style={{ height: `${Math.max(pct, 5)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-between">
            {d.weekDays.map((day) => (
              <div key={day.label} className="flex-1 text-center text-[10px] text-gray-400 font-medium">
                {day.label}
              </div>
            ))}
          </div>

          {/* Aziende breakdown */}
          <div className="mt-4 space-y-2 pt-4 border-t border-gray-50">
            {d.companies.slice(0, 3).map((company) => {
              const kpi = d.todayKpi.find((k) => k.companyId === company.id)
              const rev = kpi?.revenue.toNumber() ?? 0
              const maxRev = Math.max(...d.companies.map((c) => {
                const k = d.todayKpi.find((kk) => kk.companyId === c.id)
                return k?.revenue.toNumber() ?? 0
              }), 1)
              const pct = Math.round((rev / maxRev) * 100)
              return (
                <div key={company.id} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: company.color }} />
                  <div className="text-xs text-gray-500 w-20 truncate">{company.name}</div>
                  <div className="flex-1 h-1.5 bg-[#EFEFEA] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: company.color }} />
                  </div>
                  <div className="text-xs font-bold text-[#111111] w-14 text-right">
                    €{(rev / 1000).toFixed(1)}k
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── COL 3: Agenti AI ── */}
        <div className="bg-white rounded-3xl p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-extrabold text-[#111111]">Agenti AI</h2>
            <Link href="/admin/agenti" className="text-xs text-gray-400 hover:text-[#111111]">→</Link>
          </div>
          <div className="text-xs text-gray-400 mb-5">{d.activeAgents} attivi su {d.agents.length}</div>

          {/* Ring */}
          <div className="flex justify-center mb-5">
            <div className="relative w-24 h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="none" stroke="#EFEFEA" strokeWidth="3" />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke="#F0C040" strokeWidth="3"
                  strokeDasharray={`${d.agents.length > 0 ? (d.activeAgents / d.agents.length) * 87.96 : 0} 87.96`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-xl font-extrabold text-[#111111] leading-none">{waRate}%</div>
                <div className="text-[9px] text-gray-400 mt-0.5">risolti</div>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {d.agents.slice(0, 4).map((agent) => (
              <div key={agent.id} className="flex items-center gap-2.5">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${agentDot[agent.status] ?? 'bg-gray-300'}`} />
                <div className="text-xs font-medium text-[#111111] flex-1 truncate">{agent.name}</div>
                <div className="text-xs text-gray-400 font-semibold">
                  {agent.totalHandled > 0 ? Math.round((agent.resolvedCount / agent.totalHandled) * 100) : 0}%
                </div>
              </div>
            ))}
          </div>

          {d.errorAgents > 0 && (
            <div className="mt-4 bg-red-50 rounded-xl px-3 py-2 text-xs text-red-500 font-semibold">
              {d.errorAgents} agente{d.errorAgents > 1 ? 'i' : ''} in errore
            </div>
          )}
        </div>

        {/* ── COL 4: Task list dark ── */}
        <div className="bg-[#111111] rounded-3xl p-6 text-white">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-extrabold">Task aperti</h2>
            <span className="text-xs bg-[#F0C040] text-[#111111] font-bold px-2.5 py-0.5 rounded-full">
              {d.pendingTasks.length}
            </span>
          </div>
          <div className="text-xs text-gray-500 mb-5">Priorità decrescente</div>

          <div className="space-y-3">
            {d.pendingTasks.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">Nessun task aperto</p>
            )}
            {d.pendingTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 pb-3 border-b border-white/[0.06] last:border-0 last:pb-0">
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5 ${priorityColor[task.priority] ?? 'bg-gray-400'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold leading-snug">{task.title}</div>
                  {task.dueDate && (
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {new Date(task.dueDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'short' })}
                    </div>
                  )}
                </div>
                <div className="w-4 h-4 rounded-md border border-white/20 flex-shrink-0 mt-0.5" />
              </div>
            ))}
          </div>

          <Link
            href="/admin/calendario"
            className="mt-5 block text-xs text-gray-500 hover:text-[#F0C040] transition-colors font-semibold"
          >
            Vedi calendario →
          </Link>
        </div>
      </div>

      {/* ── BOTTOM ROW ── */}
      <div className="grid grid-cols-4 gap-4">

        {/* Quick links accordion-style */}
        <div className="bg-white rounded-3xl p-5 space-y-1">
          {[
            { label: 'Contabilità', href: '/admin/contabilita', sub: 'Scadenze e fatture' },
            { label: 'WhatsApp', href: '/admin/whatsapp', sub: `${d.pendingWa} escalation` },
            { label: 'CRM Contatti', href: '/admin/crm', sub: `${d.totalContacts} contatti` },
            { label: 'Bug Tracker', href: '/admin/bug-tracker', sub: `${d.openBugs} aperti` },
            { label: 'Salute', href: '/admin/salute', sub: 'Metriche settimanali' },
            { label: 'Domotica', href: '/admin/domotica', sub: 'Stato dispositivi' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[#EFEFEA] transition-colors group"
            >
              <div>
                <div className="text-sm font-semibold text-[#111111]">{item.label}</div>
                <div className="text-xs text-gray-400">{item.sub}</div>
              </div>
              <svg className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#111111] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        {/* Prossimi eventi — calendar style */}
        <div className="lg:col-span-2 bg-[#F0C040] rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-extrabold text-[#111111]">Prossimi eventi</h2>
            <Link href="/admin/calendario" className="text-xs font-semibold text-[#111111]/50 hover:text-[#111111]">
              Calendario →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {d.upcomingEvents.length === 0 && (
              <div className="col-span-2 text-center py-6">
                <p className="text-sm text-[#111111]/50">Nessun evento in programma</p>
              </div>
            )}
            {d.upcomingEvents.map((event) => {
              const start = new Date(event.startAt)
              return (
                <div key={event.id} className="bg-white/50 rounded-2xl p-4 flex gap-3">
                  <div className="bg-[#111111] rounded-xl px-3 py-2 text-center flex-shrink-0 min-w-[44px]">
                    <div className="text-lg font-extrabold text-[#F0C040] leading-none">{start.getDate()}</div>
                    <div className="text-[9px] text-gray-400 uppercase mt-0.5">
                      {start.toLocaleDateString('it-IT', { month: 'short' })}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[#111111] leading-snug">{event.title}</div>
                    {!event.allDay && (
                      <div className="text-xs text-[#111111]/50 mt-1">
                        {start.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    )}
                    {event.location && (
                      <div className="text-xs text-[#111111]/50">{event.location}</div>
                    )}
                  </div>
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
              <span className="text-xs bg-[#F0C040] text-[#111111] font-bold px-2 py-0.5 rounded-full">
                {d.notifications.length}
              </span>
            )}
          </div>
          <div className="space-y-4">
            {d.notifications.length === 0 && (
              <div className="text-center py-8">
                <div className="w-8 h-8 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">Tutto ok</p>
              </div>
            )}
            {d.notifications.map((n) => (
              <div key={n.id} className="flex gap-3 pb-4 border-b border-white/[0.06] last:border-0 last:pb-0">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  n.priority === 'critical' ? 'bg-red-400' :
                  n.priority === 'high' ? 'bg-orange-400' : 'bg-[#F0C040]'
                }`} />
                <div>
                  <div className="text-xs font-semibold">{n.title}</div>
                  {n.body && <div className="text-[10px] text-gray-500 mt-0.5 leading-snug">{n.body.slice(0, 60)}{n.body.length > 60 ? '…' : ''}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
