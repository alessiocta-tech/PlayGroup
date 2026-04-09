'use client'

import { useRef, useState } from 'react'

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function ImportHealthButton() {
  const [status, setStatus] = useState<Status>('idle')
  const [result, setResult] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setStatus('loading')
    setResult('')

    const form = new FormData()
    form.append('file', file)

    try {
      const res = await fetch('/api/health/import', { method: 'POST', body: form })
      const data = await res.json() as { imported?: number; skipped?: number; error?: string }

      if (!res.ok || data.error) {
        setStatus('error')
        setResult(data.error ?? 'Errore sconosciuto')
      } else {
        setStatus('done')
        setResult(`${data.imported} giorni importati, ${data.skipped} saltati — ricarica la pagina`)
      }
    } catch (err) {
      setStatus('error')
      setResult(String(err))
    }

    // Reset input so same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={() => inputRef.current?.click()}
        disabled={status === 'loading'}
        className="flex items-center gap-2 bg-[#111111] text-white font-bold px-5 py-2.5 rounded-xl text-sm hover:bg-[#222] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {status === 'loading' ? 'Importazione...' : 'Importa Apple Health CSV'}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFile}
      />
      {result && (
        <span className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-gray-500'}`}>
          {result}
        </span>
      )}
    </div>
  )
}
