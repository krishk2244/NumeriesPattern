'use client'

export function Footer() {
  return (
    <footer
      className="w-full py-16 px-6 text-center"
      style={{ backgroundColor: 'var(--noir-base)' }}
    >
      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '13px',
          fontWeight: 400,
          letterSpacing: '0.06em',
          color: 'var(--champagne)',
          opacity: 0.6,
        }}
      >
        NUMERIS — Sacred Mathematics in Digital Form
      </p>
      <p
        style={{
          fontFamily: 'var(--font-ui)',
          fontSize: '11px',
          fontWeight: 400,
          letterSpacing: '0.08em',
          marginTop: '12px',
          color: 'var(--champagne)',
          opacity: 0.4,
        }}
      >
        © 2026 NUMERIS · All rights reserved.
      </p>
    </footer>
  )
}
