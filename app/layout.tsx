import type { Metadata } from 'next'
import './globals.css'
import { Navbar } from '@/components/nav/Navbar'
import { Footer } from '@/components/shared/Footer'

export const metadata: Metadata = {
  title: {
    default: 'BeachFit Fuel',
    template: '%s | BeachFit Fuel',
  },
  description: 'Low-cal, high-protein smoothies and energy drinks. Two locations in Michigan — Marshall & Battle Creek. Ship to-go packs nationwide.',
  keywords: ['smoothies', 'protein shakes', 'energy drinks', 'Michigan', 'Marshall', 'Battle Creek', 'beach bombs'],
  openGraph: {
    title: 'BeachFit Fuel',
    description: 'Fuel your day the fun way.',
    url: 'https://www.beachfitfuel.com',
    siteName: 'BeachFit Fuel',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: 'https://www.beachfitfuel.com/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BeachFit Fuel — Low-cal, high-protein drinks that taste like a vacation.',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BeachFit Fuel',
    description: 'Fuel your day the fun way.',
    images: ['https://www.beachfitfuel.com/images/og-image.png'],
  },
  metadataBase: new URL('https://www.beachfitfuel.com'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
