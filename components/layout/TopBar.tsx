import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function TopBar() {
  const session = await auth()

  const [notifications, pendingTasks] = await Promise.all([
    prisma.notification.count({ where: { read: false } }),
    prisma.task.count({ where: { status: { in: ['open', 'in_progress'] } } }),
  ])

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'
  const name = session?.user?.name?.split(' ')[0] ?? 'Alessio'

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-between pl-14 pr-6 md:px-6 sticky top-0 z-30">
      <span className="text-sm text-gray-400">
        {greeting},{' '}
        <span className="font-semibold text-[#111111]">{name}</span>
      </span>

      <div className="flex items-center gap-2">
        {pendingTasks > 0 && (
          <Link
            href="/admin/calendario"
            className="flex items-center gap-1.5 bg-[#EFEFEA] hover:bg-gray-200 transition-colors px-3 py-1.5 rounded-lg"
          >
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs font-semibold text-[#111111]">{pendingTasks}</span>
          </Link>
        )}

        {/* Notifiche */}
        <div className="relative">
          <button className="w-8 h-8 bg-[#EFEFEA] hover:bg-gray-200 transition-colors rounded-lg flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </button>
          {notifications > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {notifications > 9 ? '9+' : notifications}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 bg-[#F0C040] rounded-lg flex items-center justify-center">
          <span className="text-xs font-extrabold text-[#111111]">
            {name.slice(0, 2).toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  )
}
