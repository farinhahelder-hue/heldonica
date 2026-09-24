'use client'

import TrackedLink from './TrackedLink'

interface Props {
  destination: string
  duration: string
  className?: string
}

export default function PdfDownloadButton({ destination, duration, className }: Props) {
  return (
    <TrackedLink
      href="#pdf-download"
      preventDefault
      onClick={() => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'guide_pdf_telecharge', { destination, duration })
        }
        alert('Le PDF sera bientôt disponible. En attendant, tu peux sauvegarder cette page ou nous écrire pour une version personnalisée.')
      }}
      className={className}
    >
      Télécharger le PDF →
    </TrackedLink>
  )
}
