import { prisma } from '@/lib/prisma'

export default async function SalutePage() {
  const [metrics, workouts] = await Promise.all([
    prisma.healthMetric.findMany({
      orderBy: { date: 'desc' },
      take: 14,
    }),
    prisma.workout.findMany({
      orderBy: { date: 'desc' },
      take: 10,
    }),
  ])

  const latest = metrics[0]
  const prev = metrics[1]

  const weightChange =
    latest?.weight && prev?.weight
      ? latest.weight.toNumber() - prev.weight.toNumber()
      : null

  const stepsMetrics = metrics.filter((m) => m.steps !== null)
  const avgSteps =
    stepsMetrics.length > 0
      ? Math.round(stepsMetrics.reduce((s, m) => s + (m.steps ?? 0), 0) / stepsMetrics.length)
      : 0

  const sleepMetrics = metrics.filter((m) => m.sleepHours !== null)
  const avgSleep =
    sleepMetrics.length > 0
      ? (
          sleepMetrics.reduce((s, m) => s + (m.sleepHours?.toNumber() ?? 0), 0) /
          sleepMetrics.length
        ).toFixed(1)
      : '—'

  const workoutTypeIcon = (type: string): string => {
    const t = type.toLowerCase()
    if (t === 'palestra' || t === 'gym') return '🏋️'
    if (t === 'corsa' || t === 'running') return '🏃'
    if (t === 'nuoto' || t === 'swimming') return '🏊'
    if (t === 'ciclismo' || t === 'cycling') return '🚴'
    if (t === 'yoga') return '🧘'
    return '⚡'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111]">Salute & Sport</h1>
        <p className="text-sm text-gray-500 mt-1">Metriche salute e allenamenti</p>
      </div>

      {/* Latest metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <div className="text-xs text-gray-400 mb-1">Peso</div>
          <div className="text-3xl font-extrabold">
            {latest?.weight ? `${latest.weight.toNumber().toFixed(1)}kg` : '—'}
          </div>
          {weightChange !== null && (
            <div
              className={`text-xs mt-1 font-medium ${
                weightChange <= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {weightChange > 0 ? '+' : ''}
              {weightChange.toFixed(1)}kg vs ieri
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-1">Passi (media)</div>
          <div className="text-3xl font-extrabold text-[#111111]">
            {avgSteps > 0 ? avgSteps.toLocaleString('it-IT') : '—'}
          </div>
          <div className="text-xs text-gray-500 mt-1">ultimi 14 giorni</div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-1">Sonno (media)</div>
          <div className="text-3xl font-extrabold text-[#111111]">{avgSleep}h</div>
          <div className="text-xs text-gray-500 mt-1">ultimi 14 giorni</div>
        </div>
        <div className="bg-[#F0C040] rounded-2xl p-5">
          <div className="text-xs text-[#111111]/60 mb-1">FC a riposo</div>
          <div className="text-3xl font-extrabold text-[#111111]">
            {latest?.heartRate ? `${latest.heartRate} bpm` : '—'}
          </div>
          {latest?.hrv && (
            <div className="text-xs text-[#111111]/60 mt-1">HRV: {latest.hrv}</div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Health log */}
        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-extrabold text-[#111111] mb-4">Log salute (14 giorni)</h2>
          {metrics.length === 0 ? (
            <p className="text-sm text-gray-400">Nessuna metrica registrata</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 text-gray-400 font-semibold">Data</th>
                    <th className="text-right py-2 text-gray-400 font-semibold">Peso</th>
                    <th className="text-right py-2 text-gray-400 font-semibold">Passi</th>
                    <th className="text-right py-2 text-gray-400 font-semibold">Sonno</th>
                    <th className="text-right py-2 text-gray-400 font-semibold">FC</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((m) => (
                    <tr key={m.id} className="border-b border-gray-50">
                      <td className="py-2 text-gray-500">
                        {new Date(m.date).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </td>
                      <td className="py-2 text-right font-semibold text-[#111111]">
                        {m.weight ? `${m.weight.toNumber().toFixed(1)}` : '—'}
                      </td>
                      <td className="py-2 text-right text-gray-600">
                        {m.steps ? m.steps.toLocaleString('it-IT') : '—'}
                      </td>
                      <td className="py-2 text-right text-gray-600">
                        {m.sleepHours ? `${m.sleepHours.toNumber().toFixed(1)}h` : '—'}
                      </td>
                      <td className="py-2 text-right text-gray-600">
                        {m.heartRate ? `${m.heartRate}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Workouts */}
        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-extrabold text-[#111111] mb-4">Allenamenti recenti</h2>
          <div className="space-y-3">
            {workouts.length === 0 && (
              <p className="text-sm text-gray-400">Nessun allenamento registrato</p>
            )}
            {workouts.map((w) => (
              <div key={w.id} className="flex items-center gap-3 p-3 bg-[#EFEFEA] rounded-xl">
                <div className="w-10 h-10 bg-[#111111] rounded-xl flex items-center justify-center text-white text-lg flex-shrink-0">
                  {workoutTypeIcon(w.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#111111] capitalize">{w.type}</div>
                  <div className="text-xs text-gray-500">
                    {w.durationMin && `${w.durationMin} min`}
                    {w.distanceKm && ` · ${w.distanceKm.toNumber().toFixed(1)} km`}
                    {w.calories && ` · ${w.calories} kcal`}
                  </div>
                  {w.notes && (
                    <div className="text-xs text-gray-400 mt-0.5 truncate">{w.notes}</div>
                  )}
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(w.date).toLocaleDateString('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly summary */}
      {workouts.length > 0 && (
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <h2 className="font-extrabold mb-3">Riepilogo allenamenti</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">Sessioni totali</div>
              <div className="text-2xl font-extrabold">{workouts.length}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Minuti totali</div>
              <div className="text-2xl font-extrabold">
                {workouts.reduce((s, w) => s + (w.durationMin ?? 0), 0)}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Calorie totali</div>
              <div className="text-2xl font-extrabold">
                {workouts.reduce((s, w) => s + (w.calories ?? 0), 0).toLocaleString('it-IT')}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
