import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function TopBar() {
  const session = await auth()

  const [notifications, pendingTasks] = await Promise.all([
    prisma.notification.count({ where: { read: false } }),
    prisma.task.count({ where: { status: { in: ['open', 'in_progress'] } } }),
  ])

  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buon pomeriggio' : 'Buonasera'

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30">
      <div>
        <span className="text-sm text-gray-500">
          {greeting}, <span className="font-bold text-[#111111]">{session?.user?.name ?? 'Alessio'}</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Task aperti */}
        {pendingTasks > 0 && (
          <div className="flex items-center gap-1.5 bg-[#EFEFEA] px-3 py-1.5 rounded-lg">
            <span className="text-xs">📋</span>
            <span className="text-xs font-semibold text-[#111111]">{pendingTasks} task</span>
          </div>
        )}

        {/* Notifiche */}
        <div className="relative">
          <div className="w-9 h-9 bg-[#EFEFEA] rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
            <span className="text-base">🔔</span>
          </div>
          {notifications > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {notifications > 9 ? '9+' : notifications}
            </span>
          )}
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 bg-[#F0C040] rounded-xl flex items-center justify-center">
          <span className="text-sm font-extrabold text-[#111111]">AM</span>
        </div>
      </div>
    </header>
  )
}
