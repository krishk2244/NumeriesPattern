'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SectionLabel } from '@/components/ui/SectionLabel'

const EASE = [0.16, 1, 0.3, 1] as const

interface ComingSoonProps {
  /** Roman numeral shown above the headline (e.g. "II", "III") */
  numeral?: string
  /** Section name, e.g. "The Atelier" */
  section: string
  /** Headline shown large */
  headline: string
  /** Supporting line below the headline */
  description: string
  /** Optional bullet list of what's coming */
  preview?: string[]
}

export function ComingSoon({
  numeral,
  section,
  headline,
  description,
  preview,
}: ComingSoonProps) {
  return (
    <section
      className="w-full px-6 py-20 md:py-28 flex justify-center"
      style={{ backgroundColor: 'var(--noir-base)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE }}
        className="w-full max-w-2xl flex flex-col items-center gap-7 text-center"
      >
        <SectionLabel numeral={numeral}>{section}</SectionLabel>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(40px, 6vw, 64px)',
            fontWeight: 300,
            letterSpacing: '-0.015em',
            color: 'var(--cream)',
            lineHeight: 1.05,
            textWrap: 'balance',
          }}
        >
          {headline}
        </h1>

        {/* Gilt frame around the "Coming Soon" pill */}
        <div className="flex items-center gap-4">
          <span
            aria-hidden="true"
            style={{
              width: '40px',
              height: '1px',
              background:
                'linear-gradient(to right, transparent, var(--gilt-primary))',
            }}
          />
          <span
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: 'var(--gilt-primary)',
              padding: '8px 18px',
              border: '0.5px solid rgba(181, 150, 94, 0.45)',
              borderRadius: '9999px',
              backgroundColor: 'rgba(181, 150, 94, 0.06)',
            }}
          >
            Coming Soon
          </span>
          <span
            aria-hidden="true"
            style={{
              width: '40px',
              height: '1px',
              background:
                'linear-gradient(to left, transparent, var(--gilt-primary))',
            }}
          />
        </div>

        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '16px',
            lineHeight: 1.75,
            color: 'var(--champagne)',
            opacity: 0.85,
            maxWidth: '52ch',
          }}
        >
          {description}
        </p>

        {preview && preview.length > 0 && (
          <ul className="flex flex-col gap-2 mt-2">
            {preview.map((item, idx) => (
              <li
                key={idx}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '14px',
                  letterSpacing: '0.02em',
                  color: 'var(--champagne)',
                  opacity: 0.75,
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: '10px',
                  textAlign: 'left',
                }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    width: '5px',
                    height: '5px',
                    backgroundColor: 'var(--gilt-primary)',
                    transform: 'rotate(45deg)',
                    flexShrink: 0,
                    marginTop: '8px',
                  }}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}

        <Link
          href="/calculator"
          className="mt-4"
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '13px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--gold-primary)',
            padding: '14px 28px',
            border: '0.5px solid var(--gold-primary)',
            borderRadius: '9999px',
            transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          ← Try the Calculator
        </Link>
      </motion.div>
    </section>
  )
}
