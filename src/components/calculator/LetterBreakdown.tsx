'use client'

import { motion } from 'framer-motion'
import { LetterResult } from '@/types/numerology'

interface LetterBreakdownProps {
  letters: LetterResult[]
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.04 },
  },
}

const letterItem = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
  },
}

const restBorder = 'rgba(0, 99, 65, 0.15)'
const hoverBorder = 'rgba(0, 99, 65, 0.35)'
const hoverGlow = '0 0 8px rgba(0, 99, 65, 0.2)'

export function LetterBreakdown({ letters }: LetterBreakdownProps) {
  return (
    <motion.div
      className="flex flex-wrap justify-center gap-3"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {letters.map((letter, idx) => {
        if (letter.isSpace) {
          return (
            <div
              key={idx}
              aria-hidden="true"
              style={{ width: '52px', height: '64px' }}
            />
          )
        }

        return (
          <motion.div
            key={idx}
            variants={letterItem}
            whileHover={{
              borderColor: hoverBorder,
              boxShadow: hoverGlow,
            }}
            className="flex flex-col items-center justify-between"
            style={{
              width: '52px',
              height: '64px',
              backgroundColor: 'var(--noir-elevated)',
              border: `0.5px solid ${restBorder}`,
              borderRadius: 'var(--radius-md)',
              padding: '8px 6px',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--cream)',
                lineHeight: 1,
              }}
            >
              {letter.char}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--gold-primary)',
                lineHeight: 1,
              }}
            >
              {letter.value ?? ''}
            </span>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
