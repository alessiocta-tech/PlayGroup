'use client'

import { useEffect, useState, useCallback } from 'react'
import type { WhapiChannelStatus } from '@/app/api/whatsapp/status/route'

const POLL_INTERVAL_MS = 10_000

export default function WhatsappConnect() {
  const [status, setStatus] = useState<WhapiChannelStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/whatsapp/status', { cache: 'no-store' })
      if (!res.ok) throw new Error('Errore nel recupero dello stato')
      const data: WhapiChannelStatus = await res.json()
      setStatus(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Poll while not yet active
  useEffect(() => {
    if (status?.status === 'active') return
    const id = setInterval(fetchStatus, POLL_INTERVAL_MS)
    return () => clearInterval(id)
  }, [status?.status, fetchStatus])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#EFEFEA] animate-pulse flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <div className="h-3 bg-[#EFEFEA] rounded animate-pulse w-1/3" />
          <div className="h-2 bg-[#EFEFEA] rounded animate-pulse w-1/2" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <span className="text-red-500 text-sm">!</span>
        </div>
        <div>
          <div className="text-sm font-semibold text-[#111111]">Connessione WhatsApp</div>
          <div className="text-xs text-red-500 mt-0.5">{error}</div>
        </div>
        <button
          onClick={fetchStatus}
          className="ml-auto text-xs text-[#F0C040] hover:underline"
        >
          Riprova
        </button>
      </div>
    )
  }

  // ── ACTIVE ──────────────────────────────────────────────────────────────────
  if (status?.status === 'active') {
    return (
      <div className="bg-[#111111] rounded-2xl p-5 flex items-center gap-4">
        <div className="w-10 h-10 bg-[#25D366] rounded-2xl flex items-center justify-center flex-shrink-0">
          <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-extrabold">WhatsApp Connesso</span>
            <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
          </div>
          {status.name && (
            <div className="text-gray-400 text-xs mt-0.5 truncate">{status.name}</div>
          )}
          {status.phone && (
            <div className="text-gray-500 text-xs">{status.phone}</div>
          )}
        </div>
        {status.battery !== undefined && (
          <div className="flex flex-col items-end flex-shrink-0">
            <div className="text-gray-400 text-[10px]">Batteria</div>
            <div className={`text-sm font-extrabold ${status.battery < 20 ? 'text-red-400' : 'text-[#F0C040]'}`}>
              {status.battery}%
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── LOADING / UNKNOWN ────────────────────────────────────────────────────────
  if (status?.status === 'loading') {
    return (
      <div className="bg-white rounded-2xl p-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#EFEFEA] flex items-center justify-center flex-shrink-0">
          <span className="w-4 h-4 border-2 border-[#F0C040] border-t-transparent rounded-full animate-spin" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[#111111]">Connessione in corso…</div>
          <div className="text-xs text-gray-400 mt-0.5">WhatsApp si sta avviando, attendi</div>
        </div>
      </div>
    )
  }

  // ── BLOCKED ──────────────────────────────────────────────────────────────────
  if (status?.status === 'blocked') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
          <span className="text-red-500 font-bold">✗</span>
        </div>
        <div>
          <div className="text-sm font-semibold text-red-700">Account bloccato</div>
          <div className="text-xs text-red-500 mt-0.5">Il numero WhatsApp risulta bloccato da WhatsApp</div>
        </div>
      </div>
    )
  }

  // ── UNPAIRED — show QR ───────────────────────────────────────────────────────
  return (
    <div className="bg-white rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-extrabold text-[#111111]">Connetti WhatsApp</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            Apri WhatsApp sul telefono → Impostazioni → Dispositivi collegati → Collega un dispositivo
          </p>
          <ol className="mt-3 space-y-1.5">
            {[
              'Apri WhatsApp sul tuo telefono',
              'Vai su Impostazioni → Dispositivi collegati',
              'Tocca "Collega un dispositivo"',
              'Inquadra il QR code',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
                <span className="w-4 h-4 rounded-full bg-[#F0C040] text-[#111111] font-bold text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-3 flex items-center gap-1.5 text-[10px] text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" />
            Aggiornamento automatico ogni {POLL_INTERVAL_MS / 1000}s
          </div>
        </div>

        {/* QR code */}
        <div className="flex-shrink-0">
          {status?.qr ? (
            <div className="p-2 bg-white border-2 border-[#F0C040] rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={status.qr.startsWith('data:') ? status.qr : `data:image/png;base64,${status.qr}`}
                alt="QR Code WhatsApp"
                width={140}
                height={140}
                className="rounded-lg"
              />
            </div>
          ) : (
            <div className="w-[156px] h-[156px] border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-[#F0C040] rounded-full animate-spin mx-auto" />
                <div className="text-[10px] text-gray-400 mt-2">Caricamento QR…</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
