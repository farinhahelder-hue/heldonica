'use client'

import TrackedLink from './TrackedLink'

interface Props {
  href: string
  children: React.ReactNode
  eventName: string
  eventParams?: Record<string, string>
  className?: string
  target?: string
  rel?: string
}

export default function B2bCtaButton({ href, children, eventName, eventParams = {}, className, target, rel }: Props) {
  return (
    <TrackedLink
      href={href}
      target={target}
      rel={rel}
      onClick={() => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', eventName, eventParams)
        }
      }}
      className={className}
    >
      {children}
    </TrackedLink>
  )
}
