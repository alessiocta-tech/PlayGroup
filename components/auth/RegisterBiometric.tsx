'use client'

import { useState } from 'react'
import { startRegistration } from '@simplewebauthn/browser'

interface RegisteredCredential {
  id: string
  label: string
  createdAt: string
  lastUsed: string | null
  deviceType: string
}

export default function RegisterBiometric({
  credentials,
}: {
  credentials: RegisteredCredential[]
}) {
  const [list, setList] = useState(credentials)
  const [state, setState] = useState<'idle' | 'loading' | 'error' | 'success'>('idle')
  const [msg, setMsg] = useState('')
  const [labelInput, setLabelInput] = useState('')

  async function handleRegister() {
    setState('loading')
    setMsg('')

    try {
      // 1. Get registration options
      const optRes = await fetch('/api/auth/webauthn/register-options', { method: 'POST' })
      const options = await optRes.json()
      if (!optRes.ok) throw new Error(options.error ?? 'Errore opzioni')

      // 2. Invoke platform authenticator (fingerprint prompt)
      let regResponse
      try {
        regResponse = await startRegistration(options)
      } catch (err) {
        if (err instanceof Error && err.name === 'InvalidStateError') {
          throw new Error('Questo dispositivo è già registrato.')
        }
        if (err instanceof Error && err.name === 'NotAllowedError') {
          throw new Error('Registrazione annullata o negata.')
        }
        throw err
      }

      // 3. Verify on server and save
      const verifyRes = await fetch('/api/auth/webauthn/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response: regResponse,
          label: labelInput.trim() || undefined,
        }),
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) throw new Error(verifyData.error ?? 'Registrazione fallita')

      setState('success')
      setMsg('Impronta registrata con successo!')
      setLabelInput('')
      // Refresh the page to show updated list
      setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      setState('error')
      setMsg(err instanceof Error ? err.message : 'Errore sconosciuto')
    }
  }

  return (
    <div className="space-y-5">
      {/* Registered credentials list */}
      {list.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
            Dispositivi registrati
          </h3>
          <div className="space-y-2">
            {list.map((cred) => (
              <div
                key={cred.id}
                className="flex items-center gap-3 bg-[#EFEFEA] rounded-xl px-4 py-3"
              >
                <div className="w-8 h-8 bg-[#111111] rounded-lg flex items-center justify-center flex-shrink-0">
                  <FingerprintIcon className="w-4 h-4 text-[#F0C040]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-[#111111]">{cred.label}</div>
                  <div className="text-xs text-gray-400">
                    Registrato il {new Date(cred.createdAt).toLocaleDateString('it-IT')}
                    {cred.lastUsed && (
                      <> · Usato {new Date(cred.lastUsed).toLocaleDateString('it-IT')}</>
                    )}
                  </div>
                </div>
                <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-lg font-semibold flex-shrink-0">
                  Attivo
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Register new */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#F0C040] rounded-xl flex items-center justify-center flex-shrink-0">
            <FingerprintIcon className="w-5 h-5 text-[#111111]" />
          </div>
          <div>
            <div className="text-sm font-extrabold text-[#111111]">
              {list.length === 0 ? 'Registra impronta digitale' : 'Aggiungi altro dispositivo'}
            </div>
            <div className="text-xs text-gray-500 mt-0.5">
              Usa Touch ID o il sensore biometrico del telefono
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Nome dispositivo <span className="text-gray-400 font-normal">(opzionale)</span>
          </label>
          <input
            type="text"
            value={labelInput}
            onChange={(e) => setLabelInput(e.target.value)}
            placeholder="es. iPhone 15, MacBook Pro"
            maxLength={50}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-[#EFEFEA] text-[#111111] text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F0C040]"
          />
        </div>

        <button
          type="button"
          onClick={handleRegister}
          disabled={state === 'loading'}
          className="w-full flex items-center justify-center gap-2 bg-[#111111] hover:bg-[#222] disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm"
        >
          {state === 'loading' ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Registrazione in corso…
            </>
          ) : (
            <>
              <FingerprintIcon className="w-4 h-4" />
              Registra impronta
            </>
          )}
        </button>

        {(state === 'error' || state === 'success') && msg && (
          <div
            className={`text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 ${
              state === 'success'
                ? 'bg-green-50 border border-green-100 text-green-700'
                : 'bg-red-50 border border-red-100 text-red-600'
            }`}
          >
            <span>{state === 'success' ? '✓' : '⚠️'}</span>
            {msg}
          </div>
        )}
      </div>
    </div>
  )
}

function FingerprintIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
    </svg>
  )
}
