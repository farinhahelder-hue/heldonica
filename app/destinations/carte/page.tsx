import type { Metadata } from 'next';
import MapClientPage from './MapClientPage';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Carte des Destinations — Explorez nos Pépites | Heldonica',
  description:
    'Carte interactive de nos destinations slow travel : Madère, Sicile, Roumanie, Portugal et plus. Cliquez sur les marqueurs pour découvrir chaque pépite.',
  keywords: [
    'carte destinations',
    'carte interactive',
    'destinations voyage',
    'carte heldonica',
    'slow travel europe',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/destinations/carte',
  },
  openGraph: {
    title: 'Carte des Destinations Slow Travel — Heldonica',
    description:
      'Explorez nos destinations sur une carte interactive : Madère, Sicile, Roumanie, Portugal, et bien plus encore.',
    url: 'https://www.heldonica.fr/destinations/carte',
    siteName: 'Heldonica',
    type: 'website',
    locale: 'fr_FR',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85',
        width: 1200,
        height: 630,
        alt: 'Carte des destinations slow travel Heldonica',
      },
    ],
  },
};

export default function MapPage() {
  return (
    <>
      <nav className="bg-cloud-dancer/80 backdrop-blur-sm border-b border-cloud-dancer py-3 px-4 md:px-6 mt-16">
        <div className="max-w-7xl mx-auto">
          <ol className="flex items-center gap-1.5 text-xs md:text-sm overflow-x-auto no-scrollbar">
            <li className="flex items-center gap-1.5 whitespace-nowrap">
              <Link href="/" className="text-charcoal/40 hover:text-eucalyptus transition-colors">Accueil</Link>
            </li>
            <li className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-charcoal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/destinations" className="text-charcoal/40 hover:text-eucalyptus transition-colors">Destinations</Link>
            </li>
            <li className="flex items-center gap-1.5">
              <svg className="w-3 h-3 text-charcoal/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-charcoal/60 font-medium">Carte</span>
            </li>
          </ol>
        </div>
      </nav>
      <MapClientPage />
    </>
  );
}