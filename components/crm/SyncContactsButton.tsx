'use client'

import { useState } from 'react'

interface SyncContactsResult {
  synced?: number
  skipped?: number
  total?: number
  error?: string
}

export default function SyncContactsButton() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<string | null>(null)

  async function handleSync() {
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/contacts/sync', { method: 'POST' })
      const data = (await res.json()) as SyncContactsResult
      if (!res.ok || data.error) {
        setStatus(`Errore: ${(data.error ?? 'sconosciuto').slice(0, 120)}`)
      } else {
        setStatus(
          `${data.synced} contatti sincronizzati (${data.skipped} saltati su ${data.total} totali) — ricarica la pagina`
        )
      }
    } catch {
      setStatus('Errore di rete')
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
        {loading ? 'Sincronizzazione...' : '↻ Sync Google Contacts'}
      </button>
      {status && (
        <span className="text-sm text-gray-600">{status}</span>
      )}
    </div>
  )
}
