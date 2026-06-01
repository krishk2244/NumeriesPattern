import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { HeroSection } from '@/components/hero/HeroSection'
import { GoldDivider } from '@/components/ui/GoldDivider'
import { SacredWheel } from '@/components/ancient/SacredWheel'
import { SectionLabel } from '@/components/ui/SectionLabel'

export default function Home() {
  return (
    <main
      className="flex flex-col min-h-screen"
      style={{ backgroundColor: 'var(--noir-base)' }}
    >
      <Navbar />
      <HeroSection />

      <section
        id="explore"
        className="w-full px-6 py-20 md:py-28 flex justify-center"
        style={{ backgroundColor: 'var(--noir-base)' }}
      >
        <div className="w-full max-w-5xl flex flex-col gap-10 md:gap-14">
          <div className="flex flex-col items-center gap-4 text-center">
            <SectionLabel>Three Ways In</SectionLabel>
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(30px, 4.5vw, 44px)',
                fontWeight: 300,
                letterSpacing: '-0.01em',
                color: 'var(--cream)',
                lineHeight: 1.1,
                maxWidth: '20ch',
              }}
            >
              Reduce a name, find one that fits, or forge one for your company.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            <ToolCard
              numeral="I"
              eyebrow="Calculator"
              title="Reveal a name's number."
              copy="Type any name. Choose Pythagorean or Chaldean. See each letter resolve into a single digit, with the meaning behind it."
              cta="Open the calculator"
              href="/calculator"
            />
            <ToolCard
              numeral="II"
              eyebrow="Name Atelier"
              title="Find a name that matches your number."
              copy="Pick a target vibration, country, and any keywords. The agent verifies every calculation before suggesting personal names."
              cta="Open the atelier"
              href="/suggest"
            />
            <ToolCard
              numeral="III"
              eyebrow="The Foundry"
              title="Name the company you are forming."
              copy="Describe your structure, industry, and tone. The agent drafts company names whose letters reduce to your target."
              cta="Open the foundry"
              href="/foundry"
            />
          </div>
        </div>
      </section>

      <GoldDivider />
      <SacredWheel />
      <Footer />
    </main>
  )
}

function ToolCard({
  numeral,
  eyebrow,
  title,
  copy,
  cta,
  href,
}: {
  numeral: string
  eyebrow: string
  title: string
  copy: string
  cta: string
  href: string
}) {
  return (
    <Link
      href={href}
      className="group block"
      style={{
        backgroundColor: 'var(--noir-card)',
        border: '0.5px solid var(--noir-border)',
        borderRadius: 'var(--radius-md)',
        padding: '32px 28px',
        boxShadow:
          '0 1px 0 rgba(0, 99, 65, 0.04) inset, 0 12px 28px rgba(15, 20, 16, 0.06)',
        transition: 'all 280ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div className="flex flex-col gap-5 h-full">
        <div className="flex items-center gap-3">
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '0.12em',
              color: 'var(--gilt-primary)',
              opacity: 0.85,
            }}
          >
            {numeral}
          </span>
          <span
            aria-hidden="true"
            style={{
              flex: 1,
              height: '0.5px',
              backgroundColor: 'var(--noir-border)',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--gold-primary)',
            }}
          >
            {eyebrow}
          </span>
        </div>

        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(24px, 3vw, 30px)',
            fontWeight: 300,
            letterSpacing: '-0.005em',
            color: 'var(--cream)',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h3>

        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '14px',
            lineHeight: 1.7,
            color: 'var(--champagne)',
            opacity: 0.78,
          }}
        >
          {copy}
        </p>

        <span
          style={{
            marginTop: 'auto',
            fontFamily: 'var(--font-ui)',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--gold-primary)',
          }}
        >
          {cta} →
        </span>
      </div>
    </Link>
  )
}
