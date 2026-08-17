import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MobileMenu } from './MobileMenu'
import { CartIcon } from '@/components/shop/CartIcon'
import { PickupCartIcon } from '@/components/order/PickupCartIcon'

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

          {/* Logo — a small wordmark reads clearer at nav scale than the full mark image */}
          <Link href="/" className="flex-shrink-0 flex items-center min-w-0">
            <span className="font-display text-2xl sm:text-3xl tracking-widest text-dark leading-none">
              BEACHFIT <span style={{ color: '#FF7B9D' }}>FUEL</span>
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

          {/* ORDER CTA + carts + mobile hamburger */}
          <div className="flex items-center gap-1">
            <PickupCartIcon />
            <CartIcon />
            <Link href="/menu" className="hidden sm:block ml-2">
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
