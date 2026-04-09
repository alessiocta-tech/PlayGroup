import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#EFEFEA] flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-sm">
        {/* Logo */}
        <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F0C040] rounded-2xl mb-6">
          <span className="text-2xl font-extrabold text-[#111111]">PG</span>
        </div>

        <h1 className="text-4xl font-extrabold text-[#111111] mb-2">Play Group</h1>
        <p className="text-gray-500 text-sm mb-8">
          Ristorazione, turismo e hospitality. Roma, Italia.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href="/aziende"
            className="bg-[#111111] text-white font-bold px-6 py-3 rounded-xl text-sm hover:bg-[#222] transition-colors"
          >
            Le nostre aziende
          </Link>
          <Link
            href="/contatti"
            className="bg-white text-[#111111] font-bold px-6 py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors border border-gray-200"
          >
            Contattaci
          </Link>
          <Link
            href="/login"
            className="text-gray-400 text-xs py-2 hover:text-gray-600 transition-colors"
          >
            Accedi al gestionale →
          </Link>
        </div>
      </div>

      <p className="absolute bottom-6 text-xs text-gray-400">
        © 2025 Play Group S.R.L.
      </p>
    </div>
  )
}
