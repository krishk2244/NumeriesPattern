import Link from 'next/link'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { SectionLabel } from '@/components/ui/SectionLabel'

export const metadata: Metadata = {
  title: 'About — NUMERIS',
  description:
    'Two ancient systems for revealing the numbers behind a name — Pythagorean and Chaldean.',
}

export default function AboutPage() {
  return (
    <main
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: 'var(--noir-base)' }}
    >
      <Navbar />

      <section
        className="w-full px-6 pt-28 pb-16 md:pt-44 md:pb-28 flex justify-center"
        style={{ backgroundColor: 'var(--noir-base)' }}
      >
        <div className="w-full max-w-3xl flex flex-col gap-8 md:gap-12">
          <div className="flex flex-col gap-4">
            <SectionLabel numeral="II">About Numerology</SectionLabel>
            <h1
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(40px, 6vw, 64px)',
                fontWeight: 300,
                letterSpacing: '-0.01em',
                color: 'var(--cream)',
                lineHeight: 1.05,
              }}
            >
              Two systems. One question.
            </h1>
            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '17px',
                lineHeight: 1.7,
                color: 'var(--champagne)',
                opacity: 0.8,
                maxWidth: '620px',
              }}
            >
              Numerology assigns a number to each letter of a name, then reduces
              the sum to a single digit. NUMERIS supports the two traditions
              still in use today — chosen, not blended.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <SystemCard
              numeral="I"
              title="Pythagorean"
              copy="The most widely used modern system. Letters map to 1–9 by their position in the alphabet, looping every nine. Greek-root, Western-shaped, and the default for most contemporary readings."
            />
            <SystemCard
              numeral="II"
              title="Chaldean"
              copy="Older, rarer, harder to compute by hand. Letters map to 1–8 by their perceived vibration rather than their position — and 9 is reserved as sacred, never assigned. Babylonian in origin."
            />
          </div>

          <Link
            href="/"
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '13px',
              fontWeight: 500,
              letterSpacing: '0.04em',
              color: 'var(--gold-primary)',
              alignSelf: 'flex-start',
            }}
          >
            ← Back to the calculator
          </Link>
        </div>
      </section>

      <GoldDivider />
      <Footer />
    </main>
  )
}

function SystemCard({
  numeral,
  title,
  copy,
}: {
  numeral: string
  title: string
  copy: string
}) {
  return (
    <div
      className="p-6 md:p-8 flex flex-col gap-4"
      style={{
        backgroundColor: 'var(--noir-card)',
        border: '0.5px solid var(--noir-border)',
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-gold)',
      }}
    >
      <SectionLabel numeral={numeral}>{title}</SectionLabel>
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '28px',
          fontWeight: 400,
          color: 'var(--cream)',
          lineHeight: 1.1,
        }}
      >
        {title}
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '15px',
          lineHeight: 1.7,
          color: 'var(--champagne)',
          opacity: 0.75,
        }}
      >
        {copy}
      </p>
    </div>
  )
}
