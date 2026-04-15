'use client'

import { useState } from 'react'
import { startAuthentication } from '@simplewebauthn/browser'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function BiometricLogin({ callbackUrl }: { callbackUrl: string }) {
  const router = useRouter()
  const [state, setState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleBiometric() {
    setState('loading')
    setErrorMsg('')

    try {
      // 1. Get authentication options (server generates challenge)
      const optRes = await fetch('/api/auth/webauthn/authenticate-options', {
        method: 'POST',
      })
      const raw = await optRes.json() as Record<string, unknown>
      if (!optRes.ok) throw new Error(String(raw.error) ?? 'Errore opzioni')

      const { sessionId, ...authOptions } = raw

      // 2. Invoke platform authenticator (fingerprint / Face ID)
      let authResponse
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        authResponse = await startAuthentication(authOptions as any)
      } catch (err) {
        if (err instanceof Error && err.name === 'NotAllowedError') {
          throw new Error('Accesso negato. Riprova con la tua impronta.')
        }
        if (err instanceof Error && err.name === 'InvalidStateError') {
          throw new Error('Nessuna impronta registrata per questo sito.')
        }
        throw err
      }

      // 3. Verify on server → get short-lived token
      const verifyRes = await fetch('/api/auth/webauthn/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, response: authResponse }),
      })
      const verifyData = await verifyRes.json() as { token?: string; error?: string }
      if (!verifyRes.ok || !verifyData.token) {
        throw new Error(verifyData.error ?? 'Verifica fallita')
      }

      // 4. Exchange token for NextAuth session
      const result = await signIn('credentials', {
        webauthnToken: verifyData.token,
        email: '',
        password: '',
        redirect: false,
      })

      if (result?.ok) {
        router.push(callbackUrl)
      } else {
        throw new Error('Sessione non creata')
      }
    } catch (err) {
      setState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Errore sconosciuto')
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleBiometric}
        disabled={state === 'loading'}
        className="w-full flex items-center justify-center gap-3 bg-[#111111] hover:bg-[#222222] disabled:opacity-60 text-white font-bold py-3 px-4 rounded-xl transition-colors text-sm"
      >
        {state === 'loading' ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Verifica impronta…
          </>
        ) : (
          <>
            <FingerprintIcon />
            Accedi con impronta digitale
          </>
        )}
      </button>

      {state === 'error' && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
          <span className="flex-shrink-0">⚠️</span>
          {errorMsg}
        </div>
      )}
    </div>
  )
}

function FingerprintIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
    </svg>
  )
}
