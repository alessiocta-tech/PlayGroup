import { prisma } from '@/lib/prisma'

export default async function WhatsAppPage() {
  const [messages, companies] = await Promise.all([
    prisma.waMessage.findMany({
      orderBy: { timestamp: 'desc' },
      take: 50,
    }),
    prisma.company.findMany({ where: { active: true } }),
  ])

  const inbound = messages.filter((m) => m.direction === 'inbound')
  const resolvedByAi = inbound.filter((m) => m.handledByAi && !m.escalated)
  const escalated = inbound.filter((m) => m.escalated && !m.handledByAi)
  const aiRate =
    inbound.length > 0
      ? Math.round((resolvedByAi.length / inbound.length) * 100)
      : 0

  const todayStr = new Date().toDateString()
  const inboundToday = inbound.filter(
    (m) => new Date(m.timestamp).toDateString() === todayStr
  ).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111]">WhatsApp Business</h1>
        <p className="text-sm text-gray-500 mt-1">Messaggi e gestione escalation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <div className="text-xs text-gray-400 mb-1">Messaggi totali</div>
          <div className="text-3xl font-extrabold">{messages.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-1">Risolti da AI</div>
          <div className="text-3xl font-extrabold text-[#111111]">{aiRate}%</div>
          <div className="text-xs text-gray-500 mt-1">
            {resolvedByAi.length} su {inbound.length} in entrata
          </div>
        </div>
        <div
          className={`rounded-2xl p-5 ${escalated.length > 0 ? 'bg-red-50' : 'bg-white'}`}
        >
          <div className="text-xs text-gray-400 mb-1">Escalation pendenti</div>
          <div
            className={`text-3xl font-extrabold ${
              escalated.length > 0 ? 'text-red-500' : 'text-[#111111]'
            }`}
          >
            {escalated.length}
          </div>
          <div className="text-xs text-gray-500 mt-1">da gestire manualmente</div>
        </div>
        <div className="bg-[#F0C040] rounded-2xl p-5">
          <div className="text-xs text-[#111111]/60 mb-1">In entrata oggi</div>
          <div className="text-3xl font-extrabold text-[#111111]">{inboundToday}</div>
        </div>
      </div>

      {/* Escalation alert */}
      {escalated.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="font-extrabold text-red-700 mb-2">
            ⚠️ {escalated.length} messaggi richiedono attenzione
          </div>
          <div className="space-y-2">
            {escalated.map((m) => {
              const initial = (m.contactName ?? m.contactPhone)[0].toUpperCase()
              const companyName =
                companies.find((c) => c.id === m.companyId)?.name ?? 'N/A'
              return (
                <div key={m.id} className="flex items-start gap-3 bg-white rounded-xl p-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-red-600 text-xs font-bold">{initial}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-[#111111]">
                      {m.contactName ?? m.contactPhone}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5 leading-snug">
                      {m.message}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(m.timestamp).toLocaleString('it-IT')}
                    </div>
                  </div>
                  <div className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-lg font-semibold flex-shrink-0">
                    {companyName}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Message list */}
      <div className="bg-white rounded-2xl p-5">
        <h2 className="font-extrabold text-[#111111] mb-4">Tutti i messaggi</h2>
        <div className="space-y-3">
          {messages.length === 0 && (
            <p className="text-sm text-gray-400">Nessun messaggio</p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 p-3 rounded-xl ${
                m.escalated && !m.handledByAi ? 'bg-red-50' : 'bg-[#EFEFEA]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  m.direction === 'inbound'
                    ? 'bg-[#111111] text-white'
                    : 'bg-[#F0C040] text-[#111111]'
                }`}
              >
                {m.direction === 'inbound' ? '↙' : '↗'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-[#111111]">
                    {m.contactName ?? m.contactPhone}
                  </span>
                  {m.handledByAi && (
                    <span className="text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-semibold">
                      AI
                    </span>
                  )}
                  {m.escalated && !m.handledByAi && (
                    <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">
                      ESCALATION
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-600 leading-snug">{m.message}</div>
                {m.aiResponse && (
                  <div className="text-xs text-gray-400 mt-1 italic">
                    AI: {m.aiResponse}
                  </div>
                )}
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">
                {new Date(m.timestamp).toLocaleString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
