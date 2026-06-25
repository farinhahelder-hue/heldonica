import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Slow Travel — Notre philosophie',
  description:
    'Le slow travel selon Heldonica : voyager lentement, s\'immerger vraiment, rencontrer les gens plutôt que les monuments. Notre manifeste et notre méthode.',
  keywords: ['slow travel', 'voyage lent', 'tourisme authentique', 'voyage responsable', 'Heldonica'],
  alternates: { canonical: 'https://www.heldonica.fr/slow-travel' },
  openGraph: {
    title: 'Slow Travel — Notre philosophie | Heldonica',
    description: 'Voyager lentement, s\'immerger vraiment, rencontrer les gens. Le slow travel par Heldonica.',
    url: 'https://www.heldonica.fr/slow-travel',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Slow Travel | Heldonica',
    description: 'Notre philosophie du voyage : lenteur, authenticité, rencontres. Le slow travel par Heldonica.',
  },
}

export default function SlowTravelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
