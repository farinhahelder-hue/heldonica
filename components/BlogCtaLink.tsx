'use client'

import Link from 'next/link'

interface BlogCtaLinkProps {
  href: string
  label: string
  gtag_label?: string
  className?: string
}

export default function BlogCtaLink({ href, label, gtag_label, className }: BlogCtaLinkProps) {
  const handleClick = () => {
    if (gtag_label && typeof window !== 'undefined') {
      ;(window as any).gtag?.('event', 'click', {
        event_category: 'CTA',
        event_label: gtag_label,
      })
    }
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {label}
    </Link>
  )
}
