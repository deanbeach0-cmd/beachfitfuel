import type { Metadata } from 'next'
import './globals.css'

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
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'BeachFit Fuel',
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
