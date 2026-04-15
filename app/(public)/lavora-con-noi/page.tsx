'use client'

import { useState } from 'react'
import Link from 'next/link'

const posizioni = [
  {
    titolo: 'Chef de Partie — deRione',
    azienda: 'deRione',
    tipo: 'Full-time',
    sede: 'Roma (varie sedi)',
    descrizione: 'Cerchiamo un cuoco con esperienza in cucina italiana tradizionale. Gestione del proprio reparto, supervisione mise en place, qualità degli ingredienti.',
    requisiti: ['Minimo 3 anni in cucina strutturata', 'Conoscenza approfondita della cucina laziale', 'Capacità di lavorare in team'],
  },
  {
    titolo: 'Cameriere / Sala — deRione',
    azienda: 'deRione',
    tipo: 'Full-time / Part-time',
    sede: 'Roma (varie sedi)',
    descrizione: 'Accoglienza e servizio ai tavoli con attenzione all\'esperienza ospite. Conoscenza dei piatti e del vino.',
    requisiti: ['Esperienza in sala di almeno 1 anno', 'Italiano madrelingua, inglese base', 'Buona presenza e comunicativa'],
  },
  {
    titolo: 'Consulente Viaggi — Play Viaggi',
    azienda: 'Play Viaggi',
    tipo: 'Full-time',
    sede: 'Roma — CTA Tuscolana',
    descrizione: 'Consulenza e vendita di tour organizzati, pacchetti viaggio e soggiorni. Gestione clienti da preventivo a partenza.',
    requisiti: ['Diploma o laurea in turismo', 'Passione per i viaggi e la cultura italiana', 'Esperienza con GDS o software agenzie'],
  },
  {
    titolo: 'Receptionist — Case Vacanze',
    azienda: 'Case Vacanze',
    tipo: 'Stagionale / Full-time',
    sede: 'Remoto + sedi',
    descrizione: 'Gestione prenotazioni, accoglienza ospiti, comunicazione con piattaforme (Booking, Airbnb). Orari flessibili.',
    requisiti: ['Ottime doti comunicative', 'Italiano e inglese fluenti', 'Esperienza in hospitality o reception'],
  },
]

const benefici = [
  { icon: '🌱', testo: 'Ambiente giovane e in crescita' },
  { icon: '💡', testo: 'Possibilità di crescita interna' },
  { icon: '🤝', testo: 'Team coeso e collaborativo' },
  { icon: '📍', testo: 'Sedi a Roma e in Italia' },
]

export default function LavoraConNoiPage() {
  const [form, setForm] = useState({ nome: '', email: '', posizione: '', messaggio: '' })
  const [stato, setStato] = useState<'idle' | 'invio' | 'ok' | 'errore'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStato('invio')
    try {
      const res = await fetch('/api/contact-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, tipo: 'candidatura' }),
      })
      if (!res.ok) throw new Error('Errore invio')
      setStato('ok')
    } catch {
      setStato('errore')
    }
  }

  return (
    <main className="bg-[#EFEFEA] min-h-screen">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <span className="inline-block bg-[#F0C040] text-[#111111] text-xs font-bold px-3 py-1 rounded-full mb-4">
          Careers
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111111] mb-4">
          Lavora con noi
        </h1>
        <p className="text-gray-600 text-lg max-w-xl">
          Siamo un gruppo in crescita. Se vuoi far parte di un team che costruisce cose vere —
          ristoranti, viaggi, esperienze — scrivici.
        </p>
      </section>

      {/* Benefici */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {benefici.map((b) => (
            <div key={b.testo} className="bg-white rounded-2xl p-5 text-center">
              <div className="text-2xl mb-2">{b.icon}</div>
              <p className="text-xs font-bold text-[#111111]">{b.testo}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Posizioni aperte */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-2xl font-extrabold text-[#111111] mb-6">Posizioni aperte</h2>
        <div className="space-y-4">
          {posizioni.map((p) => (
            <details key={p.titolo} className="bg-white rounded-2xl group">
              <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none">
                <div>
                  <h3 className="font-extrabold text-[#111111]">{p.titolo}</h3>
                  <div className="flex gap-3 mt-1">
                    <span className="text-xs text-gray-400">{p.sede}</span>
                    <span className="text-xs bg-[#F0C040]/20 text-[#111111] font-bold px-2 py-0.5 rounded-full">{p.tipo}</span>
                  </div>
                </div>
                <span className="text-gray-400 group-open:rotate-180 transition-transform text-lg">▾</span>
              </summary>
              <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                <p className="text-sm text-gray-600 mb-4">{p.descrizione}</p>
                <ul className="space-y-1">
                  {p.requisiti.map((r) => (
                    <li key={r} className="flex items-start gap-2 text-sm text-gray-500">
                      <span className="text-[#F0C040] mt-0.5">✓</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* Candidatura spontanea */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-[#111111] rounded-3xl p-8 sm:p-12">
          <h2 className="text-2xl font-extrabold text-white mb-2">Candidatura spontanea</h2>
          <p className="text-gray-400 text-sm mb-8">
            Non trovi la posizione giusta? Mandaci il tuo CV — teniamo sempre d'occhio le persone interessanti.
          </p>

          {stato === 'ok' ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-white font-bold">Candidatura ricevuta!</p>
              <p className="text-gray-400 text-sm mt-1">Ti contatteremo se ci sarà una posizione adatta.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Nome e cognome *</label>
                <input
                  type="text"
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F0C040]"
                  placeholder="Mario Rossi"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F0C040]"
                  placeholder="mario@esempio.it"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-400 mb-1">Ruolo di interesse</label>
                <input
                  type="text"
                  value={form.posizione}
                  onChange={(e) => setForm({ ...form, posizione: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F0C040]"
                  placeholder="Es. cuoco, consulente viaggi, receptionist…"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-400 mb-1">Presentati brevemente *</label>
                <textarea
                  required
                  rows={3}
                  value={form.messaggio}
                  onChange={(e) => setForm({ ...form, messaggio: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#F0C040] resize-none"
                  placeholder="Qualche riga su di te, la tua esperienza e perché vorresti unirti a Play Group…"
                />
              </div>
              <div className="sm:col-span-2 space-y-3">
                {stato === 'errore' && (
                  <p className="text-red-400 text-xs">Errore nell'invio. Scrivi direttamente a info@playgroupsrl.it</p>
                )}
                <button
                  type="submit"
                  disabled={stato === 'invio'}
                  className="bg-[#F0C040] text-[#111111] font-bold px-8 py-3 rounded-xl text-sm hover:bg-[#e6b630] transition-colors disabled:opacity-50"
                >
                  {stato === 'invio' ? 'Invio…' : 'Invia candidatura'}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  )
}
