import Link from 'next/link'

const aziende = [
  {
    slug: 'derione',
    nome: 'deRione',
    tipo: 'Ristorazione',
    emoji: '🍽️',
    color: '#E63946',
    descrizione: '5 ristoranti a Roma e in Italia. Cucina tradizionale italiana in ambienti accoglienti.',
    sedi: ['Roma Appia', 'Corso Trieste', 'Palermo', 'Reggio Calabria', 'Talenti'],
  },
  {
    slug: 'play-viaggi',
    nome: 'Play Viaggi',
    tipo: 'Turismo',
    emoji: '✈️',
    color: '#2A9D8F',
    descrizione: "Agenzia viaggi di gruppo specializzata in tour organizzati e destinazioni esclusive.",
    sedi: ['Roma — CTA Tuscolana'],
  },
  {
    slug: 'case-vacanze',
    nome: 'Case Vacanze',
    tipo: 'Hospitality',
    emoji: '🏠',
    color: '#457B9D',
    descrizione: 'Ville, appartamenti e strutture ricettive selezionate per vacanze indimenticabili.',
    sedi: ['villaggi.playviaggi.com'],
  },
  {
    slug: 'palermo-ft',
    nome: 'PALERMO FT',
    tipo: 'Hospitality',
    emoji: '🏗️',
    color: '#F4A261',
    descrizione: 'Nuovo progetto hospitality a Palermo. In apertura, finanziamento MCC in corso.',
    sedi: ['Palermo'],
  },
]

export default function HomePage() {
  return (
    <div className="bg-[#EFEFEA]">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block bg-[#F0C040] text-[#111111] text-xs font-bold px-3 py-1 rounded-full mb-6">
              Gruppo imprenditoriale italiano
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold text-[#111111] leading-tight mb-6">
              Play<br />Group
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-8 max-w-md">
              Ristorazione, turismo e hospitality. Quattro aziende, una visione:
              offrire esperienze autentiche e di qualità in Italia.
            </p>
            <div className="flex gap-4">
              <Link
                href="/aziende"
                className="bg-[#111111] hover:bg-[#333] text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                Scopri le aziende
              </Link>
              <Link
                href="/contatti"
                className="bg-white hover:bg-gray-50 text-[#111111] font-bold px-6 py-3 rounded-xl transition-colors text-sm border border-gray-200"
              >
                Contattaci
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { n: '4', label: 'Aziende' },
              { n: '5', label: 'Ristoranti' },
              { n: '15+', label: 'Anni di esperienza' },
              { n: 'Roma', label: 'Sede principale' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl p-6">
                <div className="text-4xl font-extrabold text-[#111111]">{stat.n}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Aziende */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-[#111111]">Le nostre aziende</h2>
            <p className="text-gray-500 mt-2">Un gruppo, quattro realtà d'eccellenza</p>
          </div>
          <Link href="/aziende" className="text-sm font-semibold text-[#111111] hover:text-[#F0C040] transition-colors hidden sm:block">
            Vedi tutte →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {aziende.map((a) => (
            <Link key={a.slug} href={`/aziende/${a.slug}`}>
              <div className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow cursor-pointer group h-full flex flex-col">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ backgroundColor: `${a.color}20` }}
                >
                  {a.emoji}
                </div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{a.tipo}</div>
                <h3 className="text-lg font-extrabold text-[#111111] mb-2 group-hover:text-[#F0C040] transition-colors">
                  {a.nome}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{a.descrizione}</p>
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {a.sedi.map((sede) => (
                    <span key={sede} className="text-xs text-gray-400 block">{sede}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="bg-[#111111] rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-extrabold text-white mb-4">
            Lavora con noi
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Siamo sempre alla ricerca di persone motivate e appassionate.
            Entra a far parte del gruppo Play Group.
          </p>
          <Link
            href="/lavora-con-noi"
            className="inline-block bg-[#F0C040] hover:bg-[#e6b630] text-[#111111] font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Vedi le posizioni aperte
          </Link>
        </div>
      </section>
    </div>
  )
}
