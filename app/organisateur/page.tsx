import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import TravelOrganizerClient from './TravelOrganizerClient'

export const metadata: Metadata = {
  title: 'Organisateur de voyage gratuit | Heldonica',
  description: 'Planifie ton voyage en ligne : itinéraire étape par étape, budget par poste, checklist de départ. Outil gratuit, sauvegarde locale automatique.',
  alternates: {
    canonical: 'https://www.heldonica.fr/organisateur',
  },
  openGraph: {
    url: 'https://www.heldonica.fr/organisateur',
    title: 'Organisateur de voyage gratuit | Heldonica',
    description: 'Planifie ton itinéraire, gère ton budget et prépare ta checklist. Outil gratuit.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Organisateur de voyage — Heldonica',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
    siteName: 'Heldonica',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Organisateur de voyage gratuit | Heldonica',
    description: 'Planifie ton itinéraire, gère ton budget et prépare ta checklist. Outil gratuit.',
    creator: '@heldonica',
    images: ['/og-default.jpg'],
  },
}

export default function OrganizerPage() {
  return (
    <>
      <Header />
      <Breadcrumb />
      <TravelOrganizerClient />
      <Footer />
    </>
  )
}
