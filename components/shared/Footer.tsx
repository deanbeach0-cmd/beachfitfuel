import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Instagram, Facebook } from 'lucide-react'

const quickLinks = [
  { href: '/menu',      label: 'Menu' },
  { href: '/shop',      label: 'Shop' },
  { href: '/locations', label: 'Locations' },
  { href: '/our-story', label: 'Our Story' },
]

const orderLinks = [
  { href: '/order/marshall',     label: 'Order — Marshall' },
  { href: '/shop/to-go-packs',   label: 'To-Go Packs' },
  { href: '/shop/apparel',       label: 'Apparel' },
]

export function Footer() {
  return (
    <footer style={{ backgroundColor: '#2C2C2C' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Column 1 — Brand */}
          <div className="flex flex-col gap-4">
            <div className="relative h-12 w-36">
              <Image
                src="/images/logo.png"
                alt="BeachFit Fuel"
                fill
                className="object-contain object-left brightness-0 invert"
              />
            </div>
            <p className="font-display text-2xl tracking-widest text-white leading-tight">
              BEACHFIT FUEL
            </p>
            <p className="font-body text-sm text-white/60 leading-relaxed">
              Low-cal, high-protein drinks that taste like a vacation.
              Two locations in Michigan.
            </p>
            {/* Social */}
            <div className="flex gap-4 mt-2">
              <a
                href="https://instagram.com/beachfitfuel"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-white/60 hover:text-[#FF7B9D] transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="https://facebook.com/beachfitfuel"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="text-white/60 hover:text-[#FF7B9D] transition-colors"
              >
                <Facebook size={20} />
              </a>
              {/* TikTok icon — lucide doesn't include it, using SVG */}
              <a
                href="https://tiktok.com/@beachfitfuel"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="text-white/60 hover:text-[#FF7B9D] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2 — Quick Links */}
          <div>
            <h3 className="font-display text-xl tracking-widest text-[#FF7B9D] mb-4">EXPLORE</h3>
            <ul className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Order */}
          <div>
            <h3 className="font-display text-xl tracking-widest text-[#FF7B9D] mb-4">ORDER & SHOP</h3>
            <ul className="flex flex-col gap-2">
              {orderLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-body text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <span className="font-body text-white/40 text-sm">
                  Battle Creek — Coming Soon
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4 — Locations */}
          <div>
            <h3 className="font-display text-xl tracking-widest text-[#FF7B9D] mb-4">LOCATIONS</h3>
            <div className="flex flex-col gap-5">
              {/* Marshall */}
              <div className="flex flex-col gap-1">
                <p className="font-display text-base tracking-widest text-white">MARSHALL</p>
                <div className="flex items-start gap-2 text-white/60 text-sm">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0 text-[#6FBDB8]" />
                  <span className="font-body">209 W Michigan Ave<br />Marshall, MI</span>
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm">
                  <Phone size={14} className="flex-shrink-0 text-[#6FBDB8]" />
                  <a href="tel:+12695580000" className="font-body hover:text-white transition-colors">
                    (269) 558-0000
                  </a>
                </div>
              </div>
              {/* Battle Creek */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <p className="font-display text-base tracking-widest text-white">BATTLE CREEK</p>
                  <span
                    className="font-body text-xs px-2 py-0.5 rounded-full font-bold"
                    style={{ backgroundColor: '#FAB65F', color: '#2C2C2C' }}
                  >
                    COMING SOON
                  </span>
                </div>
                <p className="font-body text-white/40 text-sm">Battle Creek, MI</p>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="font-body text-white/40 text-sm">
            © {new Date().getFullYear()} BeachFit Fuel. All rights reserved.
          </p>
          <p className="font-body text-white/30 text-xs">
            Marshall, MI · Battle Creek, MI
          </p>
        </div>
      </div>
    </footer>
  )
}
