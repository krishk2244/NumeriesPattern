import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { NameSuggester } from '@/components/atelier/NameSuggester'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { ComingSoon } from '@/components/ui/ComingSoon'
import { isSuggestEnabled } from '@/lib/features'

export const metadata: Metadata = {
  title: 'Name Atelier — NUMERIS',
  description:
    'AI-assisted name suggestions whose letters reduce to a chosen numerological number.',
}

export default function SuggestPage() {
  if (!isSuggestEnabled()) {
    return (
      <main
        className="flex flex-col min-h-screen"
        style={{ backgroundColor: 'var(--noir-base)' }}
      >
        <Navbar />
        <ComingSoon
          numeral="III"
          section="Name Atelier"
          headline="In the studio."
          description="The Atelier is still being tuned. We're cross-checking 461 names across six cultural traditions, sharpening the AI top-up, and polishing the dual-system comparison."
          preview={[
            'Cross-cultural name suggestions verified to your target number',
            'Pythagorean, Chaldean, or both systems simultaneously',
            '“Must include” substring matching for family or theme constraints',
            'Live within the next launch wave',
          ]}
        />
        <Footer />
      </main>
    )
  }

  return (
    <main
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: 'var(--noir-base)' }}
    >
      <Navbar />

      <section
        className="w-full px-6 pt-28 pb-6 md:pt-36 md:pb-10 flex justify-center"
        style={{ backgroundColor: 'var(--noir-base)' }}
      >
        <div className="w-full max-w-3xl flex flex-col gap-5 text-center items-center">
          <SectionLabel numeral="III">Name Atelier</SectionLabel>
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
            Names that match your number.
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
            Choose a target vibration, add any keywords, and the agent
            composes names whose letters reduce to your number — every
            calculation verified server-side before it reaches you.
          </p>
        </div>
      </section>

      <NameSuggester />

      <section className="w-full px-6 py-12 md:py-16 flex justify-center">
        <Link
          href="/calculator"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--gold-primary)',
          }}
        >
          ← Back to the calculator
        </Link>
      </section>

      <Footer />
    </main>
  )
}
