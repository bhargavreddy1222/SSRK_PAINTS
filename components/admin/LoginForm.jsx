'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Login failed')
      }
      router.replace('/admin')
      router.refresh()
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <label className="block mb-4">
        <span className="block text-xs font-semibold text-stone-600 mb-1.5">Password</span>
        <span className="relative block">
          <input
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            // Phones capitalise the first letter by default, which breaks the password
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            autoFocus
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full pl-3.5 pr-16 py-3 border border-stone-200 rounded-xl text-base sm:text-sm bg-stone-50 outline-none transition focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          />
          <button
            type="button"
            onClick={() => setShowPassword(s => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-xs font-semibold text-stone-500 hover:text-stone-900 bg-transparent border-0 cursor-pointer"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </span>
      </label>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="w-full bg-stone-900 hover:bg-stone-700 disabled:bg-stone-400 text-white font-bold text-sm py-3 rounded-xl transition-colors border-0 cursor-pointer"
      >
        {loading ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  )
}
