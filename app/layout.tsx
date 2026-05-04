import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';
import CookieConsentBanner from '@/components/CookieConsentBanner';

const SITE_URL = 'https://www.heldonica.fr';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Heldonica',
    template: '%s — Heldonica',
  },
  description:
    'Découvrez nos pépites cachées et nos itinéraires hors des sentiers battus. Heldonica conçoit des voyages sur mesure et des expériences authentiques et locales pour tous les explorateurs.',
  keywords: [
    'pépites cachées',
    'expériences authentiques',
    'voyage local',
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
    languages: {
      'fr': SITE_URL,
      'fr-FR': SITE_URL,
      'fr-CH': SITE_URL,
      'fr-BE': SITE_URL,
      'fr-CA': SITE_URL,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: 'Heldonica',
    title: 'Heldonica — Slow Travel, Pépites & Voyages Hors des Sentiers Battus',
    description:
      'Carnets de voyage slow travel, pépites cachées et conception de voyages sur mesure écoresponsables pour des expériences authentiques.',
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
    title: 'Heldonica — Slow Travel, Pépites & Voyages Hors des Sentiers Battus',
    description:
      'Carnets de voyage slow travel, pépites cachées et conception de voyages sur mesure écoresponsables pour des expériences authentiques.',
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
  description: 'Blog slow travel en couple, pépites cachées, expériences authentiques hors des sentiers battus et service de travel planning sur mesure.',
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
  name: 'Heldonica — Slow Travel en Duo',
  description: 'Blog slow travel vec en couple entre Paris, Madere et la Roumanie. On ferme les ordis, on part, on revient.',
  thumbnailUrl: `${SITE_URL}/og-default.jpg`,
  contentUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663470606636/jAd3LynLbumRRtRSgGxysF/Heldonica_11053b9d.mp4',
  uploadDate: '2025-05-01T08:00:00+02:00',
  duration: 'PT0M45S',
  inLanguage: 'fr-FR',
};

const schemaOrganization = {
  '@context': 'https://schema.org',
  '@type': ['TravelAgency', 'Organization'],
  name: 'Heldonica',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'Heldonica conçoit des voyages sur mesure et des expériences authentiques et locales pour tous les explorateurs.',
  sameAs: [
    'https://www.instagram.com/heldonica',
    'https://www.youtube.com/@heldonica',
    'https://www.facebook.com/heldonica',
    'https://fr.pinterest.com/heldonica',
  ],
  areaServed: [
    {
      '@type': 'Country',
      name: 'France'
    },
    {
      '@type': 'Country',
      name: 'Switzerland'
    },
    {
      '@type': 'Country',
      name: 'Belgium'
    },
    {
      '@type': 'Country',
      name: 'Canada'
    }
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
