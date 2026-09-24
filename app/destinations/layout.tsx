import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Destinations Slow Travel — Voyages Hors des Sentiers Battus',
  description: 'Explorez nos destinations slow travel : Madère, Zurich, Portugal, Alpes... Des itinéraires authentiques pour voyager en couple hors des sentiers battus, testés sur le terrain.',
  keywords: ['destinations slow travel', 'voyages hors sentiers battus', 'voyage en couple', 'madère', 'zurich', 'portugal', 'itinéraire authentique', 'heldonica'],
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations',
  },
  openGraph: {
    title: 'Destinations Slow Travel |',
    description: 'Nos destinations slow travel testées sur le terrain : pépites cachées, hébergements authentiques, tables de locaux. Voyager autrement en couple.',
    url: 'https://www.heldonica.fr/destinations',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: 'https://www.heldonica.fr/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Destinations slow travel Heldonica — Madère, Roumanie, Sicile',
      },
    ],
  },
};

export default function DestinationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
