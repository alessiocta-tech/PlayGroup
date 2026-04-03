import { prisma } from '@/lib/prisma'

const statusColor: Record<string, string> = {
  on: 'bg-green-100 text-green-700',
  off: 'bg-gray-100 text-gray-500',
  unknown: 'bg-yellow-100 text-yellow-600',
  error: 'bg-red-100 text-red-600',
}

const statusDot: Record<string, string> = {
  on: 'bg-green-400',
  off: 'bg-gray-300',
  unknown: 'bg-yellow-400',
  error: 'bg-red-400',
}

export default async function DomoticaPage() {
  const [devices, events] = await Promise.all([
    prisma.homeDevice.findMany({
      orderBy: [{ room: 'asc' }, { name: 'asc' }],
      include: {
        events: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    }),
    prisma.homeEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20,
      include: { device: true },
    }),
  ])

  const online = devices.filter((d) => d.status === 'on').length
  const errors = devices.filter((d) => d.status === 'error').length

  const byRoom = devices.reduce<Record<string, typeof devices>>((acc, d) => {
    const room = d.room ?? 'Altro'
    acc[room] = [...(acc[room] ?? []), d]
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111111]">Domotica</h1>
        <p className="text-sm text-gray-500 mt-1">Stato dispositivi Home Assistant</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <div className="text-xs text-gray-400 mb-1">Dispositivi totali</div>
          <div className="text-3xl font-extrabold">{devices.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-1">Accesi</div>
          <div className="text-3xl font-extrabold text-green-600">{online}</div>
        </div>
        <div className={`rounded-2xl p-5 ${errors > 0 ? 'bg-red-50' : 'bg-white'}`}>
          <div className="text-xs text-gray-400 mb-1">Errori</div>
          <div className={`text-3xl font-extrabold ${errors > 0 ? 'text-red-500' : 'text-[#111111]'}`}>
            {errors}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Devices by room */}
        <div className="space-y-4">
          {Object.keys(byRoom).length === 0 && (
            <div className="bg-white rounded-2xl p-5">
              <p className="text-sm text-gray-400">Nessun dispositivo registrato</p>
            </div>
          )}
          {Object.entries(byRoom).map(([room, roomDevices]) => (
            <div key={room} className="bg-white rounded-2xl p-5">
              <h2 className="font-extrabold text-[#111111] mb-3">{room}</h2>
              <div className="space-y-2">
                {roomDevices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center gap-3 p-2 rounded-lg bg-[#EFEFEA]"
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        statusDot[device.status] ?? 'bg-gray-300'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-[#111111]">{device.name}</div>
                      <div className="text-xs text-gray-400">{device.type}</div>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-lg font-semibold flex-shrink-0 ${
                        statusColor[device.status] ?? 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {device.status}
                    </span>
                    {device.lastSeen && (
                      <div className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(device.lastSeen).toLocaleTimeString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Recent events */}
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <h2 className="font-extrabold mb-4">Ultimi eventi</h2>
          <div className="space-y-3">
            {events.length === 0 && (
              <p className="text-sm text-gray-500">Nessun evento</p>
            )}
            {events.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className="text-xs text-gray-500 flex-shrink-0 w-12">
                  {new Date(event.timestamp).toLocaleTimeString('it-IT', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold">{event.device.name}</div>
                  <div className="text-xs text-gray-400">
                    {event.eventType}
                    {event.value ? ` → ${event.value}` : ''}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
