'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { NumerologySystem } from '@/types/numerology'
import { PYTHAGOREAN_MAP, CHALDEAN_MAP } from '@/lib/constants'

const EASE = [0.16, 1, 0.3, 1] as const

interface SystemExplainerProps {
  system: NumerologySystem
}

export function SystemExplainer({ system }: SystemExplainerProps) {
  return (
    <div className="w-full flex flex-col items-center gap-5">
      <AnimatePresence mode="wait">
        {system === 'pythagorean' ? (
          <PythagoreanGrid key="pythagorean" />
        ) : (
          <ChaldeanGrid key="chaldean" />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ──────────────────────  PYTHAGOREAN  ────────────────────── */

function PythagoreanGrid() {
  const rows = [
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'],
    ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'],
    ['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
  ]

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, transition: { duration: 0.18, ease: EASE } }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.16, delayChildren: 0.05 } },
      }}
      className="flex flex-col gap-3 w-full"
    >
      {rows.map((row, idx) => (
        <PythagoreanRow key={idx} letters={row} />
      ))}
    </motion.div>
  )
}

function PythagoreanRow({ letters }: { letters: string[] }) {
  return (
    <motion.div
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.035 } },
      }}
      className="grid gap-1.5"
      style={{ gridTemplateColumns: 'repeat(9, minmax(0, 1fr))' }}
    >
      {Array.from({ length: 9 }).map((_, colIdx) => {
        const letter = letters[colIdx]
        if (!letter) {
          return <div key={colIdx} aria-hidden="true" />
        }
        return (
          <motion.div
            key={letter}
            variants={{
              hidden: { opacity: 0, y: 6 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.32, ease: EASE },
              },
            }}
            className="flex flex-col items-center"
          >
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 'clamp(11px, 2.6vw, 13px)',
                fontWeight: 600,
                color: 'var(--cream)',
                lineHeight: 1.2,
              }}
            >
              {letter}
            </span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{
                opacity: 1,
                transition: { delay: 0.2, duration: 0.28, ease: EASE },
              }}
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'clamp(10px, 2.2vw, 11px)',
                fontWeight: 500,
                color: 'var(--gold-primary)',
                lineHeight: 1.2,
                marginTop: '3px',
              }}
            >
              {PYTHAGOREAN_MAP[letter]}
            </motion.span>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

/* ──────────────────────  CHALDEAN  ────────────────────── */

function ChaldeanGrid() {
  const numbers = Array.from(new Set(Object.values(CHALDEAN_MAP))).sort(
    (a, b) => a - b
  )
  const lettersByNumber: Record<number, string[]> = {}
  for (const n of numbers) {
    lettersByNumber[n] = Object.entries(CHALDEAN_MAP)
      .filter(([, v]) => v === n)
      .map(([l]) => l)
      .sort()
  }

  return (
    <motion.div
      initial="hidden"
      animate="show"
      exit={{ opacity: 0, transition: { duration: 0.18, ease: EASE } }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
      }}
      className="grid w-full"
      style={{ gridTemplateColumns: `repeat(${numbers.length}, minmax(0, 1fr))` }}
    >
      {numbers.map((n) => (
        <ChaldeanColumn
          key={n}
          number={n}
          letters={lettersByNumber[n] ?? []}
        />
      ))}
    </motion.div>
  )
}

function ChaldeanColumn({
  number,
  letters,
}: {
  number: number
  letters: string[]
}) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: {
            duration: 0.2,
            ease: EASE,
            staggerChildren: 0.04,
            delayChildren: 0.08,
          },
        },
      }}
      className="flex flex-col items-center"
    >
      <motion.div
        variants={{
          hidden: { opacity: 0, y: -4 },
          show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: EASE } },
        }}
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(11px, 2.8vw, 13px)',
          fontWeight: 500,
          color: 'var(--gold-primary)',
          lineHeight: 1,
          paddingBottom: '8px',
          marginBottom: '8px',
          width: '100%',
          textAlign: 'center',
          borderBottom: '0.5px solid var(--noir-border)',
        }}
      >
        {number}
      </motion.div>

      <div className="flex flex-col items-center gap-1.5">
        {letters.map((letter) => (
          <motion.span
            key={letter}
            variants={{
              hidden: { opacity: 0, y: -3 },
              show: {
                opacity: 1,
                y: 0,
                transition: { duration: 0.26, ease: EASE },
              },
            }}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 'clamp(11px, 2.6vw, 13px)',
              fontWeight: 600,
              color: 'var(--cream)',
              lineHeight: 1.3,
            }}
          >
            {letter}
          </motion.span>
        ))}
      </div>
    </motion.div>
  )
}
