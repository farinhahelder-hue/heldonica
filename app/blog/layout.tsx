import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Carnets de voyage — Blog',
  description:
    `Nos carnets slow travel écrits depuis le terrain : Madère, Portugal, Grèce, Colombie. Des récits authentiques du duo Heldonica — pas des guides génériques.`,
  keywords: ['blog voyage', 'slow travel', 'carnets de voyage', 'Madère', 'Portugal', 'Heldonica'],
  alternates: { canonical: 'https://www.heldonica.fr/blog' },
  openGraph: {
    title: 'Carnets de voyage | Heldonica',
    description: 'Récits slow travel écrits depuis le terrain — Madère, Portugal, Grèce, Colombie et plus.',
    url: 'https://www.heldonica.fr/blog',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Carnets de voyage | Heldonica',
    description: 'Récits slow travel authentiques — écrits depuis le terrain, pas depuis un bureau.',
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
