'use client'

import { useState } from 'react'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        setStatus('error')
        setMessage(data.error ?? 'Something went wrong. Please try again.')
      } else {
        setStatus('success')
        setMessage(data.message ?? "You're on the list! 🌴")
        setEmail('')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        required
        disabled={status === 'loading' || status === 'success'}
        className="flex-1 font-body text-dark placeholder-dark/40 px-5 py-3.5 rounded-full bg-white/10 border border-white/30 text-white focus:outline-none focus:border-white/60 focus:bg-white/15 transition-all min-w-0"
        style={{ color: 'white' }}
      />
      <button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        className="font-display tracking-widest text-base px-7 py-3.5 rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
        style={{ backgroundColor: '#FF7B9D', color: 'white' }}
      >
        {status === 'loading' ? 'SIGNING UP…' : status === 'success' ? 'SIGNED UP! 🌴' : 'SIGN ME UP'}
      </button>

      {/* Status message */}
      {message && (
        <p
          className="absolute -bottom-8 left-0 right-0 text-center font-body text-sm"
          style={{ color: status === 'error' ? '#FAB65F' : 'rgba(255,255,255,0.8)' }}
        >
          {message}
        </p>
      )}
    </form>
  )
}
