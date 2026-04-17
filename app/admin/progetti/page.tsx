import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const CATEGORIA_LABELS: Record<string, string> = {
  nuovi:       'Nuovi progetti',
  attivi:      'In corso',
  completati:  'Completati',
  archiviati:  'Archiviati',
}

const PRIORITA_COLORS: Record<string, string> = {
  urgente: 'bg-red-100 text-red-700',
  alta:    'bg-orange-100 text-orange-700',
  media:   'bg-yellow-100 text-yellow-700',
  bassa:   'bg-gray-100 text-gray-500',
}

const STATUS_COLORS: Record<string, string> = {
  nuovo:       'bg-blue-100 text-blue-700',
  in_corso:    'bg-yellow-100 text-yellow-700',
  completato:  'bg-green-100 text-green-700',
  archiviato:  'bg-gray-100 text-gray-500',
}

export default async function ProgettiPage() {
  const progetti = await prisma.progetto.findMany({
    orderBy: [{ categoria: 'asc' }, { createdAt: 'desc' }],
    include: { company: true },
  })

  const byCategory = Object.fromEntries(
    Object.keys(CATEGORIA_LABELS).map((cat) => [
      cat,
      progetti.filter((p) => p.categoria === cat),
    ])
  )

  const totals = {
    nuovi:      byCategory.nuovi?.length ?? 0,
    attivi:     byCategory.attivi?.length ?? 0,
    completati: byCategory.completati?.length ?? 0,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Progetti</h1>
          <p className="text-sm text-gray-500 mt-1">Nuove idee, sviluppi in corso e completati</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#F0C040] rounded-2xl p-5">
          <div className="text-xs font-semibold text-[#111111]/60 mb-1">Nuovi</div>
          <div className="text-3xl font-extrabold text-[#111111]">{totals.nuovi}</div>
        </div>
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <div className="text-xs font-semibold text-gray-400 mb-1">In corso</div>
          <div className="text-3xl font-extrabold">{totals.attivi}</div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="text-xs font-semibold text-gray-400 mb-1">Completati</div>
          <div className="text-3xl font-extrabold text-[#111111]">{totals.completati}</div>
        </div>
      </div>

      {/* Category sections */}
      {Object.entries(CATEGORIA_LABELS).map(([cat, label]) => {
        const items = byCategory[cat] ?? []
        if (items.length === 0) return null
        return (
          <div key={cat}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              {label}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {items.map((p) => (
                <div key={p.id} className="bg-white rounded-2xl p-5 space-y-3 border border-black/[0.04]">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-base font-extrabold text-[#111111] truncate">
                        {p.nome}
                      </div>
                      {(p.azienda ?? p.company?.name) && (
                        <div className="text-xs text-gray-400 mt-0.5">
                          {p.company?.name ?? p.azienda}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1.5 flex-shrink-0">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${STATUS_COLORS[p.status] ?? 'bg-gray-100 text-gray-500'}`}>
                        {p.status.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${PRIORITA_COLORS[p.priorita] ?? 'bg-gray-100 text-gray-500'}`}>
                        {p.priorita}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  {p.descrizione && (
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                      {p.descrizione}
                    </p>
                  )}

                  {/* Tags */}
                  {p.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {p.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-[#EFEFEA] text-gray-500 px-2 py-0.5 rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Tool link */}
                  {p.toolUrl && (
                    <Link
                      href={p.toolUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs bg-[#111111] text-white font-semibold px-3 py-2 rounded-xl hover:bg-[#222] transition-colors w-fit"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Apri strumento
                    </Link>
                  )}

                  {/* Date */}
                  <div className="text-[10px] text-gray-300">
                    Aggiunto il {new Date(p.createdAt).toLocaleDateString('it-IT')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {progetti.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center text-sm text-gray-400">
          Nessun progetto ancora. Verranno aggiunti dopo il deploy.
        </div>
      )}
    </div>
  )
}
