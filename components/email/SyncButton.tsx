'use client'

import { useState } from 'react'

export default function SyncButton() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  async function handleSync() {
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/email/sync', { method: 'POST' })
      const data = await res.json() as { success?: boolean; synced?: number; skipped?: number; total?: number; error?: string; gmailError?: string }
      if (data.success) {
        setStatus(`✅ ${data.synced} nuove email (${data.total} totali) — ricarica la pagina`)
      } else {
        const errMsg = data.gmailError ?? data.error ?? 'sconosciuto'
        setStatus(`❌ ${errMsg.slice(0, 120)}`)
      }
    } catch {
      setStatus('❌ Errore di rete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleSync}
        disabled={loading}
        className="px-4 py-2 bg-[#F0C040] text-[#111111] font-bold rounded-xl text-sm
          hover:bg-[#e0b030] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Sincronizzazione...' : '↻ Sync Gmail'}
      </button>
      {status && (
        <span className="text-sm text-gray-600">{status}</span>
      )}
    </div>
  )
}
