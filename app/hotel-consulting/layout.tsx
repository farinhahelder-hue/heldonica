import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Consulting Hôtelier Indépendant | Revenue Management & SEO Local | Heldonica',
  description: 'Consulting hôtelier sur mesure : Revenue Management, optimisation du RevPAR, SEO local et expérience client. Expertise terrain pour hôtels indépendants et boutique-hôtels.',
  keywords: ['consulting hôtelier', 'revenue management', 'revpar', 'seo local hôtel', 'expérience client hôtel', 'hôtel indépendant', 'heldonica'],
  alternates: {
    canonical: 'https://heldonica.fr/hotel-consulting',
  },
  openGraph: {
    title: 'Consulting Hôtelier Indépendant — Revenue Management & SEO Local',
    description: 'Optimisez le RevPAR, la visibilité en ligne et l'expérience client de votre établissement. Consultant hôtelier indépendant, expertise terrain.',
    url: 'https://heldonica.fr/hotel-consulting',
    siteName: 'Heldonica',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=85',
        width: 1200,
        height: 630,
        alt: 'Consulting hôtelier indépendant Heldonica — Revenue Management',
      },
    ],
    type: 'website',
    locale: 'fr_FR',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Consulting Hôtelier Indépendant | Heldonica',
    description: 'Revenue Management, SEO local et expérience client pour hôtels indépendants.',
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
