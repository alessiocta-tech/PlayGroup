import { prisma } from '@/lib/prisma'

export default async function AziendePage() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const [companies, kpiToday, kpiWeek] = await Promise.all([
    prisma.company.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.dailyKpi.findMany({ where: { date: today } }),
    prisma.dailyKpi.findMany({
      where: { date: { gte: sevenDaysAgo } },
      orderBy: { date: 'desc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Aziende</h1>
          <p className="text-sm text-gray-500 mt-1">KPI e incassi per azienda</p>
        </div>
      </div>

      {/* Company cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {companies.map((company) => {
          const kpi = kpiToday.find((k) => k.companyId === company.id)
          const revenue = kpi?.revenue.toNumber() ?? 0
          const weekRevenue = kpiWeek
            .filter((k) => k.companyId === company.id)
            .reduce((sum, k) => sum + k.revenue.toNumber(), 0)
          return (
            <div key={company.id} className="bg-white rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: company.color }}
                />
                <div className="min-w-0">
                  <div className="font-extrabold text-[#111111] text-sm truncate">{company.name}</div>
                  <div className="text-xs text-gray-400 capitalize">{company.type}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-gray-400">Incasso oggi</div>
                  <div className="text-2xl font-extrabold text-[#111111]">
                    €{revenue.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
                  </div>
                </div>
                {kpi && kpi.bookings > 0 && (
                  <div className="text-xs text-gray-500">{kpi.bookings} prenotazioni</div>
                )}
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-400">Settimana</div>
                  <div className="text-sm font-extrabold text-[#111111]">
                    €{weekRevenue.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* KPI Table last 7 days */}
      <div className="bg-white rounded-2xl p-5">
        <h2 className="font-extrabold text-[#111111] mb-4">KPI ultimi 7 giorni</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 pr-4 text-xs font-semibold text-gray-400">Azienda</th>
                {Array.from({ length: 7 }, (_, i) => {
                  const d = new Date(today)
                  d.setDate(d.getDate() - (6 - i))
                  return (
                    <th key={i} className="text-right py-2 px-2 text-xs font-semibold text-gray-400">
                      {d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit' })}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id} className="border-b border-gray-50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: company.color }}
                      />
                      <span className="font-semibold text-[#111111] text-xs">{company.name}</span>
                    </div>
                  </td>
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date(today)
                    d.setDate(d.getDate() - (6 - i))
                    const dayStr = d.toISOString().split('T')[0]
                    const kpi = kpiWeek.find(
                      (k) =>
                        k.companyId === company.id &&
                        k.date.toISOString().split('T')[0] === dayStr
                    )
                    const rev = kpi?.revenue.toNumber() ?? 0
                    return (
                      <td key={i} className="py-3 px-2 text-right">
                        <span
                          className={`text-xs font-semibold ${
                            rev > 0 ? 'text-[#111111]' : 'text-gray-300'
                          }`}
                        >
                          {rev > 0
                            ? `€${rev.toLocaleString('it-IT', { minimumFractionDigits: 0 })}`
                            : '—'}
                        </span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
