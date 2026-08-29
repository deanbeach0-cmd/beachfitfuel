import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Heart, Zap, Users } from 'lucide-react'
import type { Metadata } from 'next'
import { LOCATIONS } from '@/lib/locations'

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'Learn about BeachFit Fuel — how we started, what we stand for, and why we bring the beach to Michigan.',
}

const VALUES = [
  {
    icon: '🏖️',
    title: 'BEACH VIBES, ANY DAY',
    body: "You don't need to be near an ocean to feel like you're on vacation. Every drink we make is designed to transport you — a sip of summer in the middle of Michigan.",
  },
  {
    icon: '💪',
    title: 'FUEL THAT FITS YOUR GOALS',
    body: 'Low-calorie, high-protein, genuinely delicious. We believe healthy drinks shouldn\'t taste like a compromise. You can crush your goals and still treat yourself.',
  },
  {
    icon: '🤝',
    title: 'COMMUNITY FIRST',
    body: "We're a local Michigan business, and this community is the whole reason we exist. Every cup we serve is a thank-you to the people who make Marshall — and soon Battle Creek — home.",
  },
]

export default function OurStoryPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>

      {/* ── Hero ──────────────────────────────────── */}
      <div
        className="py-20 px-4 text-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #FF7B9D, #EC8A1E)' }}
      >
        {/* Decorative circles */}
        <div
          className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-20"
          style={{ backgroundColor: '#FFF8EE' }}
        />
        <div
          className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full opacity-10"
          style={{ backgroundColor: '#FFF8EE' }}
        />

        <div className="relative max-w-2xl mx-auto">
          <span className="font-body font-800 text-sm tracking-[0.2em] uppercase text-white/70">
            Who We Are
          </span>
          <h1 className="font-display text-5xl md:text-7xl tracking-wide text-white mt-2">
            OUR STORY
          </h1>
          <p className="font-body text-white/85 mt-4 text-lg leading-relaxed">
            A specialty drink bar born in Marshall, MI — bringing beach-worthy flavors
            to everyday life.
          </p>
        </div>
      </div>

      {/* ── Origin Story ──────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-8">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: '#FF7B9D' }}
              />
              <span className="font-display text-lg tracking-widest" style={{ color: '#FF7B9D' }}>
                HOW IT STARTED
              </span>
            </div>

            <h2 className="font-display text-4xl md:text-5xl tracking-wide text-dark leading-tight">
              BORN FROM A PASSION FOR BETTER DRINKS
            </h2>

            <div className="flex flex-col gap-5 font-body text-dark/70 text-base leading-relaxed">
              <p>
                BeachFit Fuel started with a simple idea: what if your daily energy drink
                actually tasted like a treat — and didn&apos;t cost you your health goals?
                I was tired of choosing between drinks that were good for you and drinks
                that actually tasted good. So I decided to make both exist in the same cup
                — quick and convenient for our busy lives, without cutting corners on
                flavor or quality.
              </p>
              <p>
                I opened my doors in Marshall, Michigan and immediately felt the warmth of
                this community. Neighbors became regulars, and regulars became family. The
                &quot;beach&quot; in BeachFit Fuel isn&apos;t just a name — it&apos;s the
                feeling I want every customer to walk away with: refreshed, fueled, and
                just a little bit like they&apos;re on vacation.
              </p>
              <p>
                Now, with a Battle Creek location on the horizon, I&apos;m just getting
                started. The goal has always been the same: bring the best-tasting,
                best-for-you specialty drinks to as many people as possible — one beach bomb
                at a time.
              </p>
            </div>
          </div>

          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lg">
            <Image
              src="/images/founder_1.jpg"
              alt="Jennifer, founder of BeachFit Fuel"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
        </div>
      </div>

      {/* ── Values ────────────────────────────────── */}
      <div style={{ backgroundColor: '#2C2C2C' }} className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-body text-sm tracking-[0.2em] uppercase" style={{ color: '#FAB65F' }}>
              What We Stand For
            </span>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide text-white mt-2">
              THE BEACHFIT DIFFERENCE
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="rounded-2xl p-8 flex flex-col gap-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}
              >
                <span className="text-4xl">{v.icon}</span>
                <h3 className="font-display text-xl tracking-widest text-white">{v.title}</h3>
                <p className="font-body text-white/60 text-sm leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── What We Serve ─────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-1 rounded-full"
                style={{ backgroundColor: '#6FBDB8' }}
              />
              <span className="font-display text-lg tracking-widest" style={{ color: '#6FBDB8' }}>
                THE MENU
              </span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl tracking-wide text-dark leading-tight">
              SOMETHING FOR EVERY GOAL
            </h2>
            <p className="font-body text-dark/60 leading-relaxed">
              Whether you&apos;re hitting the gym, starting your morning, or just treating
              yourself — we have a drink for that. Everything on our menu is crafted to
              hit the right balance of flavor and function.
            </p>
            <Link
              href="/menu/marshall"
              className="inline-flex items-center justify-center font-display tracking-widest text-sm px-8 py-4 rounded-full text-white transition-transform hover:scale-[1.02] w-fit"
              style={{ backgroundColor: '#6FBDB8' }}
            >
              BROWSE THE FULL MENU →
            </Link>
          </div>

          {/* Drink category grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { emoji: '🏖️', label: 'Beach Bombs', color: '#9BBDCF' },
              { emoji: '💪', label: 'Protein Shakes', color: '#FF7B9D' },
              { emoji: '🥤', label: 'Blenders', color: '#6FBDB8' },
              { emoji: '🥙', label: 'Food', color: '#EC8A1E' },
            ].map((cat) => (
              <div
                key={cat.label}
                className="rounded-2xl p-6 flex flex-col items-center gap-3 text-center"
                style={{ backgroundColor: `${cat.color}22`, border: `1.5px solid ${cat.color}44` }}
              >
                <span className="text-4xl">{cat.emoji}</span>
                <span
                  className="font-display text-sm tracking-widest"
                  style={{ color: cat.color }}
                >
                  {cat.label.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Locations ─────────────────────────────── */}
      <div
        className="py-16 px-4"
        style={{ background: 'linear-gradient(135deg, #9BBDCF22, #6FBDB822)' }}
      >
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center gap-6">
          <MapPin size={32} style={{ color: '#9BBDCF' }} />
          <h2 className="font-display text-3xl md:text-4xl tracking-wide text-dark">
            FIND US IN MICHIGAN
          </h2>
          <div className="relative w-full max-w-xl aspect-video rounded-3xl overflow-hidden shadow-lg">
            <Image
              src="/images/Marshall_storefront.jpg"
              alt="BeachFit Fuel storefront in Marshall, MI"
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 576px"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-6 w-full max-w-xl">
            <div
              className="flex-1 rounded-2xl p-5 text-center"
              style={{ backgroundColor: 'white', border: '1.5px solid #9BBDCF44' }}
            >
              <p className="font-display text-xl tracking-widest text-dark">MARSHALL</p>
              <p className="font-body text-dark/60 text-sm mt-1">205 W Michigan Ave</p>
              <p className="font-body text-dark/40 text-xs mt-0.5">Open Now</p>
            </div>
            <div
              className="flex-1 rounded-2xl p-5 text-center"
              style={{ backgroundColor: 'white', border: '1.5px solid #FAB65F44' }}
            >
              <p className="font-display text-xl tracking-widest text-dark">BATTLE CREEK</p>
              <p className="font-body text-dark/60 text-sm mt-1">{LOCATIONS['battle-creek'].address}</p>
              <p className="font-body text-dark/40 text-xs mt-0.5">Open Now</p>
            </div>
          </div>
          <Link
            href="/locations"
            className="font-body text-sm underline text-dark/50 hover:text-dark transition-colors"
          >
            View location details and hours →
          </Link>
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────── */}
      <div className="py-16 px-4 text-center" style={{ backgroundColor: '#2C2C2C' }}>
        <h2 className="font-display text-3xl md:text-4xl tracking-wide text-white mb-3">
          COME SAY HI
        </h2>
        <p className="font-body text-white/60 mb-8 text-sm max-w-md mx-auto">
          The best way to experience BeachFit Fuel is in person. Stop in, try something new,
          and let us know what you think.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/menu/marshall"
            className="inline-flex items-center justify-center font-display tracking-widest text-base px-8 py-4 rounded-full text-white transition-transform hover:scale-105"
            style={{ backgroundColor: '#FF7B9D' }}
          >
            SEE THE MENU
          </Link>
          <Link
            href="/locations"
            className="inline-flex items-center justify-center font-display tracking-widest text-base px-8 py-4 rounded-full transition-transform hover:scale-105"
            style={{ backgroundColor: 'transparent', color: 'white', border: '1.5px solid rgba(255,255,255,0.3)' }}
          >
            GET DIRECTIONS
          </Link>
        </div>
      </div>
    </div>
  )
}
