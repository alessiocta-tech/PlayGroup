'use client'

import Link from 'next/link'
import { useState } from 'react'

const servizi = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    titolo: 'Ristorazione d\'eccellenza',
    descrizione: '5 ristoranti che portano in tavola la cucina tradizionale italiana in ambienti caldi e accoglienti, da Roma fino in Sicilia.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    titolo: 'Turismo e viaggi',
    descrizione: 'Tour organizzati, viaggi di gruppo e destinazioni esclusive. La nostra agenzia CTA Tuscolana costruisce esperienze su misura.',
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    titolo: 'Hospitality premium',
    descrizione: 'Ville, appartamenti e strutture ricettive selezionate per vacanze indimenticabili. Qualità garantita in ogni struttura del gruppo.',
  },
]

const aziende = [
  {
    slug: 'derione',
    nome: 'deRione',
    tipo: 'Ristorazione',
    categoria: 'restaurant',
    bg: 'bg-[#111111]',
    accent: '#E63946',
    descrizione: '5 ristoranti a Roma e in Italia. Cucina tradizionale italiana.',
    dettaglio: '5 location · Roma, Palermo, Reggio Calabria',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
  },
  {
    slug: 'play-viaggi',
    nome: 'Play Viaggi',
    tipo: 'Turismo',
    categoria: 'travel',
    bg: 'bg-white',
    accent: '#2A9D8F',
    descrizione: 'Agenzia viaggi di gruppo, tour organizzati e destinazioni esclusive.',
    dettaglio: 'Roma — CTA Tuscolana',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    slug: 'case-vacanze',
    nome: 'Case Vacanze',
    tipo: 'Hospitality',
    categoria: 'hospitality',
    bg: 'bg-[#F0C040]',
    accent: '#111111',
    descrizione: 'Ville, appartamenti e strutture ricettive per vacanze indimenticabili.',
    dettaglio: 'villaggi.playviaggi.com',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    slug: 'palermo-ft',
    nome: 'PALERMO FT',
    tipo: 'Hospitality',
    categoria: 'hospitality',
    bg: 'bg-white',
    accent: '#F4A261',
    descrizione: 'Nuovo progetto hospitality a Palermo. In apertura con finanziamento MCC.',
    dettaglio: 'Palermo · In avvio',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
]

const categorie = ['Tutte', 'Ristorazione', 'Turismo', 'Hospitality']

export default function HomePage() {
  const [tab, setTab] = useState('Tutte')

  const aziendeFiltrate = tab === 'Tutte'
    ? aziende
    : aziende.filter((a) => a.tipo === tab)

  return (
    <div className="bg-[#EFEFEA]">

      {/* ── HERO ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#F0C040]/20 border border-[#F0C040]/40 text-[#111111] text-xs font-bold px-4 py-1.5 rounded-full mb-8">
              <span className="w-2 h-2 bg-[#F0C040] rounded-full" />
              Gruppo imprenditoriale italiano
            </div>
            <h1 className="text-6xl sm:text-7xl font-extrabold text-[#111111] leading-[0.95] mb-6 tracking-tight">
              Play<br />
              <span className="text-[#F0C040]">Group</span>
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-10 max-w-md">
              Quattro aziende, una visione. Ristorazione, turismo e hospitality
              di qualità nel cuore dell'Italia.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/aziende"
                className="bg-[#111111] hover:bg-[#222] text-white font-bold px-7 py-3.5 rounded-2xl transition-colors text-sm"
              >
                Scopri le aziende
              </Link>
              <Link
                href="/contatti"
                className="bg-white hover:bg-gray-50 text-[#111111] font-bold px-7 py-3.5 rounded-2xl transition-colors text-sm border border-gray-200"
              >
                Contattaci
              </Link>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#111111] rounded-3xl p-7 text-white">
              <div className="text-5xl font-extrabold mb-1">4</div>
              <div className="text-sm text-gray-400">Aziende del gruppo</div>
            </div>
            <div className="bg-[#F0C040] rounded-3xl p-7">
              <div className="text-5xl font-extrabold text-[#111111] mb-1">5</div>
              <div className="text-sm text-[#111111]/60">Ristoranti attivi</div>
            </div>
            <div className="bg-white rounded-3xl p-7">
              <div className="text-5xl font-extrabold text-[#111111] mb-1">15+</div>
              <div className="text-sm text-gray-400">Anni di esperienza</div>
            </div>
            <div className="bg-white rounded-3xl p-7">
              <div className="text-3xl font-extrabold text-[#111111] mb-1">Roma</div>
              <div className="text-sm text-gray-400">Sede principale</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVIZI ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="text-center mb-12">
          <div className="text-xs font-bold text-[#F0C040] uppercase tracking-widest mb-3">Cosa facciamo</div>
          <h2 className="text-4xl font-extrabold text-[#111111]">I nostri settori</h2>
          <p className="text-gray-500 mt-3 max-w-lg mx-auto">
            Tre aree di business complementari per offrire esperienze complete ai nostri clienti.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {servizi.map((s) => (
            <div key={s.titolo} className="bg-white rounded-3xl p-8 hover:shadow-lg transition-shadow group">
              <div className="w-14 h-14 bg-[#EFEFEA] rounded-2xl flex items-center justify-center text-[#111111] mb-6 group-hover:bg-[#F0C040] transition-colors">
                {s.icon}
              </div>
              <h3 className="text-lg font-extrabold text-[#111111] mb-3">{s.titolo}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">{s.descrizione}</p>
              <Link href="/aziende" className="text-sm font-bold text-[#111111] hover:text-[#F0C040] transition-colors inline-flex items-center gap-1">
                Scopri di più <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── AZIENDE ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="text-xs font-bold text-[#F0C040] uppercase tracking-widest mb-2">Portfolio</div>
            <h2 className="text-4xl font-extrabold text-[#111111]">Le nostre aziende</h2>
          </div>
          <Link href="/aziende" className="text-sm font-bold text-[#111111] hover:text-[#F0C040] transition-colors hidden sm:block">
            Vedi tutte →
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {categorie.map((cat) => (
            <button
              key={cat}
              onClick={() => setTab(cat)}
              className={`px-5 py-2 rounded-2xl text-sm font-bold transition-colors ${
                tab === cat
                  ? 'bg-[#111111] text-white'
                  : 'bg-white text-[#111111] hover:bg-gray-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {aziendeFiltrate.map((a) => (
            <Link key={a.slug} href={`/aziende/${a.slug}`} className="group">
              <div className={`${a.bg} rounded-3xl p-7 h-full flex flex-col hover:scale-[1.02] transition-transform`}>
                <div className={`mb-6 ${
                  a.bg === 'bg-[#111111]' ? 'text-white/70' :
                  a.bg === 'bg-[#F0C040]' ? 'text-[#111111]/60' : 'text-gray-400'
                }`}>
                  {a.icon}
                </div>
                <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${
                  a.bg === 'bg-[#111111]' ? 'text-gray-500' :
                  a.bg === 'bg-[#F0C040]' ? 'text-[#111111]/50' : 'text-gray-400'
                }`}>
                  {a.tipo}
                </div>
                <h3 className={`text-xl font-extrabold mb-3 group-hover:opacity-80 transition-opacity ${
                  a.bg === 'bg-[#111111]' ? 'text-white' :
                  a.bg === 'bg-[#F0C040]' ? 'text-[#111111]' : 'text-[#111111]'
                }`}>
                  {a.nome}
                </h3>
                <p className={`text-sm leading-relaxed flex-1 ${
                  a.bg === 'bg-[#111111]' ? 'text-gray-400' :
                  a.bg === 'bg-[#F0C040]' ? 'text-[#111111]/70' : 'text-gray-500'
                }`}>
                  {a.descrizione}
                </p>
                <div className={`mt-5 pt-5 border-t text-xs ${
                  a.bg === 'bg-[#111111]' ? 'border-white/10 text-gray-500' :
                  a.bg === 'bg-[#F0C040]' ? 'border-[#111111]/10 text-[#111111]/50' : 'border-gray-100 text-gray-400'
                }`}>
                  {a.dettaglio}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-24">
        <div className="bg-[#111111] rounded-3xl p-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-3">
              Entra nel gruppo
            </h2>
            <p className="text-gray-400 max-w-md">
              Siamo sempre alla ricerca di persone motivate e appassionate.
              Unisciti a noi e costruiamo qualcosa di grande insieme.
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <Link
              href="/lavora-con-noi"
              className="bg-[#F0C040] hover:bg-[#e6b630] text-[#111111] font-bold px-7 py-3.5 rounded-2xl transition-colors text-sm whitespace-nowrap"
            >
              Lavora con noi
            </Link>
            <Link
              href="/contatti"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-7 py-3.5 rounded-2xl transition-colors text-sm whitespace-nowrap"
            >
              Contatti
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
