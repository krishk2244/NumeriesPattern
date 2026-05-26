import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CalculatorSection } from '@/components/calculator/CalculatorSection'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = {
  title: 'Calculator — NUMERIS',
  description:
    'Reduce any name to its numerological digit using Pythagorean or Chaldean methods.',
}

export default function CalculatorPage() {
  return (
    <main
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: 'var(--noir-base)' }}
    >
      <Navbar />

      <section
        className="w-full px-6 pt-28 pb-10 md:pt-36 md:pb-14 flex justify-center"
        style={{ backgroundColor: 'var(--noir-base)' }}
      >
        <div className="w-full max-w-3xl flex flex-col gap-5 text-center items-center">
          <SectionLabel numeral="I">The Calculation</SectionLabel>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(38px, 5.5vw, 60px)',
              fontWeight: 300,
              letterSpacing: '-0.01em',
              color: 'var(--cream)',
              lineHeight: 1.05,
            }}
          >
            Reduce a name to its number.
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'var(--champagne)',
              opacity: 0.8,
              maxWidth: '52ch',
            }}
          >
            Type a full name. Pick a system. Watch each letter resolve into a
            single digit — Pythagorean by position, Chaldean by vibration.
          </p>
        </div>
      </section>

      <CalculatorSection />

      <section className="w-full px-6 py-12 md:py-16 flex justify-center">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <Link
            href="/suggest"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--gold-primary)',
            }}
          >
            → Suggest names that match a number
          </Link>
          <span
            aria-hidden="true"
            style={{
              width: '1px',
              height: '14px',
              backgroundColor: 'var(--noir-border)',
              display: 'inline-block',
            }}
            className="hidden md:inline-block"
          />
          <Link
            href="/about"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--champagne)',
              opacity: 0.75,
            }}
          >
            About the systems
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
