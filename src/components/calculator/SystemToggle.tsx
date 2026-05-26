'use client'

import { motion } from 'framer-motion'
import { SystemSelection } from '@/types/numerology'
import { SYSTEMS } from '@/lib/constants'

interface SystemToggleProps {
  value: SystemSelection
  onChange: (system: SystemSelection) => void
}

const OPTIONS: { id: SystemSelection; label: string }[] = [
  { id: 'pythagorean', label: 'Pythagorean' },
  { id: 'chaldean', label: 'Chaldean' },
  { id: 'both', label: 'Both' },
]

const DESCRIPTIONS: Record<SystemSelection, string> = {
  pythagorean: SYSTEMS.pythagorean.description,
  chaldean: SYSTEMS.chaldean.description,
  both: 'Only names whose letters reduce to your target under BOTH systems — the strongest numerological match.',
}

const EASE = [0.16, 1, 0.3, 1] as const

export function SystemToggle({ value, onChange }: SystemToggleProps) {
  return (
    <div className="flex flex-col items-center gap-5">
      <div
        className="relative inline-flex p-1 rounded-full"
        style={{
          backgroundColor: 'var(--noir-elevated)',
          border: '0.5px solid var(--noir-border)',
        }}
      >
        {OPTIONS.map((o) => {
          const isActive = value === o.id
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              aria-pressed={isActive}
              className="relative"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '13px',
                fontWeight: 500,
                letterSpacing: '0.06em',
                padding: '9px 22px',
                borderRadius: '9999px',
                color: isActive ? 'var(--noir-base)' : 'var(--champagne)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                zIndex: 1,
                transition: 'color 200ms cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              {isActive && (
                <motion.span
                  layoutId="system-toggle-active"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 32,
                  }}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '9999px',
                    backgroundColor: 'var(--gold-primary)',
                    boxShadow:
                      'inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 4px 14px rgba(0, 99, 65, 0.25)',
                    zIndex: -1,
                  }}
                />
              )}
              <span style={{ position: 'relative' }}>{o.label}</span>
            </button>
          )
        })}
      </div>

      <motion.p
        key={value}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 0.7, y: 0 }}
        transition={{ duration: 0.32, ease: EASE }}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          fontStyle: 'italic',
          color: 'var(--champagne)',
          textAlign: 'center',
          maxWidth: '480px',
          lineHeight: 1.65,
        }}
      >
        {DESCRIPTIONS[value]}
      </motion.p>
    </div>
  )
}
