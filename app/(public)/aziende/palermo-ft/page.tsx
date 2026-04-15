import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PALERMO FT S.R.L.S. — Hospitality | Play Group',
  description: 'PALERMO FT S.R.L.S.: nuovo progetto hospitality del gruppo Play Group a Palermo. Struttura ricettiva contemporanea in fase di avvio.',
}

export default function PalermoFtPage() {
  return (
    <main className="bg-[#EFEFEA] min-h-screen">
      {/* Hero */}
      <section className="bg-[#6A4C93] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <Link href="/aziende" className="text-purple-200 text-sm font-bold mb-4 inline-block hover:text-white">
            ← Tutte le aziende
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <span className="text-[#6A4C93] font-extrabold text-sm">PF</span>
            </div>
            <span className="text-purple-200 font-bold text-sm">Hospitality · In avvio</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">PALERMO FT</h1>
          <p className="text-purple-200 font-medium mb-2">S.R.L.S. · P.IVA 18203101003</p>
          <p className="text-purple-100 text-lg max-w-xl leading-relaxed">
            Il più recente progetto del gruppo Play Group. Una struttura ricettiva a Palermo
            con un approccio contemporaneo all'accoglienza siciliana.
            Attualmente in fase di avvio.
          </p>
        </div>
      </section>

      {/* Status */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-[#F0C040] rounded-full animate-pulse" />
            <span className="font-bold text-[#111111] text-sm">Progetto in fase di avvio</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#111111] mb-4">Il progetto</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            PALERMO FT S.R.L.S. è stata costituita nel 2024 come veicolo per un nuovo progetto
            nell'hospitality. La struttura si trova a Palermo e punta a offrire un'esperienza
            di accoglienza che unisce il carattere autentico della città con standard contemporanei
            di comfort e servizio.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Le pratiche di avvio (MCC e autorizzazioni) sono in corso.
            L'amministratrice unica è Anna Loredana Asciutto.
          </p>
        </div>
      </section>

      {/* Visione */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-[#111111] text-white rounded-3xl p-8 sm:p-12">
          <h2 className="text-2xl font-extrabold mb-8">La nostra visione</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                titolo: 'Palermo autentica',
                testo: 'Non un hotel anonimo ma un luogo che racconta la città: la sua architettura, i suoi mercati, la sua cucina.',
              },
              {
                titolo: 'Ospitalità italiana',
                testo: 'Il calore dell\'accoglienza del Sud Italia come standard, non come eccezione. Ogni ospite trattato da amico.',
              },
              {
                titolo: 'Standard moderni',
                testo: 'Comfort, tecnologia e design contemporaneo integrati in un contesto storico e culturale unico.',
              },
            ].map((v) => (
              <div key={v.titolo}>
                <div className="w-8 h-1 bg-[#6A4C93] rounded mb-4" />
                <h3 className="font-extrabold text-white mb-2">{v.titolo}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{v.testo}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-2xl font-extrabold text-[#111111] mb-6">Stato avanzamento</h2>
        <div className="bg-white rounded-3xl p-8 space-y-4">
          {[
            { fase: 'Costituzione S.R.L.S.', stato: 'completato', note: '2024 — Atto costitutivo firmato, P.IVA attribuita' },
            { fase: 'MCC (Modulistica Comunale)', stato: 'in corso', note: 'Pratiche in fase di istruttoria' },
            { fase: 'Autorizzazioni e licenze', stato: 'in corso', note: 'Procedure avviate presso gli uffici competenti' },
            { fase: 'Apertura struttura', stato: 'futuro', note: 'Prevista dopo completamento iter burocratico' },
          ].map((f) => (
            <div key={f.fase} className="flex items-start gap-4">
              <div className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                f.stato === 'completato' ? 'bg-green-400' :
                f.stato === 'in corso' ? 'bg-[#F0C040]' : 'bg-gray-300'
              }`} />
              <div>
                <p className="font-bold text-[#111111] text-sm">{f.fase}</p>
                <p className="text-gray-500 text-xs mt-0.5">{f.note}</p>
              </div>
              <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${
                f.stato === 'completato' ? 'bg-green-100 text-green-700' :
                f.stato === 'in corso' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {f.stato === 'completato' ? '✓ Completato' : f.stato === 'in corso' ? 'In corso' : 'Pianificato'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-[#6A4C93] text-white rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-extrabold mb-2">Vuoi saperne di più?</h2>
            <p className="text-purple-200 text-sm">
              Per informazioni sul progetto o collaborazioni, contattaci.
            </p>
          </div>
          <Link
            href="/contatti"
            className="flex-shrink-0 bg-white text-[#6A4C93] font-bold px-6 py-3 rounded-xl text-sm hover:bg-purple-50 transition-colors"
          >
            Contattaci
          </Link>
        </div>
      </section>
    </main>
  )
}
