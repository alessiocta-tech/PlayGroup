import { prisma } from '@/lib/prisma'

export default async function ContabilitaPage() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [finances, taxDeadlines, monthFinances] = await Promise.all([
    prisma.personalFinance.findMany({
      orderBy: { date: 'desc' },
      take: 30,
    }),
    prisma.taxDeadline.findMany({
      where: { status: { in: ['pending', 'late'] } },
      orderBy: { dueDate: 'asc' },
    }),
    prisma.personalFinance.findMany({
      where: { date: { gte: startOfMonth, lte: endOfMonth } },
    }),
  ])

  const monthIncome = monthFinances
    .filter((f) => f.type === 'income')
    .reduce((s, f) => s + f.amount.toNumber(), 0)

  const monthExpense = monthFinances
    .filter((f) => f.type === 'expense')
    .reduce((s, f) => s + f.amount.toNumber(), 0)

  const monthBalance = monthIncome - monthExpense

  const totalTaxDue = taxDeadlines.reduce((s, t) => s + (t.amount?.toNumber() ?? 0), 0)

  const categories = finances.reduce<Record<string, number>>((acc, f) => {
    if (f.type === 'expense') {
      acc[f.category] = (acc[f.category] ?? 0) + f.amount.toNumber()
    }
    return acc
  }, {})

  const topCategories = Object.entries(categories)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111]">Contabilità</h1>
        <p className="text-sm text-gray-500 mt-1">Finanze personali e scadenze fiscali</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <div className="text-xs text-gray-400 mb-1">Entrate mese</div>
          <div className="text-2xl font-extrabold text-green-400">
            €{monthIncome.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-1">Uscite mese</div>
          <div className="text-2xl font-extrabold text-red-500">
            €{monthExpense.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
          </div>
        </div>
        <div className={`rounded-2xl p-5 ${monthBalance >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="text-xs text-gray-400 mb-1">Saldo mese</div>
          <div
            className={`text-2xl font-extrabold ${
              monthBalance >= 0 ? 'text-green-600' : 'text-red-500'
            }`}
          >
            {monthBalance >= 0 ? '+' : ''}€
            {monthBalance.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
          </div>
        </div>
        <div className={`rounded-2xl p-5 ${totalTaxDue > 0 ? 'bg-[#F0C040]' : 'bg-white'}`}>
          <div className="text-xs text-[#111111]/60 mb-1">Scadenze fiscali</div>
          <div className="text-2xl font-extrabold text-[#111111]">
            €{totalTaxDue.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
          </div>
          <div className="text-xs text-[#111111]/60 mt-1">{taxDeadlines.length} scadenze</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Tax deadlines */}
        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-extrabold text-[#111111] mb-4">Scadenze fiscali</h2>
          <div className="space-y-3">
            {taxDeadlines.length === 0 && (
              <p className="text-sm text-gray-400">Nessuna scadenza</p>
            )}
            {taxDeadlines.map((tax) => {
              const isLate = new Date(tax.dueDate) < now
              return (
                <div
                  key={tax.id}
                  className={`p-3 rounded-xl ${
                    isLate || tax.status === 'late' ? 'bg-red-50' : 'bg-[#EFEFEA]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#111111]">{tax.title}</div>
                      {tax.description && (
                        <div className="text-xs text-gray-500 mt-0.5">{tax.description}</div>
                      )}
                      <div
                        className={`text-xs mt-1 font-medium ${
                          isLate ? 'text-red-500' : 'text-gray-400'
                        }`}
                      >
                        Scadenza: {new Date(tax.dueDate).toLocaleDateString('it-IT')}
                      </div>
                    </div>
                    {tax.amount && (
                      <div className="text-sm font-extrabold text-[#111111] flex-shrink-0">
                        €{tax.amount.toNumber().toLocaleString('it-IT')}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Top expense categories */}
        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-extrabold text-[#111111] mb-4">Top categorie spesa</h2>
          <div className="space-y-3">
            {topCategories.length === 0 && (
              <p className="text-sm text-gray-400">Nessuna spesa registrata</p>
            )}
            {topCategories.map(([cat, amount]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-[#111111] capitalize">{cat}</span>
                  <span className="text-gray-500">
                    €{amount.toLocaleString('it-IT', { minimumFractionDigits: 0 })}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#F0C040] rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (amount / (topCategories[0]?.[1] ?? 1)) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-extrabold text-[#111111] mb-4">Movimenti recenti</h2>
          <div className="space-y-2">
            {finances.length === 0 && (
              <p className="text-sm text-gray-400">Nessun movimento</p>
            )}
            {finances.slice(0, 10).map((f) => (
              <div key={f.id} className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    f.type === 'income'
                      ? 'bg-green-100 text-green-600'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {f.type === 'income' ? '+' : '−'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-[#111111] truncate">
                    {f.description ?? f.category}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(f.date).toLocaleDateString('it-IT')}
                  </div>
                </div>
                <div
                  className={`text-sm font-extrabold flex-shrink-0 ${
                    f.type === 'income' ? 'text-green-600' : 'text-red-500'
                  }`}
                >
                  {f.type === 'income' ? '+' : '−'}€
                  {f.amount.toNumber().toLocaleString('it-IT', { minimumFractionDigits: 0 })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
