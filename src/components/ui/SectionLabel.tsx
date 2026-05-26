'use client'

interface SectionLabelProps {
  children: React.ReactNode
  numeral?: string
  className?: string
}

export function SectionLabel({
  children,
  numeral,
  className = '',
}: SectionLabelProps) {
  return (
    <div
      className={className}
      style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: 'var(--gold-primary)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {numeral && (
        <>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
              fontWeight: 400,
              letterSpacing: '0.05em',
              color: 'var(--gilt-primary)',
              textTransform: 'none',
            }}
          >
            {numeral}
          </span>
          <span
            aria-hidden="true"
            style={{
              width: '20px',
              height: '1px',
              backgroundColor: 'var(--gilt-primary)',
              opacity: 0.6,
            }}
          />
        </>
      )}
      <span>{children}</span>
    </div>
  )
}
