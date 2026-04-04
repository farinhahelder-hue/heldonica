import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://heldonica.fr';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Heldonica — Slow Travel en couple',
    template: '%s | Heldonica',
  },
  description:
    'Carnets de voyage slow travel en couple, pépites dénichées hors sentiers battus et conception de voyages sur mesure écoresponsables. Bienvenue dans notre histoire.',
  keywords: [
    'slow travel',
    'voyage en couple',
    'hors sentiers battus',
    'écoresponsable',
    'travel planning',
    'carnet de voyage',
    'heldonica',
  ],
  authors: [{ name: 'Heldonica', url: SITE_URL }],
  creator: 'Heldonica',
  publisher: 'Heldonica',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: 'Heldonica',
    title: 'Heldonica — Slow Travel en couple',
    description:
      'Carnets de voyage slow travel, pépites dénichées et conception de voyages sur mesure écoresponsables.',
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Heldonica — Slow Travel en couple',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Heldonica — Slow Travel en couple',
    description:
      'Carnets de voyage slow travel, pépites dénichées et conception de voyages sur mesure écoresponsables.',
    images: ['/og-default.jpg'],
    creator: '@heldonica',
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
      </head>
      <body>{children}</body>
    </html>
  );
}
