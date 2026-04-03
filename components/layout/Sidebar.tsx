'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: '⬛' },
  { href: '/admin/aziende', label: 'Aziende', icon: '🏢' },
  { href: '/admin/agenti', label: 'Agenti AI', icon: '🤖' },
  { href: '/admin/whatsapp', label: 'WhatsApp', icon: '💬' },
  { href: '/admin/email', label: 'Email', icon: '📧' },
  { href: '/admin/crm', label: 'CRM', icon: '👤' },
  { href: '/admin/calendario', label: 'Calendario', icon: '📅' },
  { href: '/admin/contabilita', label: 'Contabilità', icon: '💰' },
  { href: '/admin/salute', label: 'Salute', icon: '❤️' },
  { href: '/admin/casa', label: 'Casa', icon: '🏠' },
  { href: '/admin/domotica', label: 'Domotica', icon: '💡' },
  { href: '/admin/bug-tracker', label: 'Bug Tracker', icon: '🐛' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 min-h-screen bg-[#111111] flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="p-5 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#F0C040] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-extrabold text-[#111111]">PG</span>
          </div>
          <div>
            <div className="text-white font-extrabold text-sm leading-tight">Play Group</div>
            <div className="text-gray-500 text-xs">Sistema operativo</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#F0C040] text-[#111111]'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer sidebar */}
      <div className="p-3 border-t border-white/10 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <span>🌐</span>
          <span>Sito pubblico</span>
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors"
        >
          <span>🚪</span>
          <span>Esci</span>
        </button>
      </div>
    </aside>
  )
}
