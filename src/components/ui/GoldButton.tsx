'use client'

import { ButtonHTMLAttributes } from 'react'

interface GoldButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'solid' | 'outline'
}

const sizeClasses = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

export function GoldButton({
  children,
  size = 'md',
  variant = 'solid',
  className = '',
  ...props
}: GoldButtonProps) {
  const variantClasses =
    variant === 'solid'
      ? 'bg-gold-400 text-noir-50 hover:bg-gold-600'
      : 'border border-gold-400 text-gold-400 hover:bg-gold-400/10'

  return (
    <button
      className={`font-medium rounded-sm outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-gold-400/40 focus-visible:ring-offset-2 focus-visible:ring-offset-noir-100 ${sizeClasses[size]} ${variantClasses} ${className}`}
      style={{
        fontFamily: 'var(--font-ui)',
        letterSpacing: '0.02em',
      }}
      {...props}
    >
      {children}
    </button>
  )
}
