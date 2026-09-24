'use client'

import { type ReactNode } from 'react'
import Link from 'next/link'

type Variant = 'primary' | 'secondary' | 'outline' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary:
    'rounded-full bg-eucalyptus text-white hover:bg-eucalyptus/90 focus-visible:ring-2 focus-visible:ring-eucalyptus focus-visible:outline-none',
  secondary:
    'rounded-full bg-teal text-white hover:bg-teal/90 focus-visible:ring-2 focus-visible:ring-teal focus-visible:outline-none',
  destructive:
    'rounded-full bg-mahogany text-white hover:bg-mahogany/90 focus-visible:ring-2 focus-visible:ring-mahogany focus-visible:outline-none',
  outline:
    'rounded-full border border-charcoal/20 text-charcoal hover:border-charcoal focus-visible:ring-2 focus-visible:ring-charcoal focus-visible:outline-none',
}

const sizes: Record<Size, string> = {
  sm: 'px-5 py-2 text-xs',
  md: 'px-8 py-3.5 text-sm',
  lg: 'px-10 py-4 text-sm',
}

const base = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60'

interface ButtonProps {
  variant?: Variant
  size?: Size
  href?: string
  children: ReactNode
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  external?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  href,
  children,
  className = '',
  disabled,
  type = 'button',
  onClick,
  external,
}: ButtonProps) {
  const classes = `${base} ${variants[variant]} ${sizes[size]} ${className}`

  if (href) {
    return external ? (
      <a
        href={href}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ) : (
      <Link href={href} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
