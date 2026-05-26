'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalculatorCard } from '@/components/calculator/CalculatorCard'
import { SystemToggle } from '@/components/calculator/SystemToggle'
import { SystemExplainer } from '@/components/calculator/SystemExplainer'
import { NameInput } from '@/components/calculator/NameInput'
import { MobileInput } from '@/components/calculator/MobileInput'
import { LetterBreakdown } from '@/components/calculator/LetterBreakdown'
import { ReductionSteps } from '@/components/calculator/ReductionSteps'
import { FinalNumber } from '@/components/calculator/FinalNumber'
import { ReferenceChart } from '@/components/calculator/ReferenceChart'
import { NumberMeaning } from '@/components/meaning/NumberMeaning'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { calculateName, calculateMobile } from '@/lib/numerology'
import { NUMBER_MEANINGS } from '@/lib/meanings'
import {
  NumerologySystem,
  SystemSelection,
  CalculationResult,
} from '@/types/numerology'

const EASE = [0.16, 1, 0.3, 1] as const

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
}

type Mode = 'name' | 'mobile'

export function CalculatorSection() {
  const [mode, setMode] = useState<Mode>('name')
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [system, setSystem] = useState<SystemSelection>('pythagorean')

  // For mobile mode, system doesn't matter (digits are universal). We compute
  // a single result. For name mode we may compute both when system === 'both'.
  const results = useMemo<
    Array<{ system: NumerologySystem | 'mobile'; calc: CalculationResult }>
  >(() => {
    if (mode === 'mobile') {
      const digits = mobile.replace(/\D/g, '')
      if (!digits) return []
      return [{ system: 'mobile', calc: calculateMobile(mobile) }]
    }
    if (!name.trim()) return []
    if (system === 'both') {
      return [
        { system: 'pythagorean', calc: calculateName(name, 'pythagorean') },
        { system: 'chaldean', calc: calculateName(name, 'chaldean') },
      ]
    }
    return [{ system, calc: calculateName(name, system) }]
  }, [mode, name, mobile, system])

  const showBoth = mode === 'name' && system === 'both' && results.length === 2

  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-120px' }}
      variants={fadeUp}
    >
      <CalculatorCard>
        <div className="flex flex-col gap-10 md:gap-12">
          <div className="flex justify-center">
            <SectionLabel numeral="I">The Calculation</SectionLabel>
          </div>

          <ModeToggle value={mode} onChange={setMode} />

          {mode === 'name' && (
            <div className="flex flex-col gap-6 md:gap-8">
              <SystemToggle value={system} onChange={setSystem} />
              {system === 'both' ? (
                <div className="flex flex-col gap-8">
                  <SystemExplainer system="pythagorean" />
                  <SystemExplainer system="chaldean" />
                </div>
              ) : (
                <SystemExplainer system={system} />
              )}
            </div>
          )}

          <div className="flex flex-col items-stretch gap-4 md:gap-5">
            <div className="flex justify-center">
              <SectionLabel numeral="II">
                {mode === 'name' ? 'Your Name' : 'Your Mobile Number'}
              </SectionLabel>
            </div>

            {mode === 'name' ? (
              <NameInput
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Type your full name…"
              />
            ) : (
              <MobileInput
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="+1 555 0123"
              />
            )}

            <p
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '12px',
                fontStyle: 'italic',
                letterSpacing: '0.04em',
                color: 'var(--champagne)',
                opacity: 0.6,
                textAlign: 'center',
              }}
            >
              {mode === 'name'
                ? 'Spaces are kept · Only letters carry numeric value'
                : 'All digits are summed and reduced · Country code, spaces, and dashes are ignored'}
            </p>
          </div>

          {results.length > 0 && (
            <div
              className={
                showBoth
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-8 md:divide-x md:divide-[var(--noir-border)]'
                  : 'flex flex-col gap-10 md:gap-12'
              }
            >
              {results.map((r, idx) => {
                const meaning = NUMBER_MEANINGS[r.calc.finalNumber]
                const systemLabel =
                  r.system === 'pythagorean'
                    ? 'Pythagorean'
                    : r.system === 'chaldean'
                      ? 'Chaldean'
                      : null
                return (
                  <div
                    key={`${r.system}-${idx}`}
                    className={`flex flex-col gap-8 md:gap-10 items-center ${
                      showBoth && idx === 1 ? 'md:pl-6 lg:pl-8' : ''
                    }`}
                  >
                    {showBoth && systemLabel && (
                      <SectionLabel
                        numeral={idx === 0 ? 'I' : 'II'}
                      >
                        {systemLabel}
                      </SectionLabel>
                    )}
                    <div className="flex flex-col gap-4 md:gap-6 items-center w-full">
                      <SectionLabel>
                        {mode === 'name' ? 'Letter Values' : 'Digit Values'}
                      </SectionLabel>
                      <LetterBreakdown letters={r.calc.letters} />
                    </div>

                    <div className="flex flex-col gap-4 md:gap-6 items-center w-full">
                      <SectionLabel>Reduction Path</SectionLabel>
                      <ReductionSteps steps={r.calc.reductionSteps} />
                    </div>

                    <FinalNumber number={r.calc.finalNumber} />

                    {meaning && <NumberMeaning meaning={meaning} />}
                  </div>
                )
              })}
            </div>
          )}

          {mode === 'name' && (
            <div
              className="pt-2"
              style={{ borderTop: '0.5px solid var(--noir-border)' }}
            >
              <ReferenceChart
                system={system === 'both' ? 'pythagorean' : system}
              />
            </div>
          )}
        </div>
      </CalculatorCard>
    </motion.div>
  )
}

/* ──────────────────────  MODE TOGGLE  ────────────────────── */

const MODES: { id: Mode; label: string }[] = [
  { id: 'name', label: 'Name' },
  { id: 'mobile', label: 'Mobile Number' },
]

function ModeToggle({
  value,
  onChange,
}: {
  value: Mode
  onChange: (m: Mode) => void
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <SectionLabel>Reduce a</SectionLabel>
      <div
        className="relative inline-flex p-1 rounded-full"
        style={{
          backgroundColor: 'var(--noir-elevated)',
          border: '0.5px solid var(--noir-border)',
        }}
      >
        {MODES.map((m) => {
          const active = value === m.id
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => onChange(m.id)}
              aria-pressed={active}
              className="relative"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.06em',
                padding: '9px 26px',
                borderRadius: '9999px',
                color: active ? 'var(--noir-base)' : 'var(--champagne)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                zIndex: 1,
                transition: 'color 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {active && (
                <motion.span
                  layoutId="mode-toggle-active"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '9999px',
                    backgroundColor: 'var(--gold-primary)',
                    boxShadow:
                      'inset 0 1px 0 rgba(245, 240, 232, 0.22), 0 4px 14px rgba(0, 99, 65, 0.25)',
                    zIndex: -1,
                  }}
                />
              )}
              <span style={{ position: 'relative' }}>{m.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
