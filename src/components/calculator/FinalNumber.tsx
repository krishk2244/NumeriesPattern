'use client'

import { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface FinalNumberProps {
  number: number
}

export function FinalNumber({ number }: FinalNumberProps) {
  const spring = useSpring(0, { stiffness: 80, damping: 18 })
  const display = useTransform(spring, (v) => Math.round(v).toString())

  useEffect(() => {
    spring.set(number)
  }, [number, spring])

  return (
    <div className="flex flex-col items-center gap-7">
      <div
        style={{
          width: '80px',
          height: '1px',
          background:
            'linear-gradient(to right, transparent, var(--gilt-primary), transparent)',
        }}
      />

      <motion.span
        style={{
          display: 'inline-block',
          fontFamily: 'var(--font-mono)',
          fontSize: 'clamp(64px, 18vw, 96px)',
          fontWeight: 400,
          color: 'var(--gold-primary)',
          letterSpacing: '-0.03em',
          lineHeight: 1,
          padding: '8px 28px',
          borderRadius: '9999px',
          textShadow:
            '0 0 36px rgba(181, 150, 94, 0.45), 0 0 16px rgba(0, 99, 65, 0.25)',
          animation: 'goldPulse 3s ease-in-out infinite',
        }}
      >
        {display}
      </motion.span>

      <div
        style={{
          width: '80px',
          height: '1px',
          background:
            'linear-gradient(to right, transparent, var(--gilt-primary), transparent)',
        }}
      />
    </div>
  )
}
