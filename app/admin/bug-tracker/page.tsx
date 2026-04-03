import { prisma } from '@/lib/prisma'

const severityColor: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-500',
}

export default async function BugTrackerPage() {
  const [bugs, companies] = await Promise.all([
    prisma.bug.findMany({
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.company.findMany(),
  ])

  const companyMap = companies.reduce<Record<string, string>>((acc, c) => {
    acc[c.id] = c.name
    return acc
  }, {})

  const open = bugs.filter((b) => b.status === 'open')
  const inProgress = bugs.filter((b) => b.status === 'in_progress')
  const resolved = bugs.filter(
    (b) => b.status === 'resolved' || b.status === 'closed',
  )
  const critical = bugs.filter(
    (b) =>
      b.severity === 'critical' &&
      b.status !== 'resolved' &&
      b.status !== 'closed',
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Bug Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">Issue tracker per tutti i progetti</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <div className="text-xs text-gray-400 mb-1">Bug totali</div>
          <div className="text-3xl font-extrabold">{bugs.length}</div>
        </div>
        <div className={`rounded-2xl p-5 ${critical.length > 0 ? 'bg-red-50' : 'bg-white'}`}>
          <div className="text-xs text-gray-400 mb-1">Critici aperti</div>
          <div
            className={`text-3xl font-extrabold ${
              critical.length > 0 ? 'text-red-500' : 'text-[#111111]'
            }`}
          >
            {critical.length}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-1">In lavorazione</div>
          <div className="text-3xl font-extrabold text-[#111111]">{inProgress.length}</div>
        </div>
        <div className="bg-[#F0C040] rounded-2xl p-5">
          <div className="text-xs text-[#111111]/60 mb-1">Risolti</div>
          <div className="text-3xl font-extrabold text-[#111111]">{resolved.length}</div>
        </div>
      </div>

      {/* Kanban */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Open */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <h2 className="font-extrabold text-[#111111]">Aperti</h2>
            <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full ml-auto">
              {open.length}
            </span>
          </div>
          <div className="space-y-2">
            {open.length === 0 && (
              <p className="text-sm text-gray-400">Nessun bug aperto</p>
            )}
            {open.map((bug) => (
              <div key={bug.id} className="p-3 bg-[#EFEFEA] rounded-xl">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                      severityColor[bug.severity] ?? 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {bug.severity}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{bug.project}</span>
                </div>
                <div className="text-sm font-semibold text-[#111111] leading-snug">
                  {bug.title}
                </div>
                {bug.description && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {bug.description}
                  </div>
                )}
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-400">
                    {new Date(bug.createdAt).toLocaleDateString('it-IT')}
                  </div>
                  {bug.companyId && companyMap[bug.companyId] && (
                    <div className="text-xs text-gray-400">{companyMap[bug.companyId]}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <h2 className="font-extrabold text-[#111111]">In lavorazione</h2>
            <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full ml-auto">
              {inProgress.length}
            </span>
          </div>
          <div className="space-y-2">
            {inProgress.length === 0 && (
              <p className="text-sm text-gray-400">Nessun bug in lavorazione</p>
            )}
            {inProgress.map((bug) => (
              <div key={bug.id} className="p-3 bg-[#EFEFEA] rounded-xl">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                      severityColor[bug.severity] ?? 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {bug.severity}
                  </span>
                  <span className="text-xs text-gray-400 flex-shrink-0">{bug.project}</span>
                </div>
                <div className="text-sm font-semibold text-[#111111] leading-snug">
                  {bug.title}
                </div>
                {bug.description && (
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {bug.description}
                  </div>
                )}
                {bug.companyId && companyMap[bug.companyId] && (
                  <div className="text-xs text-gray-400 mt-2">{companyMap[bug.companyId]}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <h2 className="font-extrabold text-[#111111]">Risolti</h2>
            <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full ml-auto">
              {resolved.length}
            </span>
          </div>
          <div className="space-y-2">
            {resolved.length === 0 && (
              <p className="text-sm text-gray-400">Nessun bug risolto</p>
            )}
            {resolved.map((bug) => (
              <div key={bug.id} className="p-3 bg-green-50 rounded-xl opacity-75">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-xs text-gray-400">{bug.project}</span>
                  {bug.resolvedAt && (
                    <span className="text-xs text-green-600">
                      {new Date(bug.resolvedAt).toLocaleDateString('it-IT')}
                    </span>
                  )}
                </div>
                <div className="text-sm font-semibold text-[#111111] leading-snug line-through opacity-60">
                  {bug.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
