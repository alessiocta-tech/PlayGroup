import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#F0C040] rounded-lg flex items-center justify-center">
                <span className="text-xs font-extrabold text-[#111111]">PG</span>
              </div>
              <span className="font-extrabold text-lg">Play Group S.R.L.</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Gruppo imprenditoriale italiano attivo nella ristorazione,
              nel turismo e nell'hospitality.
            </p>
            <p className="text-gray-500 text-xs mt-4">Roma, Italia</p>
          </div>

          {/* Aziende */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-[#F0C040]">Le nostre aziende</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/aziende/derione" className="hover:text-white transition-colors">deRione</Link></li>
              <li><Link href="/aziende/play-viaggi" className="hover:text-white transition-colors">Play Viaggi</Link></li>
              <li><Link href="/aziende/case-vacanze" className="hover:text-white transition-colors">Case Vacanze</Link></li>
              <li><Link href="/aziende/palermo-ft" className="hover:text-white transition-colors">PALERMO FT</Link></li>
            </ul>
          </div>

          {/* Link */}
          <div>
            <h3 className="font-bold text-sm mb-4 text-[#F0C040]">Informazioni</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/chi-siamo" className="hover:text-white transition-colors">Chi siamo</Link></li>
              <li><Link href="/contatti" className="hover:text-white transition-colors">Contatti</Link></li>
              <li><Link href="/lavora-con-noi" className="hover:text-white transition-colors">Lavora con noi</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} Play Group S.R.L. — Tutti i diritti riservati
          </p>
          <p className="text-gray-600 text-xs">P.IVA e C.F. in intestazione</p>
        </div>
      </div>
    </footer>
  )
}
