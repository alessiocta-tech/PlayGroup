import { prisma } from '@/lib/prisma'
import SyncAllButton from '@/components/dashboard/SyncAllButton'

const typeColor: Record<string, string> = {
  socio: 'bg-purple-100 text-purple-700',
  partner: 'bg-blue-100 text-blue-700',
  investor: 'bg-yellow-100 text-yellow-700',
  supplier: 'bg-orange-100 text-orange-700',
  business: 'bg-gray-100 text-gray-600',
  personal: 'bg-green-100 text-green-700',
}

export default async function CrmPage() {
  const contacts = await prisma.contact.findMany({
    orderBy: [{ nextActionDate: 'asc' }, { lastInteraction: 'desc' }],
    include: {
      interactions: {
        orderBy: { date: 'desc' },
        take: 2,
      },
    },
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const overdue = contacts.filter(
    (c) => c.nextActionDate && new Date(c.nextActionDate) < today
  )
  const upcoming = contacts.filter(
    (c) => c.nextActionDate && new Date(c.nextActionDate) >= today
  )

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">CRM Contatti VIP</h1>
          <p className="text-sm text-gray-500 mt-1">
            Soci, partner, investitori e contatti chiave
          </p>
        </div>
        <SyncAllButton />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <div className="text-xs text-gray-400 mb-1">Contatti totali</div>
          <div className="text-3xl font-extrabold">{contacts.length}</div>
        </div>
        <div
          className={`rounded-2xl p-5 ${overdue.length > 0 ? 'bg-red-50' : 'bg-white'}`}
        >
          <div className="text-xs text-gray-400 mb-1">Follow-up scaduti</div>
          <div
            className={`text-3xl font-extrabold ${
              overdue.length > 0 ? 'text-red-500' : 'text-[#111111]'
            }`}
          >
            {overdue.length}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-1">Da contattare</div>
          <div className="text-3xl font-extrabold text-[#111111]">{upcoming.length}</div>
        </div>
      </div>

      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="font-extrabold text-red-700 mb-3">Follow-up scaduti</div>
          <div className="space-y-2">
            {overdue.map((c) => (
              <div key={c.id} className="flex items-center gap-3 bg-white rounded-xl p-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 text-xs font-bold flex-shrink-0">
                  {c.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#111111]">{c.name}</div>
                  <div className="text-xs text-red-500">{c.nextAction}</div>
                </div>
                <div className="text-xs text-red-400">
                  {c.nextActionDate
                    ? new Date(c.nextActionDate).toLocaleDateString('it-IT')
                    : ''}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {contacts.map((contact) => {
          const isOverdue =
            contact.nextActionDate && new Date(contact.nextActionDate) < today

          return (
            <div key={contact.id} className="bg-white rounded-2xl p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-[#F0C040] rounded-xl flex items-center justify-center text-[#111111] text-sm font-extrabold flex-shrink-0">
                  {contact.name[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-[#111111]">{contact.name}</span>
                    {contact.type && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                          typeColor[contact.type] ?? 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {contact.type}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {contact.role ?? ''}
                    {contact.company ? ` · ${contact.company}` : ''}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-gray-500 mb-3">
                {contact.phone && <div>📱 {contact.phone}</div>}
                {contact.email && <div>✉️ {contact.email}</div>}
              </div>

              {contact.nextAction && (
                <div
                  className={`rounded-lg px-3 py-2 mb-3 ${
                    isOverdue
                      ? 'bg-red-50 text-red-700'
                      : 'bg-[#EFEFEA] text-[#111111]'
                  }`}
                >
                  <div className="text-xs font-semibold">Prossima azione</div>
                  <div className="text-xs mt-0.5">{contact.nextAction}</div>
                  {contact.nextActionDate && (
                    <div className="text-xs mt-0.5 font-semibold">
                      {new Date(contact.nextActionDate).toLocaleDateString('it-IT')}
                    </div>
                  )}
                </div>
              )}

              {contact.interactions.length > 0 && (
                <div className="border-t border-gray-100 pt-3 space-y-2">
                  {contact.interactions.map((interaction) => (
                    <div key={interaction.id} className="flex gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F0C040] mt-1.5 flex-shrink-0" />
                      <div>
                        <div className="text-xs text-gray-600">{interaction.notes}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(interaction.date).toLocaleDateString('it-IT')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {contact.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {contact.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-[#EFEFEA] text-gray-500 px-2 py-0.5 rounded-lg"
                    >
                      {tag}
                    </span>
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
