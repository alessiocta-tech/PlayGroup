'use client'

import Link from 'next/link'
import { useState } from 'react'

const aziende = [
  {
    slug: 'derione',
    nome: 'deRione',
    tipo: 'Ristorazione',
    bg: 'bg-[#111111]',
    textColor: 'text-white',
    subtextColor: 'text-gray-400',
    labelColor: 'text-gray-500',
    borderColor: 'border-white/10',
    detailColor: 'text-gray-500',
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
    bg: 'bg-white',
    textColor: 'text-[#111111]',
    subtextColor: 'text-gray-500',
    labelColor: 'text-gray-400',
    borderColor: 'border-gray-100',
    detailColor: 'text-gray-400',
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
    bg: 'bg-[#F0C040]',
    textColor: 'text-[#111111]',
    subtextColor: 'text-[#111111]/70',
    labelColor: 'text-[#111111]/50',
    borderColor: 'border-[#111111]/10',
    detailColor: 'text-[#111111]/50',
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
    bg: 'bg-white',
    textColor: 'text-[#111111]',
    subtextColor: 'text-gray-500',
    labelColor: 'text-gray-400',
    borderColor: 'border-gray-100',
    detailColor: 'text-gray-400',
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

export default function AziendeFilter() {
  const [tab, setTab] = useState('Tutte')

  const filtrate = tab === 'Tutte' ? aziende : aziende.filter((a) => a.tipo === tab)

  return (
    <>
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
        {filtrate.map((a) => (
          <Link key={a.slug} href={`/aziende/${a.slug}`} className="group">
            <div className={`${a.bg} rounded-3xl p-7 h-full flex flex-col hover:scale-[1.02] transition-transform`}>
              <div className={`mb-6 ${a.labelColor}`}>
                {a.icon}
              </div>
              <div className={`text-xs font-bold uppercase tracking-widest mb-2 ${a.labelColor}`}>
                {a.tipo}
              </div>
              <h3 className={`text-xl font-extrabold mb-3 ${a.textColor}`}>
                {a.nome}
              </h3>
              <p className={`text-sm leading-relaxed flex-1 ${a.subtextColor}`}>
                {a.descrizione}
              </p>
              <div className={`mt-5 pt-5 border-t text-xs ${a.borderColor} ${a.detailColor}`}>
                {a.dettaglio}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
