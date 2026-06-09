'use client'

import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

interface NavLink {
  href: string
  label: string
}

interface MobileMenuProps {
  links: NavLink[]
}

export function MobileMenu({ links }: MobileMenuProps) {
  return (
    <Sheet>
      <SheetTrigger
        className="md:hidden p-2 text-dark hover:text-teal transition-colors bg-transparent border-0 cursor-pointer"
        aria-label="Open navigation menu"
      >
        <Menu size={24} />
      </SheetTrigger>

      <SheetContent side="right" className="w-72 bg-white flex flex-col pt-8 gap-0">

        {/* Brand header */}
        <div className="px-6 mb-8">
          <p className="font-display text-3xl tracking-widest text-dark">BEACHFIT FUEL</p>
          <p className="font-body text-sm mt-1" style={{ color: '#6FBDB8' }}>
            Fuel your day the fun way
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex flex-col gap-1 flex-1 px-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-display text-2xl tracking-widest text-dark hover:text-teal hover:bg-cream px-4 py-3 rounded-lg transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ORDER PICKUP CTA */}
        <div className="p-4 mt-auto border-t border-sky/30">
          <Link href="/menu">
            <Button
              className="w-full font-display tracking-widest text-lg rounded-full text-white py-6"
              style={{ backgroundColor: '#FF7B9D' }}
            >
              ORDER PICKUP
            </Button>
          </Link>
        </div>

      </SheetContent>
    </Sheet>
  )
}
