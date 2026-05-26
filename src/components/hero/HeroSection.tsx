'use client'

import { GoldButton } from '@/components/ui/GoldButton'

export function HeroSection() {
  const handleScroll = () => {
    const target = document.getElementById('explore')
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section
      className="relative w-full flex flex-col items-center justify-center overflow-hidden py-20 md:py-0"
      style={{
        minHeight: '100svh',
        background:
          'radial-gradient(ellipse at center, #FFFFFF 0%, #F4F1E9 100%)',
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 30%, rgba(0, 99, 65, 0.06), transparent 60%)',
        }}
      />

      <div className="relative z-10 flex flex-col items-center gap-6 md:gap-7 text-center px-6 max-w-3xl">
        <span
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--gold-primary)',
          }}
        >
          Sacred Numerology
        </span>

        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(40px, 6vw, 72px)',
            fontWeight: 300,
            letterSpacing: '-0.02em',
            lineHeight: 1.08,
            color: 'var(--cream)',
            textWrap: 'balance',
            maxWidth: '14ch',
          }}
        >
          Discover what your name reveals.
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '17px',
            fontWeight: 400,
            lineHeight: 1.7,
            color: 'var(--champagne)',
            opacity: 0.85,
            fontStyle: 'italic',
            maxWidth: '460px',
          }}
        >
          Ancient mathematics. Modern precision.
        </p>

        <div className="mt-3">
          <GoldButton onClick={handleScroll} size="md">
            Begin
          </GoldButton>
        </div>

        <div
          className="mt-6 flex items-center justify-center gap-3"
          aria-hidden="true"
        >
          <span
            style={{
              width: '40px',
              height: '1px',
              background:
                'linear-gradient(to right, transparent, var(--gilt-primary))',
            }}
          />
          <span
            style={{
              width: '6px',
              height: '6px',
              backgroundColor: 'var(--gilt-primary)',
              transform: 'rotate(45deg)',
              boxShadow: '0 0 8px rgba(181, 150, 94, 0.5)',
            }}
          />
          <span
            style={{
              width: '40px',
              height: '1px',
              background:
                'linear-gradient(to left, transparent, var(--gilt-primary))',
            }}
          />
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(250, 250, 247, 0) 0%, rgba(241, 239, 232, 0.9) 100%)',
        }}
      />
    </section>
  )
}
