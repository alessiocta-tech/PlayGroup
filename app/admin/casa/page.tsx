import { prisma } from '@/lib/prisma'

export default async function CasaPage() {
  const [expenses, meetings] = await Promise.all([
    prisma.condoExpense.findMany({ orderBy: { date: 'desc' }, take: 20 }),
    prisma.condoMeeting.findMany({ orderBy: { date: 'desc' }, take: 5 }),
  ])

  const totalExpenses = expenses.reduce((s, e) => s + e.amount.toNumber(), 0)
  const unpaid = expenses.filter((e) => !e.paid)
  const unpaidTotal = unpaid.reduce((s, e) => s + e.amount.toNumber(), 0)

  const byCategory = expenses.reduce<Record<string, number>>((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount.toNumber()
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111]">Casa & Condominio</h1>
        <p className="text-sm text-gray-500 mt-1">Spese condominiali, manutenzioni e riunioni</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <div className="text-xs text-gray-400 mb-1">Spese totali</div>
          <div className="text-2xl font-extrabold">
            €{totalExpenses.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
          </div>
        </div>
        <div className={`rounded-2xl p-5 ${unpaidTotal > 0 ? 'bg-red-50' : 'bg-white'}`}>
          <div className="text-xs text-gray-400 mb-1">Da pagare</div>
          <div
            className={`text-2xl font-extrabold ${
              unpaidTotal > 0 ? 'text-red-500' : 'text-[#111111]'
            }`}
          >
            €{unpaidTotal.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-gray-500 mt-1">{unpaid.length} voci</div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-1">Riunioni</div>
          <div className="text-2xl font-extrabold text-[#111111]">{meetings.length}</div>
          <div className="text-xs text-gray-500 mt-1">registrate</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Expense list */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5">
          <h2 className="font-extrabold text-[#111111] mb-4">Spese condominiali</h2>
          <div className="space-y-2">
            {expenses.length === 0 && (
              <p className="text-sm text-gray-400">Nessuna spesa registrata</p>
            )}
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#EFEFEA]">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    e.paid ? 'bg-green-400' : 'bg-red-400'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#111111]">
                    {e.description ?? e.category}
                  </div>
                  <div className="text-xs text-gray-400">
                    {e.category} · {new Date(e.date).toLocaleDateString('it-IT')}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-sm font-extrabold text-[#111111]">
                    €{e.amount.toNumber().toLocaleString('it-IT')}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                      e.paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {e.paid ? 'pagato' : 'da pagare'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {/* Category breakdown */}
          <div className="bg-white rounded-2xl p-5">
            <h2 className="font-extrabold text-[#111111] mb-3">Per categoria</h2>
            <div className="space-y-2">
              {Object.keys(byCategory).length === 0 && (
                <p className="text-sm text-gray-400">Nessuna categoria</p>
              )}
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => (
                  <div key={cat} className="flex justify-between items-center">
                    <span className="text-xs text-gray-500 capitalize">{cat}</span>
                    <span className="text-xs font-semibold text-[#111111]">
                      €{amount.toLocaleString('it-IT')}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Meetings */}
          <div className="bg-[#111111] rounded-2xl p-5 text-white">
            <h2 className="font-extrabold mb-3">Riunioni condominiali</h2>
            <div className="space-y-3">
              {meetings.length === 0 && (
                <p className="text-sm text-gray-500">Nessuna riunione</p>
              )}
              {meetings.map((m) => (
                <div key={m.id}>
                  <div className="text-xs font-semibold text-[#F0C040]">
                    {new Date(m.date).toLocaleDateString('it-IT')}
                  </div>
                  {m.agenda && (
                    <div className="text-xs text-gray-400 mt-0.5">{m.agenda}</div>
                  )}
                  {m.decisions && (
                    <div className="text-xs text-gray-300 mt-1">→ {m.decisions}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
