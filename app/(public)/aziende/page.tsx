import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Le nostre aziende — Play Group S.R.L.',
  description: 'deRione, Play Viaggi, Case Vacanze e PALERMO FT: le quattro realtà del gruppo Play Group S.R.L.',
}

const aziende = [
  {
    slug: 'derione',
    nome: 'deRione',
    categoria: 'Ristorazione',
    colore: '#E63946',
    descrizione: 'Cucina italiana autentica in 5 location tra Roma, Palermo e Reggio Calabria. Tradizione, ingredienti selezionati e accoglienza genuina.',
    dati: ['5 ristoranti', 'Dal 2015', 'Roma · Palermo · RC'],
    cta: 'Scopri deRione',
  },
  {
    slug: 'play-viaggi',
    nome: 'Play Viaggi',
    categoria: 'Turismo',
    colore: '#2A9D8F',
    descrizione: 'Agenzia di viaggio e tour operator specializzata in gruppi. Tour organizzati in Italia e nel Mediterraneo, con partenze da Roma.',
    dati: ['CTA Tuscolana', 'Dal 2019', 'Roma'],
    cta: 'Scopri Play Viaggi',
  },
  {
    slug: 'case-vacanze',
    nome: 'Case Vacanze',
    categoria: 'Hospitality',
    colore: '#F4A261',
    descrizione: 'Ville e appartamenti per vacanze in Italia. Strutture selezionate, gestione professionale, esperienza su misura per famiglie e gruppi.',
    dati: ['Ville & appartamenti', 'Dal 2020', 'Italia'],
    cta: 'Scopri Case Vacanze',
  },
  {
    slug: 'palermo-ft',
    nome: 'PALERMO FT',
    categoria: 'Hospitality',
    colore: '#6A4C93',
    descrizione: 'Nuovo progetto hospitality in fase di avvio. Struttura ricettiva a Palermo con un approccio contemporaneo all\'accoglienza siciliana.',
    dati: ['In avvio', 'Palermo', 'Hospitality'],
    cta: 'Scopri PALERMO FT',
  },
]

export default function AziendePage() {
  return (
    <main className="bg-[#EFEFEA] min-h-screen">
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <span className="inline-block bg-[#F0C040] text-[#111111] text-xs font-bold px-3 py-1 rounded-full mb-4">
          Il gruppo
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111111] mb-4">
          Le nostre aziende
        </h1>
        <p className="text-gray-600 text-lg max-w-xl">
          Quattro realtà distinte, un'unica visione: qualità, autenticità e cura per le persone.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {aziende.map((a) => (
            <Link
              key={a.slug}
              href={`/aziende/${a.slug}`}
              className="bg-white rounded-3xl p-8 hover:shadow-lg transition-all group block"
            >
              <div className="flex items-start justify-between mb-6">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: a.colore }}
                >
                  <span className="text-white font-extrabold text-sm">
                    {a.nome.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                  {a.categoria}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-[#111111] mb-3">{a.nome}</h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-6">{a.descrizione}</p>
              <div className="flex gap-2 flex-wrap mb-6">
                {a.dati.map((d) => (
                  <span key={d} className="text-xs text-gray-500 bg-[#EFEFEA] px-3 py-1 rounded-full">
                    {d}
                  </span>
                ))}
              </div>
              <span className="text-sm font-bold text-[#111111] group-hover:text-[#F0C040] transition-colors">
                {a.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA contatti */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-[#111111] rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold text-white mb-2">Vuoi collaborare con noi?</h2>
            <p className="text-gray-400 text-sm">Partnership, fornitori, collaborazioni — siamo sempre aperti.</p>
          </div>
          <Link
            href="/contatti"
            className="flex-shrink-0 bg-[#F0C040] text-[#111111] font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#e6b630] transition-colors"
          >
            Contattaci
          </Link>
        </div>
      </section>
    </main>
  )
}
