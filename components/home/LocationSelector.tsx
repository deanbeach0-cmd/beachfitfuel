import Link from 'next/link'
import { MapPin, Phone, Clock, Zap, PalmtreeIcon } from 'lucide-react'

const MARSHALL_HOURS = [
  { day: 'Mon – Fri', hours: '7:00 AM – 6:00 PM' },
  { day: 'Saturday',  hours: '8:00 AM – 5:00 PM' },
  { day: 'Sunday',    hours: '9:00 AM – 3:00 PM' },
]

export function LocationSelector() {
  return (
    <section className="bg-white py-16 md:py-24 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Section heading */}
        <div className="text-center mb-12">
          <span className="font-body font-800 text-sm tracking-[0.2em] uppercase" style={{ color: '#6FBDB8' }}>
            Find Us
          </span>
          <h2 className="font-display text-4xl md:text-5xl tracking-wide text-dark mt-2">
            TWO LOCATIONS. ONE VIBE.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ── Marshall Card ── */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-sky/20 flex flex-col">
            {/* Header */}
            <div
              className="px-6 py-5 flex items-center gap-3"
              style={{ backgroundColor: '#9BBDCF' }}
            >
              <PalmtreeIcon size={24} className="text-white flex-shrink-0" />
              <div>
                <p className="font-display text-2xl tracking-widest text-white leading-none">MARSHALL</p>
                <p className="font-body text-white/80 text-sm mt-0.5">Open Now</p>
              </div>
              <span
                className="ml-auto font-body text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: 'white', color: '#6FBDB8' }}
              >
                ● OPEN
              </span>
            </div>

            {/* Body with dotted inner frame */}
            <div className="p-5 flex-1 bg-white">
              <div
                className="rounded-xl p-5 flex flex-col gap-4"
                style={{ border: '2px dotted #9BBDCF' }}
              >
                {/* Address */}
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#6FBDB8' }} />
                  <div>
                    <p className="font-body font-700 text-dark">209 W Michigan Ave</p>
                    <p className="font-body text-dark/60 text-sm">Marshall, MI 49068</p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-center gap-3">
                  <Phone size={18} className="flex-shrink-0" style={{ color: '#6FBDB8' }} />
                  <a
                    href="tel:+12695580000"
                    className="font-body text-dark hover:text-teal transition-colors"
                  >
                    (269) 558-0000
                  </a>
                </div>

                {/* Hours */}
                <div className="flex items-start gap-3">
                  <Clock size={18} className="flex-shrink-0 mt-0.5" style={{ color: '#6FBDB8' }} />
                  <div className="flex flex-col gap-1">
                    {MARSHALL_HOURS.map((row) => (
                      <div key={row.day} className="flex gap-2 text-sm font-body">
                        <span className="text-dark/60 w-24">{row.day}</span>
                        <span className="text-dark font-600">{row.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="p-5 pt-0 bg-white">
              <Link
                href="/order/marshall"
                className="block w-full text-center font-display tracking-widest text-base py-3 rounded-full text-white transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: '#FF7B9D' }}
              >
                ORDER PICKUP — MARSHALL
              </Link>
            </div>
          </div>

          {/* ── Battle Creek Card ── */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-yellow/30 flex flex-col">
            {/* Header */}
            <div
              className="px-6 py-5 flex items-center gap-3"
              style={{ background: 'linear-gradient(135deg, #FAB65F, #EC8A1E)' }}
            >
              <Zap size={24} className="text-white flex-shrink-0" />
              <div>
                <p className="font-display text-2xl tracking-widest text-white leading-none">BATTLE CREEK</p>
                <p className="font-body text-white/80 text-sm mt-0.5">Coming in 90–120 days</p>
              </div>
              <span
                className="ml-auto font-body text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: 'white', color: '#EC8A1E' }}
              >
                COMING SOON
              </span>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 bg-white flex flex-col items-center justify-center text-center gap-5">
              <div
                className="rounded-xl p-8 w-full flex flex-col items-center gap-4"
                style={{ border: '2px dotted #FAB65F' }}
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: '#FAB65F22' }}
                >
                  <Zap size={32} style={{ color: '#EC8A1E' }} />
                </div>
                <div>
                  <p className="font-display text-2xl tracking-wide text-dark">BATTLE CREEK, MI</p>
                  <p className="font-body text-dark/60 mt-2 text-sm leading-relaxed">
                    We&apos;re bringing the same great drinks and vibes to Battle Creek.
                    Sign up to be the first to know when we open!
                  </p>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="p-5 pt-0 bg-white">
              <a
                href="#newsletter"
                className="block w-full text-center font-display tracking-widest text-base py-3 rounded-full text-white transition-transform hover:scale-[1.02]"
                style={{ backgroundColor: '#EC8A1E' }}
              >
                GET NOTIFIED
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
