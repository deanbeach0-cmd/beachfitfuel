import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { MobileMenu } from './MobileMenu'

const navLinks = [
  { href: '/menu',      label: 'MENU' },
  { href: '/shop',      label: 'SHOP' },
  { href: '/locations', label: 'LOCATIONS' },
  { href: '/our-story', label: 'OUR STORY' },
]

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-sky/40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 min-w-0">
            <div className="relative h-10 w-32 flex-shrink-0">
              <Image
                src="/images/logo.png"
                alt="BeachFit Fuel"
                fill
                className="object-contain object-left"
                priority
              />
            </div>
            <span className="font-display text-xl tracking-widest text-dark leading-none hidden xs:block">
              BEACHFIT FUEL
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-display text-lg tracking-widest text-dark hover:text-teal transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* ORDER CTA + mobile hamburger */}
          <div className="flex items-center gap-3">
            <Link href="/menu" className="hidden sm:block">
              <Button
                className="font-display tracking-widest text-base px-5 rounded-full text-white"
                style={{ backgroundColor: '#FF7B9D' }}
              >
                ORDER PICKUP
              </Button>
            </Link>
            <MobileMenu links={navLinks} />
          </div>

        </div>
      </div>
    </nav>
  )
}
