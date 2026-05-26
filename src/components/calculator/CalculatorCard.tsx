'use client'

import { motion } from 'framer-motion'

interface CalculatorCardProps {
  children: React.ReactNode
}

const EASE = [0.16, 1, 0.3, 1] as const

export function CalculatorCard({ children }: CalculatorCardProps) {
  return (
    <section
      id="calculator"
      className="w-full py-16 md:py-32 flex justify-center items-center px-0 md:px-6"
      style={{ backgroundColor: 'var(--noir-base)' }}
    >
      <div
        className="relative w-full p-6 md:p-16 md:rounded-lg"
        style={{
          maxWidth: '960px',
          backgroundColor: 'var(--noir-card)',
          border: '0.5px solid var(--noir-border)',
          boxShadow:
            '0 1px 0 rgba(0, 99, 65, 0.04) inset, 0 12px 28px rgba(15, 20, 16, 0.06), 0 32px 64px rgba(15, 20, 16, 0.08)',
        }}
      >
        <motion.div
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '1px',
            background:
              'linear-gradient(to right, transparent, var(--gold-primary), transparent)',
            transformOrigin: 'center',
            opacity: 0.55,
          }}
        />
        <motion.div
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.35 }}
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '1px',
            background:
              'linear-gradient(to right, transparent, var(--gold-primary), transparent)',
            transformOrigin: 'center',
            opacity: 0.55,
          }}
        />

        {children}
      </div>
    </section>
  )
}
