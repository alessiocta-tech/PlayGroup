import { prisma } from '@/lib/prisma'

const priorityColor: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  normal: 'bg-gray-100 text-gray-500',
  low: 'bg-gray-50 text-gray-400',
}

const priorityOrder: Record<string, number> = {
  urgent: 0,
  high: 1,
  normal: 2,
  low: 3,
}

export default async function EmailPage() {
  const emails = await prisma.email.findMany({
    orderBy: [{ read: 'asc' }, { timestamp: 'desc' }],
    take: 50,
  })

  const sorted = [...emails].sort(
    (a, b) =>
      (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)
  )

  const unread = emails.filter((e) => !e.read).length
  const urgent = emails.filter((e) => e.priority === 'urgent').length
  const withDraft = emails.filter((e) => e.aiDraft).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111]">Email</h1>
        <p className="text-sm text-gray-500 mt-1">Inbox aggregata con AI triage</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <div className="text-xs text-gray-400 mb-1">Non lette</div>
          <div className="text-3xl font-extrabold">{unread}</div>
        </div>
        <div className={`rounded-2xl p-5 ${urgent > 0 ? 'bg-red-50' : 'bg-white'}`}>
          <div className="text-xs text-gray-400 mb-1">Urgenti</div>
          <div
            className={`text-3xl font-extrabold ${
              urgent > 0 ? 'text-red-500' : 'text-[#111111]'
            }`}
          >
            {urgent}
          </div>
        </div>
        <div className="bg-[#F0C040] rounded-2xl p-5">
          <div className="text-xs text-[#111111]/60 mb-1">Bozze AI pronte</div>
          <div className="text-3xl font-extrabold text-[#111111]">{withDraft}</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5">
        <h2 className="font-extrabold text-[#111111] mb-4">Inbox</h2>
        <div className="space-y-2">
          {sorted.length === 0 && (
            <p className="text-sm text-gray-400">Nessuna email</p>
          )}
          {sorted.map((email) => (
            <div
              key={email.id}
              className={`p-4 rounded-xl border ${
                email.read
                  ? 'border-gray-100 bg-[#EFEFEA]/50'
                  : 'border-[#F0C040]/30 bg-white shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-[#111111]">
                      {email.fromName ?? email.fromEmail}
                    </span>
                    {!email.read && (
                      <span className="w-2 h-2 bg-[#F0C040] rounded-full flex-shrink-0" />
                    )}
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                        priorityColor[email.priority] ?? 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {email.priority}
                    </span>
                    {email.category && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                        {email.category}
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-medium text-[#111111] truncate">
                    {email.subject ?? '(senza oggetto)'}
                  </div>
                  {email.bodyPreview && (
                    <div className="text-xs text-gray-500 mt-0.5 leading-snug line-clamp-2">
                      {email.bodyPreview}
                    </div>
                  )}
                  {email.aiDraft && (
                    <div className="mt-2 p-2 bg-[#F0C040]/10 rounded-lg border border-[#F0C040]/30">
                      <div className="text-xs font-semibold text-[#111111] mb-0.5">
                        Bozza AI
                      </div>
                      <div className="text-xs text-gray-600 line-clamp-2">
                        {email.aiDraft}
                      </div>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(email.timestamp).toLocaleString('it-IT', {
                    day: '2-digit',
                    month: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
