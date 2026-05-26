'use client'

import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { PYTHAGOREAN_MAP, CHALDEAN_MAP } from '@/lib/constants'
import { NumerologySystem } from '@/types/numerology'

const EASE = [0.16, 1, 0.3, 1] as const
const ROW_HOVER = 'rgba(0, 99, 65, 0.06)'

interface ReferenceChartProps {
  system: NumerologySystem
}

export function ReferenceChart({ system }: ReferenceChartProps) {
  const [isOpen, setIsOpen] = useState(false)

  const { numbers, rows, systemName } = useMemo(() => {
    const map = system === 'pythagorean' ? PYTHAGOREAN_MAP : CHALDEAN_MAP
    const nums = Array.from(new Set(Object.values(map))).sort((a, b) => a - b)
    const lettersByNumber = new Map<number, string[]>()
    for (const n of nums) {
      lettersByNumber.set(
        n,
        Object.entries(map)
          .filter(([, v]) => v === n)
          .map(([l]) => l)
          .sort()
      )
    }
    const maxRows = Math.max(
      ...nums.map((n) => lettersByNumber.get(n)?.length ?? 0)
    )
    const rowGrid: string[][] = Array.from({ length: maxRows }, (_, r) =>
      nums.map((n) => lettersByNumber.get(n)?.[r] ?? '')
    )
    return {
      numbers: nums,
      rows: rowGrid,
      systemName: system === 'pythagorean' ? 'Pythagorean' : 'Chaldean',
    }
  }, [system])

  const gridStyle = {
    gridTemplateColumns: `repeat(${numbers.length}, minmax(0, 1fr))`,
  }

  return (
    <div className="w-full mt-8">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between py-4"
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          fontWeight: 500,
          letterSpacing: '0.04em',
          color: 'var(--gold-primary)',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        <span>Reference Chart · {systemName}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          style={{ display: 'inline-flex' }}
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <div
              className="mt-2"
              style={{
                backgroundColor: 'var(--noir-card)',
                border: '0.5px solid var(--noir-border)',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
              }}
            >
              <div
                className="grid"
                style={{
                  ...gridStyle,
                  borderBottom: '0.5px solid var(--noir-border)',
                }}
              >
                {numbers.map((n, idx) => (
                  <div
                    key={n}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'clamp(12px, 2.8vw, 14px)',
                      fontWeight: 500,
                      color: 'var(--gold-primary)',
                      textAlign: 'center',
                      padding: '10px 0',
                      borderRight:
                        idx === numbers.length - 1
                          ? 'none'
                          : '0.5px solid var(--noir-border)',
                    }}
                  >
                    {n}
                  </div>
                ))}
              </div>

              {rows.map((row, rowIdx) => (
                <ChartRow
                  key={rowIdx}
                  cells={row}
                  gridStyle={gridStyle}
                  isLast={rowIdx === rows.length - 1}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface ChartRowProps {
  cells: string[]
  gridStyle: React.CSSProperties
  isLast: boolean
}

function ChartRow({ cells, gridStyle, isLast }: ChartRowProps) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="grid"
      style={{
        ...gridStyle,
        backgroundColor: hovered ? ROW_HOVER : 'transparent',
        borderBottom: isLast ? 'none' : '0.5px solid var(--noir-border)',
        transition: 'background-color 200ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {cells.map((letter, idx) => (
        <div
          key={idx}
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: 'clamp(11px, 2.6vw, 13px)',
            fontWeight: 500,
            color: 'var(--cream)',
            textAlign: 'center',
            padding: '9px 0',
            minHeight: '36px',
            borderRight:
              idx === cells.length - 1
                ? 'none'
                : '0.5px solid var(--noir-border)',
          }}
        >
          {letter}
        </div>
      ))}
    </div>
  )
}
