import type { Metadata, Viewport } from 'next'
import {
  Cormorant_Garamond,
  Montserrat,
  JetBrains_Mono,
} from 'next/font/google'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#F4F1E9',
}

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-ui',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'NUMERIS — Luxury Name Numerology',
  description:
    'Discover the sacred numbers behind your name. Pythagorean and Chaldean numerology calculators crafted with precision.',
  keywords: [
    'numerology',
    'name calculator',
    'pythagorean',
    'chaldean',
    'sacred numbers',
  ],
  openGraph: {
    title: 'NUMERIS',
    description: 'What does your name reveal?',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${montserrat.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
