'use client'

import { InputHTMLAttributes } from 'react'

interface NameInputProps extends InputHTMLAttributes<HTMLInputElement> {
  placeholder?: string
}

const TRANSITION = '250ms cubic-bezier(0.16, 1, 0.3, 1)'
const REST_BORDER = 'rgba(181, 150, 94, 0.4)'
const FOCUS_BORDER = 'var(--gold-primary)'
const REST_SHADOW =
  'inset 0 1px 2px rgba(140, 111, 61, 0.08), inset 0 0 0 1px rgba(255, 255, 255, 0.5)'
const FOCUS_SHADOW =
  'inset 0 1px 2px rgba(0, 99, 65, 0.06), 0 0 0 4px rgba(0, 99, 65, 0.1), 0 6px 16px rgba(0, 99, 65, 0.08)'

export function NameInput({
  placeholder = 'Enter your name...',
  ...props
}: NameInputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      autoComplete="off"
      spellCheck={false}
      className="w-full outline-none"
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(20px, 3vw, 26px)',
        fontWeight: 400,
        letterSpacing: '0.18em',
        textAlign: 'center',
        padding: '22px 28px',
        backgroundColor: 'var(--ivory)',
        color: 'var(--cream)',
        border: `1px solid ${REST_BORDER}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: REST_SHADOW,
        transition: `border-color ${TRANSITION}, box-shadow ${TRANSITION}, background-color ${TRANSITION}`,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = FOCUS_BORDER
        e.currentTarget.style.boxShadow = FOCUS_SHADOW
        e.currentTarget.style.backgroundColor = '#FFFFFF'
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = REST_BORDER
        e.currentTarget.style.boxShadow = REST_SHADOW
        e.currentTarget.style.backgroundColor = 'var(--ivory)'
      }}
      {...props}
    />
  )
}
