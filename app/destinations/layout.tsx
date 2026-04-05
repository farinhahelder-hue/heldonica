import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Destinations Slow Travel | Voyages Hors des Sentiers Battus | Heldonica',
  description: 'Explorez nos destinations slow travel : Madère, Zurich, Portugal, Alpes... Des itinéraires authentiques pour voyager en couple hors des sentiers battus, testés sur le terrain.',
  keywords: ['destinations slow travel', 'voyages hors sentiers battus', 'voyage en couple', 'madère', 'zurich', 'portugal', 'itinéraire authentique', 'heldonica'],
  alternates: {
    canonical: 'https://heldonica.fr/destinations',
  },
  openGraph: {
    title: 'Destinations Slow Travel — Pépites Dénichées par Heldonica',
    description: 'Nos destinations slow travel testées sur le terrain : pépites cachées, hébergements authentiques, tables de locaux. Voyager autrement en couple.',
    url: 'https://heldonica.fr/destinations',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
  },
};

export default function DestinationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
