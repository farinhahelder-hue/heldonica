import type { Metadata } from 'next'

const SITE = 'https://www.heldonica.fr'

export const travelPlanningMetadata: Metadata = {
  title: 'Travel Planning sur mesure — Heldonica',
  description:
    "Heldonica conçoit votre voyage sur mesure : itinéraire pensé pour votre rythme, pépites dénichées sur le terrain, carnet de route complet. Slow travel en couple ou en famille.",
  alternates: { canonical: `${SITE}/travel-planning` },
  openGraph: {
    title: 'Conception de voyage sur mesure | Heldonica',
    description:
      "Un itinéraire conçu pour vous, des adresses testées sur le terrain, un carnet de route PDF. Slow travel authentique.",
    url: `${SITE}/travel-planning`,
    siteName: 'Heldonica',
    type: 'website',
    images: [{ url: `${SITE}/og-travel-planning.jpg`, width: 1200, height: 630, alt: 'Travel Planning Heldonica' }],
  },
  twitter: { card: 'summary_large_image', title: 'Travel Planning sur mesure | Heldonica', description: 'Voyages conçus sur mesure, pépites dénichées, slow travel authentique.' },
}

export const blogListMetadata: Metadata = {
  title: 'Carnets de voyage — Blog Heldonica',
  description:
    "Nos carnets de voyage slow travel : Madère, Portugal, Grèce et au-delà. Des récits authentiques écrits depuis le terrain, pas depuis un bureau.",
  alternates: { canonical: `${SITE}/blog` },
  openGraph: {
    title: 'Carnets de voyage | Heldonica',
    description: 'Récits slow travel écrits depuis le terrain — Madère, Portugal, Grèce et plus.',
    url: `${SITE}/blog`,
    siteName: 'Heldonica',
    type: 'website',
  },
}

export const aProposMetadata: Metadata = {
  title: 'Qui sommes-nous — le duo Heldonica | Heldonica',
  description:
    "Le duo Heldonica, couple franco-portugais passionné de slow travel. On a appris à voyager vrai — maintenant on met ça au service du vôtre.",
  alternates: { canonical: `${SITE}/a-propos` },
  openGraph: {
    title: 'Qui sommes-nous | Heldonica',
    description: 'Le duo Heldonica, slow travellers et travel planners. Notre histoire, notre méthode.',
    url: `${SITE}/a-propos`,
    siteName: 'Heldonica',
    type: 'profile',
  },
}

export const contactMetadata: Metadata = {
  title: 'Contact — Heldonica',
  description: 'Une question, un projet de voyage ? Écrivez-nous. On répond sous 48h ouvrées.',
  alternates: { canonical: `${SITE}/contact` },
  openGraph: {
    title: 'Contact | Heldonica',
    description: 'Contactez le duo Heldonica pour votre projet de voyage sur mesure.',
    url: `${SITE}/contact`,
    siteName: 'Heldonica',
    type: 'website',
  },
}

export const slowTravelMetadata: Metadata = {
  title: 'Slow Travel — Notre philosophie | Heldonica',
  description:
    "Le slow travel vu par Heldonica : voyager lentement, s’immerger vraiment, rencontrer les gens — pas juste les monuments. Notre manifeste.",
  alternates: { canonical: `${SITE}/slow-travel` },
  openGraph: {
    title: 'Slow Travel | Heldonica',
    description: "Notre philosophie du voyage : lenteur, authenticité, rencontres. Le slow travel par le duo Heldonica.",
    url: `${SITE}/slow-travel`,
    siteName: 'Heldonica',
    type: 'website',
  },
}

export const destinationsMetadata: Metadata = {
  title: 'Destinations — Heldonica',
  description:
    "Nos destinations coup de cœur : Madère, Portugal, Grèce, Colombie… Chaque lieu sélectionné pour son authenticité et ses pépites hors des sentiers battus.",
  alternates: { canonical: `${SITE}/destinations` },
  openGraph: {
    title: 'Destinations | Heldonica',
    description: 'Madère, Portugal, Grèce, Colombie — nos destinations slow travel sélectionnées terrain.',
    url: `${SITE}/destinations`,
    siteName: 'Heldonica',
    type: 'website',
  },
}

export const temoignagesMetadata: Metadata = {
  title: 'Témoignages — Heldonica',
  description: "Ce que nos voyageurs disent de leur expérience Heldonica. Des voyages sur mesure qui marquent.",
  alternates: { canonical: `${SITE}/temoignages` },
  openGraph: {
    title: 'Témoignages | Heldonica',
    description: 'Avis de voyageurs Heldonica — des voyages sur mesure qui marquent.',
    url: `${SITE}/temoignages`,
    siteName: 'Heldonica',
    type: 'website',
  },
}

export const etudesDeCasMetadata: Metadata = {
  title: 'Études de cas — Heldonica',
  description: "Études de cas Heldonica : comment on a conçu des voyages sur mesure pour des clients avec des envies très différentes.",
  alternates: { canonical: `${SITE}/etudes-de-cas` },
  openGraph: {
    title: 'Études de cas | Heldonica',
    description: 'Nos voyages sur mesure en détail — la méthode, les destinations, les résultats.',
    url: `${SITE}/etudes-de-cas`,
    siteName: 'Heldonica',
    type: 'website',
  },
}
