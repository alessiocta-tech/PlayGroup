import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chi siamo — Play Group S.R.L.',
  description: 'La storia di Play Group S.R.L., gruppo imprenditoriale italiano fondato da Alessio Muzzarelli. Ristorazione, turismo e hospitality a Roma.',
}

const valori = [
  {
    titolo: 'Qualità senza compromessi',
    testo: 'In ogni nostro progetto, dalla cucina al viaggio, mettiamo la qualità al primo posto. Non per un principio astratto, ma perché ci teniamo davvero.',
  },
  {
    titolo: 'Radici italiane',
    testo: 'Siamo romani, italiani. La nostra identità culturale è il filo conduttore che unisce ristoranti, viaggi e strutture ricettive.',
  },
  {
    titolo: 'Innovazione pratica',
    testo: 'Utilizziamo la tecnologia per fare meglio le cose che già facciamo bene. Non la tecnologia per sé stessa, ma al servizio delle persone.',
  },
  {
    titolo: 'Crescita sostenibile',
    testo: 'Ogni nuovo progetto viene avviato con attenzione, senza fretta. Preferiamo consolidare prima di espandere.',
  },
]

const tappe = [
  { anno: '2015', evento: 'Apertura del primo ristorante deRione a Roma Appia' },
  { anno: '2017', evento: 'Espansione deRione con tre nuove location a Roma' },
  { anno: '2019', evento: 'Fondazione Play Viaggi / CTA Tuscolana — tour organizzati' },
  { anno: '2020', evento: 'Avvio Case Vacanze con le prime strutture su villaggi.playviaggi.com' },
  { anno: '2022', evento: 'Apertura deRione Palermo e Reggio Calabria — primo salto fuori Roma' },
  { anno: '2024', evento: 'Costituzione PALERMO FT S.R.L.S. — nuovo progetto hospitality' },
  { anno: '2025', evento: 'Lancio del sistema operativo digitale integrato per tutto il gruppo' },
]

export default function ChiSiamoPage() {
  return (
    <main className="bg-[#EFEFEA] min-h-screen">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-12">
        <div className="max-w-2xl">
          <span className="inline-block bg-[#F0C040] text-[#111111] text-xs font-bold px-3 py-1 rounded-full mb-4">
            Il gruppo
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#111111] leading-tight mb-6">
            Un gruppo costruito<br />su passione e concretezza
          </h1>
          <p className="text-gray-600 text-lg leading-relaxed">
            Play Group S.R.L. è un gruppo imprenditoriale fondato e guidato da Alessio Muzzarelli.
            Opera in tre settori complementari — ristorazione, turismo e hospitality — con una
            visione comune: portare qualità autentica alle persone.
          </p>
        </div>
      </section>

      {/* Fondatore */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-[#111111] rounded-3xl p-8 sm:p-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-[#F0C040] font-bold text-sm mb-3">Fondatore & CEO</p>
              <h2 className="text-3xl font-extrabold mb-4">Alessio Muzzarelli</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                Romano, imprenditore. Ha avviato il primo ristorante deRione nel 2015 con l'idea
                semplice di fare cucina italiana vera, in un locale che sembrasse casa.
              </p>
              <p className="text-gray-400 leading-relaxed">
                Negli anni ha costruito un gruppo diversificato, coordinando quattro realtà
                aziendali con approcci complementari. La filosofia resta la stessa: fare bene
                le cose in cui si crede, senza scorciatoie.
              </p>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="w-48 h-48 bg-[#F0C040] rounded-3xl flex items-center justify-center">
                <span className="text-6xl font-extrabold text-[#111111]">AM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Valori */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-extrabold text-[#111111] mb-8">I nostri valori</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {valori.map((v) => (
            <div key={v.titolo} className="bg-white rounded-2xl p-6">
              <h3 className="font-extrabold text-[#111111] mb-2">{v.titolo}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{v.testo}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <h2 className="text-2xl font-extrabold text-[#111111] mb-8">La nostra storia</h2>
        <div className="space-y-0">
          {tappe.map((t, i) => (
            <div key={t.anno} className="flex gap-6">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 bg-[#F0C040] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-extrabold text-[#111111]">{t.anno.slice(2)}</span>
                </div>
                {i < tappe.length - 1 && <div className="w-0.5 bg-gray-200 flex-1 my-1" />}
              </div>
              <div className="pb-8">
                <p className="text-xs font-bold text-[#F0C040] mb-1">{t.anno}</p>
                <p className="text-[#111111] font-medium text-sm">{t.evento}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-[#F0C040] rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-extrabold text-[#111111] mb-4">
            Vuoi lavorare con noi o collaborare?
          </h2>
          <p className="text-[#111111]/70 mb-6">
            Siamo sempre aperti a nuove opportunità, collaborazioni e persone di talento.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contatti"
              className="bg-[#111111] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#222] transition-colors"
            >
              Scrivici
            </Link>
            <Link
              href="/lavora-con-noi"
              className="bg-white text-[#111111] font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors"
            >
              Posizioni aperte
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
