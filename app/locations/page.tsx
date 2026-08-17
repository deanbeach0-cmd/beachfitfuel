import Link from 'next/link'
import { MapPin, Phone, Clock, Navigation, Zap } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Locations',
  description:
    'Find a BeachFit Fuel near you. Marshall is open now. Battle Creek opening soon.',
}

const MARSHALL_HOURS = [
  { day: 'Monday',    hours: '6:00 AM – 4:30 PM' },
  { day: 'Tuesday',   hours: '6:00 AM – 4:30 PM' },
  { day: 'Wednesday', hours: '6:00 AM – 4:30 PM' },
  { day: 'Thursday',  hours: '6:00 AM – 4:30 PM' },
  { day: 'Friday',    hours: '6:00 AM – 4:30 PM' },
  { day: 'Saturday',  hours: '9:00 AM – 3:30 PM' },
  { day: 'Sunday',    hours: 'Closed' },
]

const today = new Date().getDay() // 0 = Sunday

function getTodayIndex() {
  // Convert JS day (0=Sun) to our array index (0=Mon)
  const js = new Date().getDay()
  return js === 0 ? 6 : js - 1
}

export default function LocationsPage() {
  const todayIdx = getTodayIndex()

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8EE' }}>

      {/* Header */}
      <div
        className="py-16 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #9BBDCF, #6FBDB8)' }}
      >
        <span className="font-body font-800 text-sm tracking-[0.2em] uppercase text-white/70">
          Find Us
        </span>
        <h1 className="font-display text-5xl md:text-6xl tracking-wide text-white mt-2">
          OUR LOCATIONS
        </h1>
        <p className="font-body text-white/80 mt-3 text-base max-w-md mx-auto">
          Two locations in Michigan — one open now, one coming soon.
        </p>
      </div>

      {/* Location cards */}
      <div className="max-w-5xl mx-auto px-4 py-16 flex flex-col gap-12">

        {/* ── Marshall ──────────────────────────────── */}
        <div className="rounded-3xl overflow-hidden shadow-lg" style={{ border: '1.5px solid #9BBDCF33' }}>

          {/* Card header */}
          <div className="px-8 py-6 flex items-center justify-between" style={{ backgroundColor: '#9BBDCF' }}>
            <div>
              <span className="font-body text-xs tracking-[0.2em] uppercase text-white/70">Open Now</span>
              <h2 className="font-display text-4xl tracking-widest text-white mt-1">MARSHALL</h2>
            </div>
            <span
              className="font-body text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'white', color: '#6FBDB8' }}
            >
              ● OPEN
            </span>
          </div>

          {/* Card body */}
          <div className="bg-white p-8 grid grid-cols-1 md:grid-cols-2 gap-10">

            {/* Left — address + actions */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="mt-0.5 flex-shrink-0" style={{ color: '#9BBDCF' }} />
                  <div>
                    <p className="font-body font-700 text-dark">209 W Michigan Ave</p>
                    <p className="font-body text-dark/60">Marshall, MI 49068</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="flex-shrink-0" style={{ color: '#9BBDCF' }} />
                  <a
                    href="tel:+12692343645"
                    className="font-body font-700 text-dark hover:underline"
                  >
                    (269) 234-3645
                  </a>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href="https://maps.google.com/?q=209+W+Michigan+Ave+Marshall+MI+49068"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 font-display tracking-widest text-sm py-3 px-6 rounded-full text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: '#9BBDCF' }}
                >
                  <Navigation size={16} />
                  GET DIRECTIONS
                </a>
                <Link
                  href="/menu/marshall"
                  className="flex items-center justify-center gap-2 font-display tracking-widest text-sm py-3 px-6 rounded-full transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: '#FFF8EE', color: '#2C2C2C', border: '1.5px solid #9BBDCF' }}
                >
                  VIEW MENU
                </Link>
                <Link
                  href="/order/marshall"
                  className="flex items-center justify-center gap-2 font-display tracking-widest text-sm py-3 px-6 rounded-full text-white transition-transform hover:scale-[1.02]"
                  style={{ backgroundColor: '#FF7B9D' }}
                >
                  ORDER PICKUP
                </Link>
              </div>
            </div>

            {/* Right — hours */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} style={{ color: '#9BBDCF' }} />
                <h3 className="font-display text-lg tracking-widest text-dark">HOURS</h3>
              </div>
              <div className="flex flex-col divide-y divide-dark/5">
                {MARSHALL_HOURS.map((row, i) => (
                  <div
                    key={row.day}
                    className={`flex justify-between py-2.5 ${i === todayIdx ? 'font-bold' : ''}`}
                  >
                    <span
                      className="font-body text-sm"
                      style={{ color: i === todayIdx ? '#FF7B9D' : '#2C2C2C' }}
                    >
                      {i === todayIdx ? `${row.day} (today)` : row.day}
                    </span>
                    <span
                      className="font-body text-sm"
                      style={{ color: row.hours === 'Closed' ? '#2C2C2C66' : i === todayIdx ? '#FF7B9D' : '#2C2C2C' }}
                    >
                      {row.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Battle Creek ──────────────────────────── */}
        <div className="rounded-3xl overflow-hidden shadow-lg opacity-85" style={{ border: '1.5px solid #FAB65F44' }}>

          {/* Card header */}
          <div
            className="px-8 py-6 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #FAB65F, #EC8A1E)' }}
          >
            <div className="flex items-center gap-4">
              <Zap size={28} className="text-white flex-shrink-0" />
              <div>
                <span className="font-body text-xs tracking-[0.2em] uppercase text-white/70">
                  Opening in 90–120 days
                </span>
                <h2 className="font-display text-4xl tracking-widest text-white mt-1">BATTLE CREEK</h2>
              </div>
            </div>
            <span
              className="font-body text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ backgroundColor: 'white', color: '#EC8A1E' }}
            >
              COMING SOON
            </span>
          </div>

          {/* Card body */}
          <div className="bg-white p-8 flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 flex-shrink-0" style={{ color: '#EC8A1E' }} />
                <div>
                  <p className="font-body font-700 text-dark">Battle Creek, MI</p>
                  <p className="font-body text-dark/40 text-sm">Address coming soon</p>
                </div>
              </div>
              <p className="font-body text-dark/60 text-sm leading-relaxed max-w-md">
                The full BeachFit Fuel experience — beach bombs, protein shakes, blenders, and
                energy drinks — is coming to Battle Creek. Sign up to be the first to know when we
                open.
              </p>
              <Link
                href="/#newsletter"
                className="inline-flex items-center justify-center font-display tracking-widest text-sm py-3 px-8 rounded-full text-white transition-transform hover:scale-[1.02] w-fit"
                style={{ backgroundColor: '#EC8A1E' }}
              >
                GET NOTIFIED WHEN WE OPEN
              </Link>
            </div>

            {/* Hours teaser */}
            <div
              className="rounded-2xl p-6 flex flex-col gap-3 min-w-[220px]"
              style={{ backgroundColor: '#FFF8EE', border: '2px dashed #FAB65F' }}
            >
              <div className="flex items-center gap-2">
                <Clock size={16} style={{ color: '#EC8A1E' }} />
                <span className="font-display text-base tracking-widest text-dark">HOURS TBD</span>
              </div>
              <p className="font-body text-dark/50 text-sm">
                Hours will be posted here once Battle Creek opens.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom CTA */}
      <div className="py-12 px-4 text-center" style={{ backgroundColor: '#2C2C2C' }}>
        <p className="font-display text-3xl tracking-wide text-white mb-2">QUESTIONS?</p>
        <p className="font-body text-white/60 mb-6 text-sm">
          Call or text our Marshall location anytime during business hours.
        </p>
        <a
          href="tel:+12692343645"
          className="inline-flex items-center gap-2 font-display tracking-widest text-base px-10 py-4 rounded-full text-white transition-transform hover:scale-105"
          style={{ backgroundColor: '#FF7B9D' }}
        >
          <Phone size={18} />
          (269) 234-3645
        </a>
      </div>
    </div>
  )
}
