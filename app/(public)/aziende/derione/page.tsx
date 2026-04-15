import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'deRione — Ristoranti italiani | Play Group',
  description: 'deRione: ristoranti di cucina italiana autentica a Roma, Palermo e Reggio Calabria. 5 location, dal 2015.',
}

const sedi = [
  { nome: 'Roma Appia', indirizzo: 'Via Appia Nuova, Roma', orari: 'Lun–Dom 12:00–15:00, 19:00–23:00' },
  { nome: 'Roma Corso Trieste', indirizzo: 'Corso Trieste, Roma', orari: 'Mar–Dom 12:00–15:00, 19:00–23:00' },
  { nome: 'Roma Talenti', indirizzo: 'Quartiere Talenti, Roma', orari: 'Lun–Dom 12:00–15:00, 19:00–23:00' },
  { nome: 'Palermo', indirizzo: 'Palermo, Sicilia', orari: 'Mar–Dom 12:30–15:00, 19:30–23:00' },
  { nome: 'Reggio Calabria', indirizzo: 'Reggio Calabria', orari: 'Mar–Dom 12:30–15:00, 19:30–23:00' },
]

const punti = [
  { titolo: 'Ingredienti selezionati', testo: 'Prodotti locali e stagionali, filiera corta dove possibile.' },
  { titolo: 'Cucina tradizionale', testo: 'Ricette della tradizione italiana, senza stravolgimenti. La pasta è fatta in casa.' },
  { titolo: 'Accoglienza genuina', testo: 'Un locale dove sentirsi a casa. Il personale è formato per questo.' },
]

export default function DeRionePage() {
  return (
    <main className="bg-[#EFEFEA] min-h-screen">
      {/* Hero */}
      <section className="bg-[#E63946] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <Link href="/aziende" className="text-red-200 text-sm font-bold mb-4 inline-block hover:text-white">
            ← Tutte le aziende
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <span className="text-[#E63946] font-extrabold text-sm">dR</span>
            </div>
            <span className="text-red-200 font-bold text-sm">Ristorazione</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-4">deRione</h1>
          <p className="text-red-100 text-lg max-w-xl leading-relaxed">
            Cucina italiana autentica. Cinque ristoranti tra Roma, Palermo e Reggio Calabria.
            Dal 2015, con la stessa filosofia: fare bene le cose semplici.
          </p>
        </div>
      </section>

      {/* Numeri */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-3 gap-4">
          {[
            { n: '5', label: 'Ristoranti' },
            { n: '2015', label: 'Anno fondazione' },
            { n: '3', label: 'Città' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-6 text-center">
              <p className="text-3xl font-extrabold text-[#E63946]">{s.n}</p>
              <p className="text-xs text-gray-500 font-bold mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Filosofia */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <h2 className="text-2xl font-extrabold text-[#111111] mb-6">La nostra filosofia</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {punti.map((p) => (
            <div key={p.titolo} className="bg-white rounded-2xl p-6">
              <h3 className="font-extrabold text-[#111111] mb-2">{p.titolo}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{p.testo}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sedi */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <h2 className="text-2xl font-extrabold text-[#111111] mb-6">Le nostre sedi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sedi.map((s) => (
            <div key={s.nome} className="bg-[#111111] text-white rounded-2xl p-6">
              <h3 className="font-extrabold text-[#E63946] mb-2">{s.nome}</h3>
              <p className="text-gray-400 text-sm mb-3">{s.indirizzo}</p>
              <p className="text-xs text-gray-500 font-bold">🕐 {s.orari}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA prenotazione */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-[#E63946] text-white rounded-3xl p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold mb-2">Prenota un tavolo</h2>
            <p className="text-red-200 text-sm">
              Scrivi al numero WhatsApp della sede più vicina o contattaci via email.
            </p>
          </div>
          <Link
            href="/contatti"
            className="flex-shrink-0 bg-white text-[#E63946] font-bold px-6 py-3 rounded-xl text-sm hover:bg-red-50 transition-colors"
          >
            Contattaci
          </Link>
        </div>
      </section>
    </main>
  )
}
