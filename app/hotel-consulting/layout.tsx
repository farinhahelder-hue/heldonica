import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consulting hôtelier indépendant | Regard terrain & leviers concrets | Heldonica',
  description:
    "On connaît vos clients parce qu'on en fait partie. Regard terrain, visibilité locale, parcours client et IA utile pour hôtels indépendants.",
  keywords: [
    'consulting hôtelier',
    'hôtel indépendant',
    'expérience client hôtel',
    'seo local hôtel',
    'outils IA hôtel',
    'heldonica',
  ],
  alternates: {
    canonical: 'https://heldonica.fr/hotel-consulting',
  },
  openGraph: {
    title: 'Consulting hôtelier indépendant — Regard terrain & leviers concrets',
    description:
      "On arrive, on regarde ce qui se passe vraiment, puis on travaille avec vous sur ce qui tient sur le terrain.",
    url: 'https://heldonica.fr/hotel-consulting',
    siteName: 'Heldonica',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=85',
        width: 1200,
        height: 630,
        alt: 'Consulting hôtelier indépendant Heldonica',
      },
    ],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consulting hôtelier indépendant | Heldonica',
    description:
      "Regard terrain, parcours client, visibilité locale et outils IA utiles pour hôtels indépendants.",
    images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=85'],
  },
};

export default function HotelConsultingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
