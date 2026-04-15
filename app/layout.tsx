import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import CookieConsentBanner from '@/components/CookieConsentBanner';

const SITE_URL = 'https://heldonica.fr';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Heldonica | Slow Travel, Pépites & Voyages Hors des Sentiers Battus',
    template: '%s | Heldonica',
  },
  description:
    'Slow travel, pépites dénichées et voyages sur mesure hors des sentiers battus. On partage nos carnets de route et conçoit des itinéraires authentiques pour tous les explorateurs.',
  keywords: [
    'slow travel',
    'voyage hors sentiers battus',
    'pépites voyage',
    'écoresponsable',
    'travel planning sur mesure',
    'carnet de voyage',
    'slow travel Europe',
    'itinéraire slow travel',
    'heldonica',
  ],
  authors: [{ name: 'Heldonica', url: SITE_URL }],
  creator: 'Heldonica',
  publisher: 'Heldonica',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: 'Heldonica',
    title: 'Heldonica | Slow Travel, Pépites & Voyages Hors des Sentiers Battus',
    description:
      'Carnets de voyage slow travel, pépites dénichées et conception de voyages sur mesure écoresponsables.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Heldonica — Slow Travel, pépites & voyages hors des sentiers battus',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Heldonica | Slow Travel, Pépites & Voyages Hors des Sentiers Battus',
    description:
      'Carnets de voyage slow travel, pépites dénichées et conception de voyages sur mesure écoresponsables.',
    images: ['/og-default.jpg'],
    creator: '@heldonica',
  },
};

const schemaWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Heldonica',
  alternateName: 'Heldonica — Slow Travel en Couple',
  url: SITE_URL,
  description: 'Blog slow travel en couple, pépites dénichées et service de travel planning sur mesure écoresponsable.',
  inLanguage: 'fr-FR',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/blog?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const schemaOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Heldonica',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  sameAs: [
    'https://www.instagram.com/heldonica',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'contact@heldonica.fr',
    availableLanguage: 'French',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebSite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }}
        />
      </head>
      <body>
        <AuthProvider>
          {children}
          <CookieConsentBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
