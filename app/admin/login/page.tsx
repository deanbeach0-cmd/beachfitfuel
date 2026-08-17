'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/admin/categories')
      router.refresh()
    } else {
      setError('Incorrect password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#FFF8EE' }}>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-sm flex flex-col gap-4"
      >
        <h1 className="font-display text-2xl tracking-wide text-dark">ADMIN LOGIN</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoFocus
          className="border border-dark/15 rounded-lg px-4 py-3 font-body focus:outline-none focus:border-dark/40"
        />
        {error && <p className="text-red-600 text-sm font-body">{error}</p>}
        <button
          type="submit"
          disabled={loading || !password}
          className="font-display tracking-widest text-white rounded-full py-3 disabled:opacity-50 transition-transform hover:scale-[1.02]"
          style={{ backgroundColor: '#FF7B9D' }}
        >
          {loading ? 'CHECKING…' : 'LOG IN'}
        </button>
      </form>
    </div>
  )
}
