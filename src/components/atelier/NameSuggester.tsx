'use client'

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SystemSelection } from '@/types/numerology'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { GoldButton } from '@/components/ui/GoldButton'

const EASE = [0.16, 1, 0.3, 1] as const

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

interface Suggestion {
  name: string
  origin: string
  meaning: string
  expected_value: number
  actual_value: number
  sum: number
  reduction_steps: number[]
  verified: boolean
  pythagorean?: { final: number; sum: number; reduction_steps: number[] }
  chaldean?: { final: number; sum: number; reduction_steps: number[] }
}

interface ApiResponse {
  suggestions: Suggestion[]
  notes: string | null
  meta: {
    requested_count: number
    pool_size: number
    matching_target: number
    after_keyword_filter: number
    returned_count: number
    pool_generated_at: string
    pool_model: string
  }
}

export function NameSuggester() {
  const [targetNumber, setTargetNumber] = useState<number>(7)
  const [system, setSystem] = useState<SystemSelection>('pythagorean')
  const [keywords, setKeywords] = useState<string>('')
  const [mustInclude, setMustInclude] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Suggestion[]>([])
  const [meta, setMeta] = useState<ApiResponse['meta'] | null>(null)
  const [notes, setNotes] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResults([])
    setMeta(null)
    setNotes(null)

    try {
      const res = await fetch('/api/suggest-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetNumber,
          system,
          keywords: keywords.trim() || undefined,
          mustInclude: mustInclude.trim() || undefined,
          count: 100,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`)
      }
      setResults(data.suggestions)
      setMeta(data.meta)
      setNotes(data.notes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="w-full pb-16 md:pb-24 pt-4 md:pt-6 flex justify-center px-0 md:px-6"
      style={{ backgroundColor: 'var(--noir-base)' }}
    >
      <div
        className="relative w-full p-6 md:p-14 md:rounded-lg"
        style={{
          maxWidth: '960px',
          backgroundColor: 'var(--noir-card)',
          border: '0.5px solid var(--noir-border)',
          boxShadow:
            '0 1px 0 rgba(0, 99, 65, 0.04) inset, 0 12px 28px rgba(15, 20, 16, 0.06), 0 32px 64px rgba(15, 20, 16, 0.08)',
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-8 md:gap-10"
        >
          <NumberPicker value={targetNumber} onChange={setTargetNumber} />

          <SystemPicker value={system} onChange={setSystem} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            <Field label="Must Include (optional)">
              <input
                type="text"
                value={mustInclude}
                onChange={(e) => setMustInclude(e.target.value)}
                placeholder="e.g. Aar — every result will contain this"
                style={inputStyle}
              />
            </Field>
            <Field label="Keywords (optional)">
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. feminine, classical, spiritual"
                style={inputStyle}
              />
            </Field>
          </div>

          <div className="flex flex-col items-center gap-3">
            <GoldButton
              type="submit"
              size="lg"
              disabled={loading}
              style={{ minWidth: '220px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Consulting…' : 'Suggest Names'}
            </GoldButton>
            {meta && meta.returned_count > 0 && (
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '11px',
                  letterSpacing: '0.06em',
                  color: 'var(--champagne)',
                  opacity: 0.65,
                  textAlign: 'center',
                  maxWidth: '52ch',
                  lineHeight: 1.5,
                }}
              >
                {meta.returned_count} name
                {meta.returned_count === 1 ? '' : 's'} · vibration {targetNumber}
                {meta.returned_count < meta.requested_count
                  ? ' · broaden keywords or remove “Must Include” for more'
                  : ''}
              </p>
            )}
            {meta && meta.returned_count === 0 && (
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '13px',
                  fontStyle: 'italic',
                  color: 'var(--champagne)',
                  opacity: 0.75,
                  textAlign: 'center',
                  maxWidth: '52ch',
                  lineHeight: 1.65,
                }}
              >
                {notes ??
                  `No names matched all your filters. Try a different target number, broader keywords, or remove “Must Include”.`}
              </p>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '13px',
                  color: '#7A2A1F',
                  backgroundColor: 'rgba(122, 42, 31, 0.05)',
                  border: '0.5px solid rgba(122, 42, 31, 0.2)',
                  borderRadius: 'var(--radius-md)',
                  padding: '14px 18px',
                  textAlign: 'center',
                }}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {results.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="flex flex-col gap-6"
              >
                {notes && (
                  <p
                    style={{
                      fontFamily: 'var(--font-ui)',
                      fontSize: '13px',
                      fontStyle: 'italic',
                      color: 'var(--champagne)',
                      opacity: 0.7,
                      textAlign: 'center',
                      lineHeight: 1.6,
                    }}
                  >
                    {notes}
                  </p>
                )}
                <div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5"
                >
                  {results.map((s, i) => (
                    <SuggestionCard
                      key={s.name + i}
                      suggestion={s}
                      selection={system}
                      delay={i * 0.06}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </section>
  )
}

/* ──────────────────────  PIECES  ────────────────────── */

function NumberPicker({
  value,
  onChange,
}: {
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <SectionLabel>Target Vibration</SectionLabel>
      <div className="grid grid-cols-9 gap-2 w-full max-w-md">
        {NUMBERS.map((n) => {
          const active = n === value
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              aria-pressed={active}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '17px',
                fontWeight: 500,
                aspectRatio: '1 / 1',
                borderRadius: '9999px',
                border: active
                  ? '1px solid var(--gold-primary)'
                  : '0.5px solid var(--noir-border)',
                color: active ? 'var(--gold-primary)' : 'var(--champagne)',
                backgroundColor: active
                  ? 'rgba(0, 99, 65, 0.06)'
                  : 'transparent',
                boxShadow: active
                  ? '0 0 18px rgba(0, 99, 65, 0.15)'
                  : 'none',
                transition: `all 240ms cubic-bezier(0.16, 1, 0.3, 1)`,
                cursor: 'pointer',
              }}
            >
              {n}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SystemPicker({
  value,
  onChange,
}: {
  value: SystemSelection
  onChange: (s: SystemSelection) => void
}) {
  const options: { id: SystemSelection; label: string }[] = [
    { id: 'pythagorean', label: 'Pythagorean' },
    { id: 'chaldean', label: 'Chaldean' },
    { id: 'both', label: 'Both' },
  ]
  return (
    <div className="flex flex-col items-center gap-3">
      <SectionLabel>System</SectionLabel>
      <div
        className="inline-flex p-1 rounded-full"
        style={{
          backgroundColor: 'var(--noir-elevated)',
          border: '0.5px solid var(--noir-border)',
        }}
      >
        {options.map((o) => {
          const active = value === o.id
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              aria-pressed={active}
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.06em',
                padding: '8px 22px',
                borderRadius: '9999px',
                border: 'none',
                cursor: 'pointer',
                color: active ? 'var(--noir-base)' : 'var(--champagne)',
                backgroundColor: active
                  ? 'var(--gold-primary)'
                  : 'transparent',
                boxShadow: active
                  ? 'inset 0 1px 0 rgba(245, 240, 232, 0.22)'
                  : 'none',
                transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function pillStyle(label: 'P' | 'C'): React.CSSProperties {
  void label // both pills use the same visual; label arg kept for future variants
  return {
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--gold-primary)',
    backgroundColor: 'rgba(0, 99, 65, 0.08)',
    border: '0.5px solid rgba(0, 99, 65, 0.25)',
    borderRadius: '9999px',
    padding: '3px 9px',
    letterSpacing: '0.04em',
    lineHeight: 1,
  }
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '15px',
  fontWeight: 400,
  letterSpacing: '0.02em',
  width: '100%',
  padding: '14px 18px',
  backgroundColor: 'var(--ivory)',
  color: 'var(--cream)',
  border: '1px solid rgba(181, 150, 94, 0.4)',
  borderRadius: 'var(--radius-md)',
  outline: 'none',
  transition: 'border-color 240ms cubic-bezier(0.16, 1, 0.3, 1)',
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="flex flex-col gap-2">
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
        {label}
      </span>
      {children}
    </label>
  )
}

function SuggestionCard({
  suggestion,
  selection,
  delay,
}: {
  suggestion: Suggestion
  selection: SystemSelection
  delay: number
}) {
  const showBoth = selection === 'both' && suggestion.pythagorean && suggestion.chaldean
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay }}
      style={{
        backgroundColor: 'var(--ivory)',
        border: '0.5px solid rgba(181, 150, 94, 0.35)',
        borderRadius: 'var(--radius-md)',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(22px, 3vw, 28px)',
            fontWeight: 400,
            letterSpacing: '-0.005em',
            color: 'var(--cream)',
            lineHeight: 1.1,
          }}
        >
          {suggestion.name}
        </h3>
        {showBoth ? (
          <div className="flex items-baseline gap-3">
            <span style={pillStyle('P')}>
              P {suggestion.pythagorean!.final}
            </span>
            <span style={pillStyle('C')}>
              C {suggestion.chaldean!.final}
            </span>
          </div>
        ) : (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '20px',
              fontWeight: 500,
              color: 'var(--gold-primary)',
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {suggestion.actual_value}
          </span>
        )}
      </div>

      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          letterSpacing: '0.05em',
          color: 'var(--gilt-primary)',
          opacity: 0.85,
        }}
      >
        {showBoth ? (
          <>
            P: sum {suggestion.pythagorean!.sum} ({suggestion.pythagorean!.reduction_steps.join(' › ')}) · C: sum {suggestion.chaldean!.sum} ({suggestion.chaldean!.reduction_steps.join(' › ')})
          </>
        ) : (
          <>sum {suggestion.sum} · {suggestion.reduction_steps.join(' › ')}</>
        )}
      </div>

      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          lineHeight: 1.6,
          color: 'var(--champagne)',
          opacity: 0.85,
        }}
      >
        <span style={{ fontStyle: 'italic' }}>{suggestion.origin}</span>
      </p>
      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          lineHeight: 1.6,
          color: 'var(--champagne)',
          opacity: 0.7,
        }}
      >
        {suggestion.meaning}
      </p>
    </motion.div>
  )
}
