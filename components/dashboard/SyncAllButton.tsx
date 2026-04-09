'use client'

import { useState } from 'react'

type SyncStatus = 'idle' | 'loading' | 'done' | 'error'

interface SyncResult {
  success?: boolean
  error?: string
  synced?: number
  skipped?: number
}

export default function SyncAllButton() {
  const [status, setStatus] = useState<SyncStatus>('idle')
  const [summary, setSummary] = useState<string>('')

  async function handleSync() {
    setStatus('loading')
    setSummary('')

    try {
      const res = await fetch('/api/sync-all', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setSummary(data.error ?? 'Errore sconosciuto')
        return
      }

      const r = data.results as Record<string, SyncResult>
      const parts: string[] = []

      if (r.email?.synced !== undefined) parts.push(`${r.email.synced} email`)
      if (r.calendar?.success) parts.push('calendario ✓')
      if (r.contacts?.synced !== undefined) parts.push(`${r.contacts.synced} contatti`)
      if (r.tasks?.synced !== undefined) parts.push(`${r.tasks.synced} task`)

      const errors = Object.entries(r)
        .filter(([, v]) => v?.error)
        .map(([k]) => k)

      setSummary(
        parts.join(', ') + (errors.length ? ` — errori: ${errors.join(', ')}` : '')
      )
      setStatus(errors.length === 4 ? 'error' : 'done')
    } catch (err) {
      setStatus('error')
      setSummary(String(err))
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleSync}
        disabled={status === 'loading'}
        className="flex items-center gap-2 bg-[#F0C040] text-[#111111] font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#e0b030] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg
          className={`w-4 h-4 ${status === 'loading' ? 'animate-spin' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        {status === 'loading' ? 'Sincronizzazione...' : 'Sync Google'}
      </button>

      {summary && (
        <span className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-gray-500'}`}>
          {summary}
        </span>
      )}
    </div>
  )
}
