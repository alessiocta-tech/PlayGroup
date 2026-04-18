import Link from 'next/link'
import dynamic from 'next/dynamic'

// Canvas ASCII effect — client only
const AsciiHero = dynamic(() => import('@/components/public/AsciiHero'), { ssr: false })

export default function HomePage() {
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center overflow-hidden">

        {/* Code rain canvas background */}
        <AsciiHero />

        {/* Radial vignette so text stays readable */}
        <div className="absolute inset-0 z-[1]" style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 50%, transparent 0%, rgba(13,13,13,0.72) 100%)' }} />

        {/* Overlay content */}
        <div className="relative z-10 text-center px-6 max-w-2xl mx-auto pointer-events-none select-none">
          <p className="text-[10px] font-medium tracking-[0.3em] text-[#F0C040] uppercase mb-6">
            Roma · Italia
          </p>
          <h1 className="text-5xl sm:text-7xl font-extrabold text-white leading-none tracking-tight mb-4">
            Play Group
          </h1>
          <p className="text-white/40 text-sm sm:text-base tracking-wide">
            Ristorazione · Turismo · Hospitality
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 mt-16 pointer-events-auto">
          <Link
            href="/aziende"
            className="px-7 py-3 bg-[#F0C040] text-[#111111] font-bold text-sm rounded-xl hover:bg-[#e6b800] transition-colors"
          >
            Le nostre aziende
          </Link>
          <Link
            href="/contatti"
            className="px-7 py-3 bg-white/[0.08] text-white font-bold text-sm rounded-xl hover:bg-white/[0.14] transition-colors border border-white/10"
          >
            Contattaci
          </Link>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20 text-[10px] tracking-widest uppercase">
          <span>Scorri</span>
          <span className="w-px h-8 bg-white/20 animate-pulse" />
        </div>
      </section>

      {/* ── AZIENDE STRIP ─────────────────────────────────────────────────── */}
      <section className="bg-[#EFEFEA] py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.25em] text-gray-400 uppercase mb-12 text-center">
            4 aziende · un gruppo
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { name: 'deRione',          sub: 'Ristorazione · 5 location',            href: '/aziende/derione',       color: 'bg-[#111111] text-white'     },
              { name: 'Play Viaggi',       sub: 'Turismo · CTA Tuscolana',              href: '/aziende/play-viaggi',   color: 'bg-[#F0C040] text-[#111111]' },
              { name: 'Case Vacanze',      sub: 'Hospitality · Appartamenti',           href: '/aziende/case-vacanze',  color: 'bg-white text-[#111111]'     },
              { name: 'PALERMO FT',        sub: 'Hospitality · In avvio',               href: '/aziende/palermo-ft',    color: 'bg-[#111111] text-white'     },
            ].map((a) => (
              <Link
                key={a.name}
                href={a.href}
                className={`${a.color} rounded-2xl p-7 flex items-end justify-between hover:opacity-90 transition-opacity group`}
              >
                <div>
                  <div className="text-xl font-extrabold">{a.name}</div>
                  <div className="text-sm opacity-50 mt-1">{a.sub}</div>
                </div>
                <span className="text-2xl opacity-30 group-hover:opacity-70 transition-opacity">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER NAV ────────────────────────────────────────────────────── */}
      <section className="bg-[#EFEFEA] border-t border-black/5 py-8 px-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">© 2025 Play Group S.R.L.</p>
          <Link
            href="/login"
            className="text-xs text-gray-400 hover:text-[#111111] transition-colors"
          >
            Accedi al gestionale →
          </Link>
        </div>
      </section>
    </>
  )
}
