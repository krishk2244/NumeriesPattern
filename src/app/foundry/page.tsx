import type { Metadata } from 'next'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { CompanySuggester } from '@/components/foundry/CompanySuggester'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { ComingSoon } from '@/components/ui/ComingSoon'
import { isFoundryEnabled } from '@/lib/features'

export const metadata: Metadata = {
  title: 'Foundry — NUMERIS',
  description:
    'Describe the company you are forming. Receive numerologically-aligned name candidates tuned to its structure, industry, and country.',
}

export default function FoundryPage() {
  if (!isFoundryEnabled()) {
    return (
      <main
        className="flex flex-col min-h-screen"
        style={{ backgroundColor: 'var(--noir-base)' }}
      >
        <Navbar />
        <ComingSoon
          numeral="IV"
          section="The Foundry"
          headline="In the forge."
          description="The Foundry is heating up. We're tuning the AI brand-naming agent against the offline-pool fallback, expanding the company-name database past 84 entries, and refining the legal-suffix stripping."
          preview={[
            'AI-drafted brand names tuned to your industry and structure',
            'Pool of invented company names verified to your numerology target',
            '“Must include” substring for founder-name or theme constraints',
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
          <SectionLabel numeral="IV">The Foundry</SectionLabel>
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
            Name the company you are forming.
          </h1>
          <p
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '16px',
              lineHeight: 1.7,
              color: 'var(--champagne)',
              opacity: 0.8,
              maxWidth: '56ch',
            }}
          >
            Describe the structure, industry, and tone of your venture. The
            agent drafts candidate names; the server verifies every numerology
            calculation and discards mismatches.
          </p>
        </div>
      </section>

      <CompanySuggester />

      <section className="w-full px-6 py-12 md:py-16 flex justify-center">
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
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
            ← Verify any name in the calculator
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
            href="/suggest"
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
            Personal name atelier
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
