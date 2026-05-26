'use client'

import { motion } from 'framer-motion'

const EASE = [0.16, 1, 0.3, 1] as const
const NUMERALS = ['Ⅰ', 'Ⅱ', 'Ⅲ', 'Ⅳ', 'Ⅴ', 'Ⅵ', 'Ⅶ', 'Ⅷ', 'Ⅸ']
const C = 200
const R_OUTER = 180
const R_INNER = 145
const R_NUMERALS = 162
const R_CENTER_RING = 24

// Round to avoid SSR/client floating-point drift in the last ~1e-14
const r = (n: number) => Math.round(n * 1000) / 1000

function position(idx: number, radius: number) {
  // 9 numerals evenly spaced, Ⅰ at top
  const deg = -90 + idx * 40
  const rad = (deg * Math.PI) / 180
  return {
    x: r(C + radius * Math.cos(rad)),
    y: r(C + radius * Math.sin(rad)),
  }
}

export function SacredWheel() {
  // 36 tick marks at 10° intervals on the outer ring (every 9th is "major")
  const ticks = Array.from({ length: 36 }, (_, i) => {
    const rad = (i * 10 * Math.PI) / 180
    const isMajor = i % 9 === 0
    const inset = isMajor ? 10 : 5
    return {
      x1: r(C + R_OUTER * Math.cos(rad)),
      y1: r(C + R_OUTER * Math.sin(rad)),
      x2: r(C + (R_OUTER - inset) * Math.cos(rad)),
      y2: r(C + (R_OUTER - inset) * Math.sin(rad)),
      isMajor,
    }
  })

  return (
    <section
      className="w-full flex flex-col items-center justify-center"
      style={{
        backgroundColor: 'var(--noir-base)',
        padding: '40px 24px 96px',
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: EASE }}
        style={{ position: 'relative' }}
      >
        <svg
          viewBox="0 0 400 400"
          width="100%"
          height="auto"
          style={{ maxWidth: '380px', display: 'block' }}
          aria-hidden="true"
        >
          {/* Continuous slow rotation — outer tick marks */}
          <motion.g
            animate={{ rotate: 360 }}
            transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: '200px 200px' }}
          >
            {ticks.map((t, i) => (
              <line
                key={i}
                x1={t.x1}
                y1={t.y1}
                x2={t.x2}
                y2={t.y2}
                stroke="var(--gilt-primary)"
                strokeWidth={t.isMajor ? 1.4 : 0.5}
                opacity={t.isMajor ? 0.7 : 0.32}
                strokeLinecap="round"
              />
            ))}
          </motion.g>

          {/* Outer ring */}
          <motion.circle
            cx={C}
            cy={C}
            r={R_OUTER - 6}
            fill="none"
            stroke="var(--gold-primary)"
            strokeWidth={0.6}
            opacity={0.35}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.4, ease: EASE }}
          />

          {/* Inner dashed ring */}
          <motion.circle
            cx={C}
            cy={C}
            r={R_INNER}
            fill="none"
            stroke="var(--gold-primary)"
            strokeWidth={0.5}
            strokeDasharray="2 5"
            opacity={0.4}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 1.2, ease: EASE, delay: 0.2 }}
          />

          {/* Spokes from center to each numeral */}
          {NUMERALS.map((_, i) => {
            const inner = position(i, R_CENTER_RING + 6)
            const outer = position(i, R_NUMERALS - 18)
            return (
              <motion.line
                key={`spoke-${i}`}
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke="var(--gilt-primary)"
                strokeWidth={0.5}
                opacity={0.25}
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{
                  duration: 0.7,
                  ease: EASE,
                  delay: 0.4 + i * 0.055,
                }}
              />
            )
          })}

          {/* Roman numerals */}
          {NUMERALS.map((numeral, i) => {
            const p = position(i, R_NUMERALS)
            return (
              <motion.text
                key={`num-${i}`}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '18px',
                  fontWeight: 400,
                  fill: 'var(--gold-primary)',
                  letterSpacing: '0.03em',
                }}
                initial={{ opacity: 0, scale: 0.82 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{
                  duration: 0.5,
                  ease: EASE,
                  delay: 0.7 + i * 0.05,
                }}
              >
                {numeral}
              </motion.text>
            )
          })}

          {/* Center ornament — gilt rhombus with halo */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: EASE, delay: 1.4 }}
            style={{ transformOrigin: '200px 200px' }}
          >
            <circle
              cx={C}
              cy={C}
              r={R_CENTER_RING}
              fill="none"
              stroke="var(--gilt-primary)"
              strokeWidth={0.5}
              opacity={0.45}
            />
            <circle
              cx={C}
              cy={C}
              r={R_CENTER_RING - 8}
              fill="none"
              stroke="var(--gilt-primary)"
              strokeWidth={0.5}
              opacity={0.3}
            />
            <rect
              x={C - 5}
              y={C - 5}
              width={10}
              height={10}
              fill="var(--gilt-primary)"
              transform={`rotate(45 ${C} ${C})`}
              style={{
                filter: 'drop-shadow(0 0 8px rgba(181, 150, 94, 0.55))',
              }}
            />
          </motion.g>
        </svg>
      </motion.div>

      {/* Latin inscription */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, ease: EASE, delay: 1.6 }}
        className="flex flex-col items-center"
        style={{ marginTop: '40px', gap: '12px' }}
      >
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(14px, 2.4vw, 18px)',
            fontStyle: 'italic',
            fontWeight: 400,
            letterSpacing: '0.42em',
            color: 'var(--gilt-primary)',
            textTransform: 'uppercase',
            textAlign: 'center',
          }}
        >
          Numero · Pondere · Mensura
        </p>
        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--champagne)',
            opacity: 0.55,
            textAlign: 'center',
          }}
        >
          By Number, Weight, and Measure
        </p>
      </motion.div>
    </section>
  )
}
