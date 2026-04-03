import { prisma } from '@/lib/prisma'

const statusColor: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  idle: 'bg-gray-100 text-gray-500',
  error: 'bg-red-100 text-red-700',
  paused: 'bg-yellow-100 text-yellow-700',
}

const statusDot: Record<string, string> = {
  active: 'bg-green-400',
  idle: 'bg-gray-400',
  error: 'bg-red-400',
  paused: 'bg-yellow-400',
}

export default async function AgentiPage() {
  const agents = await prisma.agent.findMany({
    orderBy: { name: 'asc' },
    include: {
      logs: {
        orderBy: { timestamp: 'desc' },
        take: 3,
      },
    },
  })

  const activeCount = agents.filter((a) => a.status === 'active').length
  const errorCount = agents.filter((a) => a.status === 'error').length
  const totalResolved = agents.reduce((s, a) => s + a.resolvedCount, 0)
  const totalHandled = agents.reduce((s, a) => s + a.totalHandled, 0)
  const avgRate = totalHandled > 0 ? Math.round((totalResolved / totalHandled) * 100) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111]">Agenti AI</h1>
        <p className="text-sm text-gray-500 mt-1">Stato e performance degli agenti automatici</p>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <div className="text-xs text-gray-400 mb-1">Attivi ora</div>
          <div className="text-3xl font-extrabold">{activeCount}</div>
          <div className="text-xs text-gray-500 mt-1">su {agents.length} totali</div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-1">Tasso medio</div>
          <div className="text-3xl font-extrabold text-[#111111]">{avgRate}%</div>
          <div className="text-xs text-gray-500 mt-1">risoluzione autonoma</div>
        </div>
        <div className={`rounded-2xl p-5 ${errorCount > 0 ? 'bg-red-50' : 'bg-white'}`}>
          <div className="text-xs text-gray-400 mb-1">In errore</div>
          <div
            className={`text-3xl font-extrabold ${
              errorCount > 0 ? 'text-red-500' : 'text-[#111111]'
            }`}
          >
            {errorCount}
          </div>
          <div className="text-xs text-gray-500 mt-1">agenti da verificare</div>
        </div>
      </div>

      {/* Agent cards */}
      <div className="grid lg:grid-cols-2 gap-4">
        {agents.map((agent) => {
          const rate =
            agent.totalHandled > 0
              ? Math.round((agent.resolvedCount / agent.totalHandled) * 100)
              : 0
          return (
            <div key={agent.id} className="bg-white rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
                      statusDot[agent.status] ?? 'bg-gray-400'
                    }`}
                  />
                  <div>
                    <div className="font-extrabold text-[#111111]">{agent.name}</div>
                    <div className="text-xs text-gray-400">{agent.type}</div>
                  </div>
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-lg ${
                    statusColor[agent.status] ?? 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {agent.status}
                </span>
              </div>

              {agent.currentTask && (
                <div className="text-xs text-gray-500 mb-3 bg-[#EFEFEA] rounded-lg px-3 py-2">
                  {agent.currentTask}
                </div>
              )}

              {/* Resolution rate bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Tasso risoluzione</span>
                  <span className="font-semibold text-[#111111]">{rate}%</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#F0C040]"
                    style={{ width: `${rate}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1 text-gray-400">
                  <span>{agent.resolvedCount} risolti</span>
                  <span>{agent.totalHandled} totali</span>
                </div>
              </div>

              {agent.lastActive && (
                <div className="text-xs text-gray-400 mb-3">
                  Ultima attività:{' '}
                  {new Date(agent.lastActive).toLocaleString('it-IT')}
                </div>
              )}

              {/* Recent logs */}
              {agent.logs.length > 0 && (
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <div className="text-xs font-semibold text-gray-400">Log recenti</div>
                  {agent.logs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                          log.resolved
                            ? 'bg-green-400'
                            : log.escalated
                            ? 'bg-red-400'
                            : 'bg-gray-300'
                        }`}
                      />
                      <div className="min-w-0">
                        <div className="text-xs text-gray-600 truncate">
                          {log.input ?? '—'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(log.timestamp).toLocaleString('it-IT')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
