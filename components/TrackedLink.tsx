'use client'

import { type ReactNode } from 'react'

interface Props {
  href: string
  children: ReactNode
  className?: string
  target?: string
  rel?: string
  onClick?: () => void
  preventDefault?: boolean
}

export default function TrackedLink({ href, children, className, target, rel, onClick, preventDefault = false }: Props) {
  return (
    <a
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={(e) => {
        if (preventDefault) e.preventDefault()
        onClick?.()
        if (href.startsWith('#') && !preventDefault) {
          const el = document.querySelector(href)
          if (el) el.scrollIntoView({ behavior: 'smooth' })
        }
      }}
    >
      {children}
    </a>
  )
}
