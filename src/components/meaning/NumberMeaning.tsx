'use client'

import { motion } from 'framer-motion'
import { NumberMeaning as NumberMeaningType } from '@/types/numerology'

interface NumberMeaningProps {
  meaning: NumberMeaningType
}

const EASE = [0.16, 1, 0.3, 1] as const

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE, staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: EASE },
  },
}

export function NumberMeaning({ meaning }: NumberMeaningProps) {
  const pills = [meaning.planet, ...meaning.keywords]

  return (
    <motion.div
      key={meaning.archetype}
      className="flex flex-col items-center gap-6 mt-2"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.h3
        variants={itemVariants}
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(24px, 5vw, 32px)',
          fontWeight: 400,
          letterSpacing: '-0.005em',
          color: 'var(--cream)',
          textAlign: 'center',
          lineHeight: 1.1,
        }}
      >
        {meaning.archetype}
      </motion.h3>

      <motion.div
        variants={itemVariants}
        className="flex flex-wrap justify-center gap-2"
      >
        {pills.map((label, idx) => (
          <span
            key={`${label}-${idx}`}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              padding: '6px 14px',
              borderRadius: '9999px',
              color: 'var(--gold-primary)',
              backgroundColor: 'rgba(0, 99, 65, 0.08)',
              border: '0.5px solid var(--noir-border)',
            }}
          >
            {label}
          </span>
        ))}
      </motion.div>

      <motion.p
        variants={itemVariants}
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '15px',
          fontWeight: 400,
          lineHeight: 1.7,
          color: 'var(--champagne)',
          opacity: 0.75,
          textAlign: 'center',
          maxWidth: '460px',
        }}
      >
        {meaning.description}
      </motion.p>
    </motion.div>
  )
}
