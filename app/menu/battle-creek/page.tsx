import Link from 'next/link'
import { Zap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Battle Creek Menu',
  description: 'BeachFit Fuel is coming to Battle Creek, MI. Sign up to be the first to know when we open.',
}

export default function BattleCreekMenuPage() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#FFF8EE' }}>

      {/* Header */}
      <div
        className="py-12 px-4"
        style={{ background: 'linear-gradient(135deg, #FAB65F, #EC8A1E)' }}
      >
        <div className="max-w-5xl mx-auto">
          <Link
            href="/menu"
            className="font-body text-white/70 text-sm hover:text-white transition-colors mb-4 inline-block"
          >
            ← All Locations
          </Link>
          <div className="flex items-center gap-4">
            <Zap size={32} className="text-white" />
            <div>
              <span className="font-body font-800 text-sm tracking-[0.2em] uppercase text-white/70">
                Coming Soon
              </span>
              <h1 className="font-display text-5xl md:text-6xl tracking-wide text-white mt-1">
                BATTLE CREEK
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Coming soon body */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="max-w-lg text-center flex flex-col items-center gap-8">

          <div
            className="w-24 h-24 rounded-full flex items-center justify-center"
            style={{ backgroundColor: '#FAB65F33' }}
          >
            <span className="text-5xl">⚡</span>
          </div>

          <div>
            <h2 className="font-display text-3xl md:text-4xl tracking-wide text-dark">
              THE MENU IS LOADING…
            </h2>
            <p className="font-body text-dark/60 mt-3 text-base leading-relaxed">
              We&apos;re opening our Battle Creek location in the next 90–120 days.
              The full BeachFit Fuel menu — beach bombs, protein shakes, blenders,
              energy drinks, and more — will be available here once we open.
            </p>
          </div>

          <div
            className="w-full rounded-2xl p-6 flex flex-col gap-3"
            style={{ border: '2px dotted #FAB65F' }}
          >
            <p className="font-display text-xl tracking-wide text-dark">
              WANT TO BE FIRST IN LINE?
            </p>
            <p className="font-body text-dark/60 text-sm">
              Sign up for our newsletter and we&apos;ll let you know the moment Battle Creek opens.
            </p>
            <Link
              href="/#newsletter"
              className="block w-full text-center font-display tracking-widest text-base py-3 rounded-full text-white transition-transform hover:scale-[1.02]"
              style={{ backgroundColor: '#EC8A1E' }}
            >
              GET NOTIFIED
            </Link>
          </div>

          <Link
            href="/menu/marshall"
            className="font-body text-sm underline text-dark/50 hover:text-dark transition-colors"
          >
            View the Marshall menu instead →
          </Link>

        </div>
      </div>
    </div>
  )
}
