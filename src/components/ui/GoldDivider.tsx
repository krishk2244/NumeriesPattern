'use client'

export function GoldDivider() {
  return (
    <div
      className="flex items-center justify-center gap-4 px-6"
      style={{ marginTop: '64px', marginBottom: '64px' }}
    >
      <div
        className="flex-1"
        style={{
          height: '1px',
          maxWidth: '240px',
          background:
            'linear-gradient(to right, transparent, rgba(0, 99, 65, 0.4))',
        }}
      />
      <div className="relative" style={{ width: '12px', height: '12px' }}>
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: '2px',
            backgroundColor: 'var(--gilt-primary)',
            transform: 'rotate(45deg)',
            boxShadow:
              '0 0 16px rgba(181, 150, 94, 0.55), inset 0 0 4px rgba(255, 255, 255, 0.4)',
          }}
        />
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            border: '0.5px solid var(--gilt-primary)',
            transform: 'rotate(45deg)',
            opacity: 0.4,
          }}
        />
      </div>
      <div
        className="flex-1"
        style={{
          height: '1px',
          maxWidth: '240px',
          background:
            'linear-gradient(to left, transparent, rgba(0, 99, 65, 0.4))',
        }}
      />
    </div>
  )
}
