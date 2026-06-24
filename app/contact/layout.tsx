import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Une question, un projet de voyage sur mesure ? Écrivez à Hélder et Elena. On répond sous 48h ouvrées. Sans engagement.',
  alternates: { canonical: 'https://www.heldonica.fr/contact' },
  openGraph: {
    title: 'Contactez Heldonica',
    description: 'Ton projet de voyage sur mesure commence ici. Réponse sous 48h, sans engagement.',
    url: 'https://www.heldonica.fr/contact',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary',
    title: 'Contact | Heldonica',
    description: 'Écrivez-nous pour votre projet de voyage sur mesure. Réponse sous 48h.',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
