'use client'

import { useState } from 'react'

export default function SyncCalendarButton() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  async function handleSync() {
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/calendar/sync', { method: 'POST' })
      const data = await res.json() as { success?: boolean; message?: string; error?: string }
      if (data.success) {
        setStatus('✅ Sincronizzato — ricarica la pagina')
      } else {
        setStatus(`❌ ${data.error ?? 'Errore sconosciuto'}`)
      }
    } catch {
      setStatus('❌ Errore di rete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={handleSync}
        disabled={loading}
        className="px-4 py-2 bg-[#F0C040] text-[#111111] font-bold rounded-xl text-sm
          hover:bg-[#e0b030] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Sincronizzazione...' : '↻ Sync Google Calendar'}
      </button>
      {status && <span className="text-sm text-gray-600">{status}</span>}
    </div>
  )
}
