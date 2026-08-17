'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div
      className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center gap-8"
      style={{ backgroundColor: '#FFF8EE' }}
    >
      <div
        className="w-28 h-28 rounded-full flex items-center justify-center"
        style={{ backgroundColor: '#FAB65F22' }}
      >
        <span className="text-6xl">⚡</span>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="font-display text-3xl md:text-4xl tracking-wide text-dark">
          SOMETHING WENT WRONG
        </h1>
        <p className="font-body text-dark/60 max-w-sm mx-auto leading-relaxed">
          We hit a snag. Try again — it usually clears up in a wave.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={reset}
          className="font-display tracking-widest text-base px-8 py-4 rounded-full text-white transition-transform hover:scale-105"
          style={{ backgroundColor: '#EC8A1E' }}
        >
          TRY AGAIN
        </button>
        <Link
          href="/"
          className="font-display tracking-widest text-base px-8 py-4 rounded-full transition-transform hover:scale-105"
          style={{ backgroundColor: 'white', color: '#2C2C2C', border: '1.5px solid #9BBDCF' }}
        >
          GO HOME
        </Link>
      </div>
    </div>
  )
}
