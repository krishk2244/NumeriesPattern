'use client'

import { useState, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SystemSelection } from '@/types/numerology'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { GoldButton } from '@/components/ui/GoldButton'

const EASE = [0.16, 1, 0.3, 1] as const

const STRUCTURES = [
  'Sole Proprietor',
  'Partnership',
  'LLP',
  'LLC',
  'Pvt Ltd',
  'Inc.',
  'Public Limited',
  'Cooperative',
  'Trust',
  'Family Office',
] as const

const NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

const NUMBER_HINT: Record<number, string> = {
  1: 'leadership · originator',
  2: 'partnership · diplomacy',
  3: 'creativity · expression',
  4: 'discipline · structure',
  5: 'commerce · velocity',
  6: 'service · care',
  7: 'research · craft',
  8: 'wealth · expansion',
  9: 'legacy · humanitarian',
}

const ARCHETYPE_LABEL: Record<string, string> = {
  coined: 'Coined',
  classical: 'Classical',
  founder: 'Founder',
  descriptive: 'Descriptive',
  place: 'Place',
  compound: 'Compound',
  abstract: 'Abstract',
}

interface Suggestion {
  name: string
  archetype: keyof typeof ARCHETYPE_LABEL
  rationale: string
  pronunciation_hint: string
  expected_value: number
  actual_value: number
  sum: number
  reduction_steps: number[]
  verified: boolean
}

interface ApiResponse {
  suggestions: Suggestion[]
  notes: string | null
  meta: {
    requested_count: number
    generated_count: number
    verified_count: number
    target_number: number
    system: string
    structure: string
    dual_system_count?: number
    relaxed_system?: 'pythagorean' | 'chaldean' | null
    model: string
  }
}

export function CompanySuggester() {
  const [structure, setStructure] = useState<string>('Pvt Ltd')
  const [industry, setIndustry] = useState<string>('')
  const [mustInclude, setMustInclude] = useState<string>('')
  const [keywords, setKeywords] = useState<string>('')
  const [targetNumber, setTargetNumber] = useState<number>(8)
  const [system, setSystem] = useState<SystemSelection>('pythagorean')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<Suggestion[]>([])
  const [meta, setMeta] = useState<ApiResponse['meta'] | null>(null)
  const [notes, setNotes] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!industry.trim()) {
      setError('Please describe the nature of your business.')
      return
    }
    setLoading(true)
    setError(null)
    setResults([])
    setMeta(null)
    setNotes(null)

    try {
      const res = await fetch('/api/suggest-companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetNumber,
          system,
          structure,
          industry: industry.trim(),
          mustInclude: mustInclude.trim() || undefined,
          keywords: keywords.trim() || undefined,
          count: 40,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        const head = data.error || `Request failed (${res.status})`
        const detail = data.detail ? ` — ${data.detail}` : ''
        throw new Error(head + detail)
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-8 md:gap-10">
          {/* Structure block */}
          <div className="flex flex-col gap-5">
            <SectionLabel>Your Company Structure</SectionLabel>

            <Field label="Legal Structure">
              <select
                value={structure}
                onChange={(e) => setStructure(e.target.value)}
                style={inputStyle}
              >
                {STRUCTURES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Nature of the Business">
              <textarea
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. boutique digital consultancy advising mid-market retail brands on data platforms"
                rows={3}
                style={{ ...inputStyle, resize: 'vertical', minHeight: 84 }}
              />
            </Field>

            <Field label="Vibe Keywords (optional)">
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="e.g. minimal, trustworthy, mythic"
                style={inputStyle}
              />
            </Field>

            <Field label="Must Include (optional)">
              <input
                type="text"
                value={mustInclude}
                onChange={(e) => setMustInclude(e.target.value)}
                placeholder="e.g. Helix — every suggested name will contain this fragment"
                style={inputStyle}
              />
            </Field>
          </div>

          <Divider />

          {/* Numerology block */}
          <div className="flex flex-col gap-5">
            <SectionLabel>Numerology Target</SectionLabel>
            <NumberPicker
              value={targetNumber}
              onChange={setTargetNumber}
              hint={NUMBER_HINT[targetNumber]}
            />
            <SystemPicker value={system} onChange={setSystem} />
          </div>

          {/* CTA + meta */}
          <div className="flex flex-col items-center gap-3">
            <GoldButton
              type="submit"
              size="lg"
              disabled={loading}
              style={{ minWidth: '240px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Drafting…' : 'Suggest Company Names'}
            </GoldButton>
            {meta && meta.verified_count > 0 && (
              <p
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '11px',
                  letterSpacing: '0.06em',
                  color: 'var(--champagne)',
                  opacity: 0.65,
                  textAlign: 'center',
                  maxWidth: '56ch',
                  lineHeight: 1.5,
                }}
              >
                {meta.verified_count} name{meta.verified_count === 1 ? '' : 's'}{' '}
                · vibration {meta.target_number} · for a {meta.structure}
              </p>
            )}
            {meta && meta.verified_count === 0 && (
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
                  `No company names reduced to ${meta.target_number}. Try a different target number, broader keywords, or remove “Must Include”.`}
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
                <ResultsBody
                  results={results}
                  dualCount={meta?.dual_system_count ?? results.length}
                  relaxedSystem={meta?.relaxed_system ?? null}
                  notes={notes}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </section>
  )
}

/* ──────────────────────  PIECES  ────────────────────── */

function Divider() {
  return (
    <span
      aria-hidden="true"
      style={{
        height: '0.5px',
        width: '100%',
        backgroundColor: 'var(--noir-border)',
      }}
    />
  )
}

function NumberPicker({
  value,
  onChange,
  hint,
}: {
  value: number
  onChange: (n: number) => void
  hint: string
}) {
  return (
    <div className="flex flex-col items-center gap-3">
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
                transition: 'all 240ms cubic-bezier(0.16, 1, 0.3, 1)',
                cursor: 'pointer',
              }}
            >
              {n}
            </button>
          )
        })}
      </div>
      <span
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          fontStyle: 'italic',
          letterSpacing: '0.06em',
          color: 'var(--champagne)',
          opacity: 0.7,
        }}
      >
        {hint}
      </span>
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
    <div className="flex justify-center">
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

function CompanyCard({
  suggestion,
  delay,
}: {
  suggestion: Suggestion
  delay: number
}) {
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
        sum {suggestion.sum} · {suggestion.reduction_steps.join(' › ')} ·{' '}
        {ARCHETYPE_LABEL[suggestion.archetype] ?? suggestion.archetype}
      </div>

      {suggestion.pronunciation_hint && (
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '12px',
            fontStyle: 'italic',
            color: 'var(--champagne)',
            opacity: 0.75,
          }}
        >
          /{suggestion.pronunciation_hint}/
        </p>
      )}

      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          lineHeight: 1.6,
          color: 'var(--champagne)',
          opacity: 0.85,
        }}
      >
        {suggestion.rationale}
      </p>
    </motion.div>
  )
}

/**
 * Renders the results grid. When a single-system top-up filled the request,
 * splits results into two labeled groups (dual-system first, relaxed second)
 * with a small ornament between them — so users see at a glance which names
 * are strict matches vs the top-up.
 */
function ResultsBody({
  results,
  dualCount,
  relaxedSystem,
  notes,
}: {
  results: Suggestion[]
  dualCount: number
  relaxedSystem: 'pythagorean' | 'chaldean' | null
  notes: string | null
}) {
  const splitActive =
    relaxedSystem !== null && dualCount > 0 && dualCount < results.length
  const strict = splitActive ? results.slice(0, dualCount) : results
  const relaxed = splitActive ? results.slice(dualCount) : []

  return (
    <>
      {splitActive ? (
        <>
          <GroupHeading
            eyebrow={`Match both systems · ${dualCount}`}
            sub="reduce to your target under Pythagorean and Chaldean"
          />
          <ResultsGrid cards={strict} startDelay={0} />
          <GroupOrnament />
          <GroupHeading
            eyebrow={`${relaxedSystem === 'pythagorean' ? 'Pythagorean' : 'Chaldean'} only · ${relaxed.length}`}
            sub="strict-match candidates are exhausted — these reduce under one system to fill your count"
          />
          <ResultsGrid cards={relaxed} startDelay={strict.length * 0.04} />
        </>
      ) : (
        <>
          {notes && <ResultsNote text={notes} />}
          <ResultsGrid cards={results} startDelay={0} />
        </>
      )}
    </>
  )
}

function ResultsGrid({
  cards,
  startDelay,
}: {
  cards: Suggestion[]
  startDelay: number
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
      {cards.map((s, i) => (
        <CompanyCard
          key={s.name + i}
          suggestion={s}
          delay={startDelay + i * 0.04}
        />
      ))}
    </div>
  )
}

function GroupHeading({ eyebrow, sub }: { eyebrow: string; sub: string }) {
  return (
    <div className="flex flex-col items-center gap-1 mt-2">
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
      <span
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          fontStyle: 'italic',
          letterSpacing: '0.04em',
          color: 'var(--champagne)',
          opacity: 0.6,
        }}
      >
        {sub}
      </span>
    </div>
  )
}

function GroupOrnament() {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-3 mt-4 mb-2 w-full"
      style={{ opacity: 0.5 }}
    >
      <span
        style={{
          flex: 1,
          height: '0.5px',
          backgroundColor: 'var(--noir-border)',
        }}
      />
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '11px',
          letterSpacing: '0.2em',
          color: 'var(--gilt-primary)',
        }}
      >
        ◇
      </span>
      <span
        style={{
          flex: 1,
          height: '0.5px',
          backgroundColor: 'var(--noir-border)',
        }}
      />
    </div>
  )
}

function ResultsNote({ text }: { text: string }) {
  return (
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
      {text}
    </p>
  )
}
