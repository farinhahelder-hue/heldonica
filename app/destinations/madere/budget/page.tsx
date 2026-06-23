import type { Metadata } from 'next';
import MadereBudgetClient from './MadereBudgetClient';

export function generateMetadata(): Metadata {
  return {
    title: "Calculateur budget Madere en couple : slow travel & pépites cachées | Heldonica",
    description: "Point de depart fiable pour cadrer ton voyage. Reference heldonica: 1400-1800 EUR pour 7 jours en duo, style equilibre.",
    openGraph: {
      type: "website",
      images: ["https://heldonica.fr/images/default-hero.jpg"],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: {
      card: "summary_large_image"
    },
    alternates: {
      canonical: 'https://www.heldonica.fr/destinations/madere/budget'
    },
  robots: { index: false, follow: false },
  };
}

export default function MadereBudgetPage() {
  return <MadereBudgetClient />;
}
