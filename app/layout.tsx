import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import CookieConsentBanner from '@/components/CookieConsentBanner';

const SITE_URL = 'https://www.heldonica.fr';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Heldonica — Slow Travel & Voyages Authentiques',
    template: '%s — Heldonica',
  },
  description:
    'Blog slow travel et pépites dénichées hors des sentiers battus. Carnets de route, destinations authentiques et travel planning sur mesure écoresponsable en Europe et ailleurs.',
  keywords: [
    // Slow travel — axe principal (volume en hausse +156% en 2025)
    'slow travel',
    'slow travel Europe',
    'slow travel France',
    'itinéraire slow travel',
    'voyage lent',
    // Destinations & découvertes
    'voyage hors sentiers battus',
    'destination authentique',
    'pépites voyage',
    'voyage insolite Europe',
    'que faire Madère',
    'itinéraire Roumanie',
    // Travel planning — axe commercial (intention d\'achat)
    'travel planning sur mesure',
    'voyage sur mesure écoresponsable',
    'itinéraire personnalisé',
    'travel planner francophone',
    // Éco & responsable
    'voyage écoresponsable',
    'tourisme responsable',
    // Brand
    'heldonica',
    'carnet de voyage',
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
    languages: {
      'fr': SITE_URL,
      'fr-FR': SITE_URL,
      'fr-CH': SITE_URL,
      'fr-BE': SITE_URL,
      'fr-CA': SITE_URL,
      'x-default': SITE_URL,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: 'Heldonica',
    title: 'Heldonica — Slow Travel, Pépites & Destinations Authentiques',
    description:
      'Blog slow travel, pépites dénichées hors des sentiers battus et travel planning sur mesure écoresponsable. Carnets de route, itinéraires et découvertes authentiques.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Heldonica — Slow Travel, pépites & destinations authentiques hors des sentiers battus',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Heldonica — Slow Travel, Pépites & Destinations Authentiques',
    description:
      'Blog slow travel, pépites dénichées et travel planning sur mesure écoresponsable. Destinations hors des sentiers battus.',
    images: ['/og-default.jpg'],
    creator: '@heldonica',
  },
};

const schemaWebSite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Heldonica',
  alternateName: 'Heldonica — Slow Travel & Voyages Authentiques',
  url: SITE_URL,
  description: 'Blog slow travel, pépites dénichées hors des sentiers battus et service de travel planning sur mesure écoresponsable. Destinations authentiques en Europe et ailleurs.',
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

const schemaVideo = {
  '@context': 'https://schema.org',
  '@type': 'VideoObject',
  name: 'Heldonica — Slow Travel & Pépites Hors des Sentiers Battus',
  description: 'Blog slow travel entre Paris, Madère et la Roumanie. On ferme les ordis, on part, on revient avec des pépites dénichées hors des sentiers battus.',
  thumbnailUrl: `${SITE_URL}/og-default.jpg`,
  contentUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663470606636/jAd3LynLbumRRtRSgGxysF/Heldonica_11053b9d.mp4',
  uploadDate: '2025-05-01T08:00:00+02:00',
  duration: 'PT0M45S',
  inLanguage: 'fr-FR',
};

const schemaOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${SITE_URL}/#organization`,
  name: 'Heldonica',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Blog slow travel et service de travel planning sur mesure écoresponsable. Pépites dénichées, destinations authentiques, itinéraires hors des sentiers battus.',
  areaServed: [
    { '@type': 'Country', name: 'France' },
    { '@type': 'Country', name: 'Suisse' },
    { '@type': 'Country', name: 'Belgique' },
    { '@type': 'Country', name: 'Canada' },
  ],
  sameAs: [
    'https://www.instagram.com/heldonica',
    'https://www.youtube.com/@heldonica',
    'https://www.facebook.com/heldonica',
    'https://fr.pinterest.com/heldonica',
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaVideo) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaOrganization) }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JDJNTZLBJS"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JDJNTZLBJS');
          `
        }} />
        <Script id="ga-router" strategy="afterInteractive" dangerouslySetInnerHTML={{
          __html: `
            (function() {
              var originalPushState = window.history.pushState;
              window.history.pushState = function() {
                originalPushState.apply(this, arguments);
                window.gtag('event', 'page_view');
              };
              window.addEventListener('popstate', function() {
                window.gtag('event', 'page_view');
              });
            })();
          `
        }} />
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
