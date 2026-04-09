import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const statusColor: Record<string, string> = {
  active: 'bg-green-400',
  idle: 'bg-gray-400',
  error: 'bg-red-400',
  paused: 'bg-yellow-400',
}

const statusLabel: Record<string, string> = {
  active: 'In esecuzione',
  idle: 'In attesa',
  error: 'Errore',
  paused: 'In pausa',
}

export default async function ClaudeCodePage() {
  const instances = await prisma.ccInstance.findMany({
    orderBy: { lastUpdate: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Claude Code Controller</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor istanze Claude Code attive sui progetti
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#111111] rounded-2xl p-5 text-white">
          <div className="text-xs text-gray-400 mb-1">Istanze totali</div>
          <div className="text-3xl font-extrabold">{instances.length}</div>
        </div>
        <div className="bg-white rounded-2xl p-5">
          <div className="text-xs text-gray-400 mb-1">In esecuzione</div>
          <div className="text-3xl font-extrabold text-green-500">
            {instances.filter((i) => i.progress > 0 && i.progress < 100).length}
          </div>
        </div>
        <div className="bg-[#F0C040] rounded-2xl p-5">
          <div className="text-xs text-[#111111]/60 mb-1">Completati</div>
          <div className="text-3xl font-extrabold text-[#111111]">
            {instances.filter((i) => i.progress === 100).length}
          </div>
        </div>
      </div>

      {/* Instances list */}
      {instances.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">🤖</div>
          <p className="text-gray-500 text-sm font-medium">Nessuna istanza Claude Code registrata</p>
          <p className="text-gray-400 text-xs mt-1">
            Le istanze vengono aggiunte tramite API quando Claude Code avvia un task
          </p>
          <div className="mt-4 bg-[#EFEFEA] rounded-xl p-4 text-left max-w-sm mx-auto">
            <p className="text-xs text-gray-500 font-semibold mb-1">Endpoint registrazione:</p>
            <code className="text-xs text-[#111111] font-mono">POST /api/claude-code/register</code>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {instances.map((inst) => {
            const minutesAgo = Math.floor(
              (Date.now() - new Date(inst.lastUpdate).getTime()) / 60000
            )
            const isStale = minutesAgo > 30

            return (
              <div
                key={inst.id}
                className={`bg-white rounded-2xl p-5 ${isStale ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          isStale ? 'bg-gray-300' : 'bg-green-400 animate-pulse'
                        }`}
                      />
                      <h3 className="font-extrabold text-[#111111] text-sm">
                        {inst.projectName}
                      </h3>
                    </div>
                    {inst.repoUrl && (
                      <a
                        href={inst.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        {inst.repoUrl}
                      </a>
                    )}
                  </div>
                  <div className="text-xs text-gray-400">
                    {isStale
                      ? `${minutesAgo}m fa — inattivo`
                      : `Aggiornato ${minutesAgo}m fa`}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>Progresso</span>
                    <span>{inst.progress}%</span>
                  </div>
                  <div className="h-2 bg-[#EFEFEA] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        inst.progress === 100
                          ? 'bg-green-400'
                          : inst.progress > 0
                          ? 'bg-[#F0C040]'
                          : 'bg-gray-300'
                      }`}
                      style={{ width: `${inst.progress}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {inst.currentTask && (
                    <div className="bg-[#EFEFEA] rounded-xl p-3">
                      <div className="text-gray-400 mb-0.5">Task corrente</div>
                      <div className="text-[#111111] font-medium leading-snug">
                        {inst.currentTask}
                      </div>
                    </div>
                  )}
                  {inst.currentFile && (
                    <div className="bg-[#EFEFEA] rounded-xl p-3">
                      <div className="text-gray-400 mb-0.5">File in modifica</div>
                      <div className="text-[#111111] font-mono leading-snug break-all">
                        {inst.currentFile}
                      </div>
                    </div>
                  )}
                  {inst.lastCommit && (
                    <div className="bg-[#EFEFEA] rounded-xl p-3 sm:col-span-2">
                      <div className="text-gray-400 mb-0.5">Ultimo commit</div>
                      <div className="text-[#111111] font-mono leading-snug">
                        {inst.lastCommit}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* API docs */}
      <div className="bg-[#111111] rounded-2xl p-5 text-white">
        <h2 className="font-extrabold text-sm mb-3">API per registrare istanze</h2>
        <p className="text-gray-400 text-xs mb-3">
          Chiama questo endpoint da Claude Code o da script CI/CD per aggiornare lo stato:
        </p>
        <div className="bg-white/[0.05] rounded-xl p-4 font-mono text-xs text-gray-300 space-y-1">
          <div className="text-[#F0C040]">POST /api/claude-code/register</div>
          <div className="text-gray-500">Authorization: Bearer {'<NEXTAUTH_SECRET>'}</div>
          <div className="mt-2 text-gray-400">{'{'}</div>
          <div className="pl-4">
            <span className="text-blue-300">&quot;projectName&quot;</span>
            <span className="text-gray-400">: </span>
            <span className="text-green-300">&quot;Play Group&quot;</span>
            <span className="text-gray-400">,</span>
          </div>
          <div className="pl-4">
            <span className="text-blue-300">&quot;currentTask&quot;</span>
            <span className="text-gray-400">: </span>
            <span className="text-green-300">&quot;Implementa modulo chat&quot;</span>
            <span className="text-gray-400">,</span>
          </div>
          <div className="pl-4">
            <span className="text-blue-300">&quot;currentFile&quot;</span>
            <span className="text-gray-400">: </span>
            <span className="text-green-300">&quot;app/admin/chat/page.tsx&quot;</span>
            <span className="text-gray-400">,</span>
          </div>
          <div className="pl-4">
            <span className="text-blue-300">&quot;progress&quot;</span>
            <span className="text-gray-400">: </span>
            <span className="text-yellow-300">45</span>
          </div>
          <div className="text-gray-400">{'}'}</div>
        </div>
      </div>
    </div>
  )
}
