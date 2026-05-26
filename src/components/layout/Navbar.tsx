'use client'

import Link from 'next/link'

function GithubIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
    </svg>
  )
}

export function Navbar() {
  return (
    <nav
      className="relative w-full z-10"
      style={{
        backgroundColor: 'var(--noir-base)',
        borderBottom: '0.5px solid rgba(0, 99, 65, 0.12)',
      }}
    >
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-5 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '22px',
              fontWeight: 300,
              letterSpacing: '0.08em',
              color: 'var(--gold-primary)',
            }}
          >
            NUMERIS
          </span>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '12px',
              color: 'var(--gilt-primary)',
              opacity: 0.75,
              letterSpacing: '0.1em',
            }}
          >
            Ⅰ
          </span>
        </Link>

        <div className="flex items-center gap-4 md:gap-7">
          <NavLink href="/calculator">Calculator</NavLink>
          <NavLink href="/suggest">Atelier</NavLink>
          <NavLink href="/foundry">Foundry</NavLink>
          <NavLink href="/about">About</NavLink>
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            style={{
              color: 'var(--champagne)',
              transition: 'color 250ms cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'inline-flex',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--gold-primary)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--champagne)'
            }}
          >
            <GithubIcon size={18} />
          </a>
        </div>
      </div>
    </nav>
  )
}

function NavLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: 'var(--font-ui)',
        fontSize: '12px',
        fontWeight: 500,
        letterSpacing: '0.04em',
        color: 'var(--champagne)',
        transition: 'color 250ms cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--gold-primary)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--champagne)'
      }}
    >
      {children}
    </Link>
  )
}
