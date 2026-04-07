import { prisma } from '@/lib/prisma'
import SyncCalendarButton from '@/components/calendar/SyncCalendarButton'

const priorityColor: Record<string, string> = {
  urgent: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-yellow-100 text-yellow-700',
  low: 'bg-gray-100 text-gray-500',
}

const statusColor: Record<string, string> = {
  open: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  done: 'bg-green-100 text-green-700',
  cancelled: 'bg-gray-100 text-gray-400',
}

export default async function CalendarioPage() {
  const now = new Date()

  const [events, tasks] = await Promise.all([
    prisma.event.findMany({
      where: { startAt: { gte: now } },
      orderBy: { startAt: 'asc' },
      take: 20,
    }),
    prisma.task.findMany({
      where: { status: { in: ['open', 'in_progress'] } },
      orderBy: [{ priority: 'asc' }, { dueDate: 'asc' }],
    }),
  ])

  const tasksDone = await prisma.task.count({ where: { status: 'done' } })
  const tasksTotal = await prisma.task.count()
  const overdueTasks = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < now)
  const urgentTasks = tasks.filter((t) => t.priority === 'urgent')

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Calendario & Task</h1>
          <p className="text-sm text-gray-500 mt-1">Agenda, impegni e attività da completare</p>
        </div>
        <SyncCalendarButton />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <div className="text-xs text-gray-400 mb-1">Prossimi eventi</div>
          <div className="text-3xl font-extrabold">{events.length}</div>
        </div>
        <div className={`rounded-2xl p-5 ${urgentTasks.length > 0 ? 'bg-red-50' : 'bg-white'}`}>
          <div className="text-xs text-gray-400 mb-1">Task urgenti</div>
          <div className={`text-3xl font-extrabold ${urgentTasks.length > 0 ? 'text-red-500' : 'text-[#111111]'}`}>
            {urgentTasks.length}
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-1">Task aperti</div>
          <div className="text-3xl font-extrabold text-[#111111]">{tasks.length}</div>
        </div>
        <div className="bg-[#F0C040] rounded-2xl p-5">
          <div className="text-xs text-[#111111]/60 mb-1">Completati</div>
          <div className="text-3xl font-extrabold text-[#111111]">{tasksDone}</div>
          <div className="text-xs text-[#111111]/60 mt-1">su {tasksTotal} totali</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Events */}
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <h2 className="font-extrabold mb-4">Prossimi eventi</h2>
          <div className="space-y-3">
            {events.length === 0 && <p className="text-sm text-gray-500">Nessun evento</p>}
            {events.map((event) => (
              <div key={event.id} className="flex gap-3">
                <div className="text-center flex-shrink-0 w-10">
                  <div className="text-lg font-extrabold text-[#F0C040]">
                    {new Date(event.startAt).getDate()}
                  </div>
                  <div className="text-xs text-gray-500 uppercase">
                    {new Date(event.startAt).toLocaleDateString('it-IT', { month: 'short' })}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold leading-snug">{event.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {event.allDay
                      ? 'Tutto il giorno'
                      : new Date(event.startAt).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                    {event.endAt && !event.allDay &&
                      ` – ${new Date(event.endAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`}
                  </div>
                  {event.location && (
                    <div className="text-xs text-gray-500">{event.location}</div>
                  )}
                </div>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded flex-shrink-0 h-fit ${
                    event.type === 'business'
                      ? 'bg-blue-900 text-blue-300'
                      : event.type === 'deadline'
                      ? 'bg-red-900 text-red-300'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {event.type}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="bg-white rounded-2xl p-5">
          <h2 className="font-extrabold text-[#111111] mb-4">Task aperti</h2>
          <div className="space-y-2">
            {tasks.length === 0 && (
              <p className="text-sm text-gray-400">Tutti i task completati!</p>
            )}
            {tasks.map((task) => {
              const isOverdue = task.dueDate && new Date(task.dueDate) < now
              return (
                <div
                  key={task.id}
                  className={`p-3 rounded-xl ${isOverdue ? 'bg-red-50' : 'bg-[#EFEFEA]'}`}
                >
                  <div className="flex items-start gap-2">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ${priorityColor[task.priority] ?? 'bg-gray-100 text-gray-500'}`}
                    >
                      {task.priority}
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0 ${statusColor[task.status] ?? 'bg-gray-100 text-gray-400'}`}
                    >
                      {task.status}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-[#111111] mt-1.5 leading-snug">
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                      {task.description}
                    </div>
                  )}
                  {task.dueDate && (
                    <div
                      className={`text-xs mt-1 font-medium ${isOverdue ? 'text-red-500' : 'text-gray-400'}`}
                    >
                      {isOverdue ? 'Scaduto: ' : 'Scadenza: '}
                      {new Date(task.dueDate).toLocaleDateString('it-IT')}
                    </div>
                  )}
                  {task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {task.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs bg-white text-gray-400 px-1.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Overdue summary */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
          <div className="text-sm font-extrabold text-red-600 mb-1">
            {overdueTasks.length} task scaduti
          </div>
          <div className="text-xs text-red-500">
            {overdueTasks.map((t) => t.title).join(' · ')}
          </div>
        </div>
      )}
    </div>
  )
}
