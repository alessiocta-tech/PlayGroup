'use client'

import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/admin'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Credenziali non valide')
      setLoading(false)
      return
    }

    router.push(callbackUrl)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-semibold text-[#111111] mb-2">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="alessio@playgroupsrl.it"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#EFEFEA] text-[#111111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F0C040] focus:border-transparent text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-[#111111] mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          placeholder="••••••••"
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-[#EFEFEA] text-[#111111] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F0C040] focus:border-transparent text-sm"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#F0C040] hover:bg-[#e6b630] disabled:opacity-60 text-[#111111] font-bold py-3 px-4 rounded-xl transition-colors text-sm"
      >
        {loading ? 'Accesso in corso...' : 'Accedi'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#EFEFEA] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#F0C040] rounded-2xl mb-4">
            <span className="text-2xl font-extrabold text-[#111111]">PG</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#111111]">Play Group</h1>
          <p className="text-sm text-gray-500 mt-1">Area riservata</p>
        </div>

        {/* Card login */}
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <Suspense fallback={<div className="text-center text-sm text-gray-400">Caricamento...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Play Group S.R.L. — Sistema operativo privato
        </p>
      </div>
    </div>
  )
}
