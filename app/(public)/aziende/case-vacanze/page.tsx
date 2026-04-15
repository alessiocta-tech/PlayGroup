import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Case Vacanze — Ville e appartamenti | Play Group',
  description: 'Case Vacanze by Play Group: ville e appartamenti per vacanze in Italia. Strutture selezionate per famiglie e gruppi su villaggi.playviaggi.com.',
}

const strutture = [
  { tipo: 'Ville', desc: 'Ville indipendenti con piscina, giardino e cucina attrezzata. Ideali per famiglie o gruppi fino a 12 persone.' },
  { tipo: 'Appartamenti', desc: 'Appartamenti in posizione centrale o vicino al mare. Soluzioni per 2–6 persone.' },
  { tipo: 'Agriturismo', desc: 'Strutture rurali nell\'entroterra italiano. Aria aperta, cucina locale, relax.' },
  { tipo: 'Residenze', desc: 'Appartamenti in residence con servizi condivisi: piscina, reception, pulizie.' },
]

const perche = [
  { icon: '✓', testo: 'Strutture verificate e visitate personalmente' },
  { icon: '✓', testo: 'Assistenza dalla prenotazione al check-out' },
  { icon: '✓', testo: 'Prezzi trasparenti, nessun costo nascosto' },
  { icon: '✓', testo: 'Flessibilità su date e durata del soggiorno' },
]

export default function CaseVacanzePage() {
  return (
    <main className="bg-[#EFEFEA] min-h-screen">
      {/* Hero */}
      <section className="bg-[#F4A261] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <Link href="/aziende" className="text-orange-100 text-sm font-bold mb-4 inline-block hover:text-white">
            ← Tutte le aziende
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <span className="text-[#F4A261] font-extrabold text-sm">CV</span>
            </div>
            <span className="text-orange-100 font-bold text-sm">Hospitality</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4">Case Vacanze</h1>
          <p className="text-orange-100 text-lg max-w-xl leading-relaxed">
            Ville e appartamenti per vacanze in Italia. Strutture selezionate per famiglie
            e gruppi, con gestione professionale e assistenza completa.
          </p>
        </div>
      </section>

      {/* Tipologie */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-extrabold text-[#111111] mb-6">Le nostre strutture</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {strutture.map((s) => (
            <div key={s.tipo} className="bg-white rounded-2xl p-6">
              <div className="w-10 h-10 bg-[#F4A261]/20 rounded-xl flex items-center justify-center mb-4">
                <span className="text-[#F4A261] font-extrabold text-lg">🏡</span>
              </div>
              <h3 className="font-extrabold text-[#111111] mb-2">{s.tipo}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Perché noi */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-[#111111] text-white rounded-3xl p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-2xl font-extrabold mb-6">Perché sceglierci</h2>
            <ul className="space-y-3">
              {perche.map((p) => (
                <li key={p.testo} className="flex items-start gap-3 text-sm text-gray-300">
                  <span className="text-[#F4A261] font-bold mt-0.5">{p.icon}</span>
                  {p.testo}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col justify-center">
            <p className="text-gray-400 text-sm mb-6">
              Tutte le strutture sono disponibili su{' '}
              <span className="text-[#F4A261] font-bold">villaggi.playviaggi.com</span>.
              Per prenotazioni dirette o richieste personalizzate, contattaci.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link
                href="/contatti"
                className="bg-[#F4A261] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#e6934d] transition-colors"
              >
                Richiedi disponibilità
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Periodo */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-3xl p-8">
          <h2 className="text-xl font-extrabold text-[#111111] mb-4">Quando prenotare</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="border border-gray-100 rounded-xl p-4">
              <p className="font-bold text-[#F4A261] mb-1">Estate</p>
              <p className="text-gray-500">Alta stagione: prenotare almeno 2–3 mesi prima. Luglio e agosto esauriscono rapidamente.</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <p className="font-bold text-[#F4A261] mb-1">Primavera / Autunno</p>
              <p className="text-gray-500">Bassa stagione: ottima disponibilità e prezzi convenienti. Clima ideale per visite culturali.</p>
            </div>
            <div className="border border-gray-100 rounded-xl p-4">
              <p className="font-bold text-[#F4A261] mb-1">Natale / Capodanno</p>
              <p className="text-gray-500">Periodo di punta: consigliamo prenotazione anticipata per le strutture più richieste.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
