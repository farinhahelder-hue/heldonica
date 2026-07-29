import type { Metadata } from 'next';
import MadereBudgetClient from './MadereBudgetClient';

export function generateMetadata(): Metadata {
  return {
    title: "Calculateur budget Madère en couple : slow travel & pépites cachées | Heldonica",
    description: "Cadre ton budget avant de partir. Référence Heldonica : 1 400–1 800 € pour 7 jours en duo, style équilibré.",
    openGraph: {
      title: "Calculateur budget Madère | Heldonica",
      description: "Référence Heldonica : 1 400–1 800 € pour 7 jours en duo, style équilibré.",
      url: "https://www.heldonica.fr/destinations/madere/budget",
      type: "website",
      images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Budget Madère slow travel — Heldonica" }],
      locale: "fr_FR",
      siteName: "Heldonica"
    },
    twitter: {
      card: "summary_large_image",
      title: "Calculateur budget Madère | Heldonica",
      description: "Référence Heldonica : 1 400–1 800 € pour 7 jours en duo, style équilibré.",
      images: ["/og-default.jpg"],
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
