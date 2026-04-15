import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Play Viaggi / CTA Tuscolana — Tour & Viaggi | Play Group',
  description: 'Play Viaggi e CTA Tuscolana: agenzia di viaggio e tour operator a Roma. Tour organizzati in Italia e nel Mediterraneo per gruppi e privati.',
}

const destinazioni = [
  { nome: 'Sicilia', desc: 'Tour culturali e balneari. Palermo, Agrigento, Taormina, Etna.' },
  { nome: 'Calabria', desc: 'Costa ionica e tirrenica. Tropea, Scilla, Aspromonte.' },
  { nome: 'Roma e Lazio', desc: 'Tour giornalieri e week-end. Arte, storia e gastronomia.' },
  { nome: 'Grecia e Mediterraneo', desc: 'Partenze da Roma. Isole greche, Turchia, Croazia.' },
  { nome: 'Italia del Nord', desc: 'Toscana, Umbria, Venezia, Dolomiti. Tour in gruppo.' },
  { nome: 'Su misura', desc: 'Itinerari personalizzati per gruppi aziendali, scolastici e associazioni.' },
]

export default function PlayViaggPage() {
  return (
    <main className="bg-[#EFEFEA] min-h-screen">
      {/* Hero */}
      <section className="bg-[#2A9D8F] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
          <Link href="/aziende" className="text-teal-200 text-sm font-bold mb-4 inline-block hover:text-white">
            ← Tutte le aziende
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center">
              <span className="text-[#2A9D8F] font-extrabold text-sm">PV</span>
            </div>
            <span className="text-teal-200 font-bold text-sm">Turismo</span>
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold mb-2">Play Viaggi</h1>
          <p className="text-teal-300 font-bold text-lg mb-4">CTA Tuscolana</p>
          <p className="text-teal-100 text-lg max-w-xl leading-relaxed">
            Agenzia di viaggio e tour operator a Roma. Tour organizzati, viaggi di gruppo
            e pacchetti su misura per partenze da Roma verso Italia e Mediterraneo.
          </p>
        </div>
      </section>

      {/* Destinazioni */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-extrabold text-[#111111] mb-6">Destinazioni</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {destinazioni.map((d) => (
            <div key={d.nome} className="bg-white rounded-2xl p-6 hover:shadow-md transition-shadow">
              <h3 className="font-extrabold text-[#2A9D8F] mb-2">{d.nome}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Servizi */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-[#111111] text-white rounded-3xl p-8 sm:p-12">
          <h2 className="text-2xl font-extrabold mb-8">I nostri servizi</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { titolo: 'Tour organizzati', desc: 'Partenze programmate con guida, trasporti e alloggio incluso.' },
              { titolo: 'Viaggi di gruppo', desc: 'Soluzioni per gruppi scolastici, aziendali, associazioni e parrocchie.' },
              { titolo: 'Pacchetti su misura', desc: 'Itinerari costruiti sulle esigenze del cliente, dal weekend alla settimana.' },
              { titolo: 'Assistenza completa', desc: 'Supporto dalla prenotazione al rientro. Sempre raggiungibili.' },
            ].map((s) => (
              <div key={s.titolo} className="flex gap-4">
                <div className="w-2 h-2 bg-[#2A9D8F] rounded-full mt-2 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-white mb-1">{s.titolo}</h3>
                  <p className="text-gray-400 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dove siamo */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-3xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <h2 className="text-xl font-extrabold text-[#111111] mb-2">Dove trovarci</h2>
            <p className="text-gray-500 text-sm mb-1">CTA Tuscolana — Roma</p>
            <p className="text-gray-400 text-sm">P.IVA 12802221007</p>
          </div>
          <Link
            href="/contatti"
            className="flex-shrink-0 bg-[#2A9D8F] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#248f82] transition-colors"
          >
            Richiedi un preventivo
          </Link>
        </div>
      </section>
    </main>
  )
}
