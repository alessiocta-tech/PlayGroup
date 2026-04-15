'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

// Metadata non può essere in un Client Component — lo esportiamo da un wrapper se serve.
// Per ora usiamo il layout metadata oppure creiamo un server wrapper.

const info = [
  {
    label: 'Sede legale',
    value: 'Roma, Italia',
    icon: '📍',
  },
  {
    label: 'Email generale',
    value: 'info@playgroupsrl.it',
    icon: '✉️',
  },
  {
    label: 'WhatsApp',
    value: '+39 06 — disponibile nelle sedi',
    icon: '💬',
  },
]

const aziende = [
  {
    nome: 'deRione — Ristoranti',
    email: 'prenotazioni@derione.it',
    note: 'Prenotazioni tavoli, info menu, eventi',
  },
  {
    nome: 'Play Viaggi / CTA Tuscolana',
    email: 'info@ctatuscolana.it',
    note: 'Tour organizzati, preventivi viaggi di gruppo',
  },
  {
    nome: 'Case Vacanze',
    email: 'info@playviaggi.com',
    note: 'Disponibilità ville e appartamenti',
  },
  {
    nome: 'PALERMO FT S.R.L.S.',
    email: 'info@playgroupsrl.it',
    note: 'Struttura hospitality in avvio — contattare sede centrale',
  },
]

export default function ContattiPage() {
  const [form, setForm] = useState({ nome: '', email: '', oggetto: '', messaggio: '' })
  const [stato, setStato] = useState<'idle' | 'invio' | 'ok' | 'errore'>('idle')


  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStato('invio')
    try {
      const res = await fetch('/api/contact-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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
          Contatti
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111111] mb-4">
          Scrivici
        </h1>
        <p className="text-gray-600 text-lg max-w-xl">
          Per qualsiasi richiesta relativa a Play Group o alle sue aziende, siamo qui.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Form */}
        <div className="bg-white rounded-3xl p-8">
          <h2 className="font-extrabold text-[#111111] text-xl mb-6">Invia un messaggio</h2>

          {stato === 'ok' ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-4">✅</div>
              <h3 className="font-extrabold text-[#111111] text-lg mb-2">Messaggio inviato!</h3>
              <p className="text-gray-500 text-sm">Ti risponderemo entro 24 ore lavorative.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Nome *</label>
                  <input
                    type="text"
                    required
                    value={form.nome}
                    onChange={(e) => setForm({ ...form, nome: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F0C040] transition-colors"
                    placeholder="Mario Rossi"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F0C040] transition-colors"
                    placeholder="mario@esempio.it"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Oggetto *</label>
                <input
                  type="text"
                  required
                  value={form.oggetto}
                  onChange={(e) => setForm({ ...form, oggetto: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F0C040] transition-colors"
                  placeholder="Come possiamo aiutarti?"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1">Messaggio *</label>
                <textarea
                  required
                  rows={5}
                  value={form.messaggio}
                  onChange={(e) => setForm({ ...form, messaggio: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#F0C040] transition-colors resize-none"
                  placeholder="Scrivi qui il tuo messaggio..."
                />
              </div>
              {stato === 'errore' && (
                <p className="text-red-600 text-xs">Errore nell'invio. Riprova o scrivi direttamente a info@playgroupsrl.it</p>
              )}
              <button
                type="submit"
                disabled={stato === 'invio'}
                className="w-full bg-[#111111] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#222] transition-colors disabled:opacity-50"
              >
                {stato === 'invio' ? 'Invio in corso…' : 'Invia messaggio'}
              </button>
            </form>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Contatti generali */}
          <div className="bg-[#111111] rounded-3xl p-8 text-white">
            <h2 className="font-extrabold text-lg mb-6">Informazioni</h2>
            <div className="space-y-4">
              {info.map((i) => (
                <div key={i.label} className="flex items-start gap-3">
                  <span className="text-xl">{i.icon}</span>
                  <div>
                    <p className="text-xs text-gray-400 font-bold">{i.label}</p>
                    <p className="text-sm text-white">{i.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contatti per azienda */}
          <div className="bg-white rounded-3xl p-8">
            <h2 className="font-extrabold text-[#111111] text-lg mb-6">Per azienda</h2>
            <div className="space-y-4">
              {aziende.map((a) => (
                <div key={a.nome} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                  <p className="font-bold text-[#111111] text-sm">{a.nome}</p>
                  <a
                    href={`mailto:${a.email}`}
                    className="text-xs text-[#F0C040] font-bold hover:underline"
                  >
                    {a.email}
                  </a>
                  <p className="text-xs text-gray-400 mt-1">{a.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
