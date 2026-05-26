'use client'

import { motion } from 'framer-motion'

interface ReductionStepsProps {
  steps: number[]
}

const EASE = [0.16, 1, 0.3, 1] as const

export function ReductionSteps({ steps }: ReductionStepsProps) {
  return (
    <div className="flex items-center justify-center gap-3 flex-wrap">
      {steps.map((step, idx) => {
        const isFinal = idx === steps.length - 1
        const dim = isFinal ? 64 : 48

        return (
          <div key={idx} className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.15, duration: 0.4, ease: EASE }}
              className="flex items-center justify-center"
              style={{
                width: `${dim}px`,
                height: `${dim}px`,
                borderRadius: '9999px',
                backgroundColor: isFinal ? 'transparent' : 'var(--noir-elevated)',
                border: isFinal
                  ? '1.5px solid var(--gold-primary)'
                  : '0.5px solid var(--noir-border)',
                boxShadow: isFinal
                  ? '0 0 24px rgba(0, 99, 65, 0.18)'
                  : 'none',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 400,
                  fontSize: isFinal ? '24px' : '20px',
                  color: 'var(--gold-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {step}
              </span>
            </motion.div>

            {!isFinal && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 0.5, x: 0 }}
                transition={{
                  delay: idx * 0.15 + 0.075,
                  duration: 0.3,
                  ease: EASE,
                }}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '20px',
                  color: 'var(--champagne)',
                  lineHeight: 1,
                }}
              >
                ›
              </motion.span>
            )}
          </div>
        )
      })}
    </div>
  )
}
