import type { Metadata } from 'next';
import { getPageZones } from '@/lib/cms-zones';
import { buildPageMetadata } from '@/lib/page-metadata';
import TravelPlanningFormClient from './TravelPlanningFormClient';

export const revalidate = 86400;

const metadata: Metadata = {
  title: 'Demande de Travel Planning sur mesure | Heldonica',
  description: 'Remplis notre formulaire pour concevoir ton voyage slow travel sur mesure. Sans engagement, réponse sous 48h.',
  alternates: {
    canonical: 'https://www.heldonica.fr/travel-planning-form',
  },
  openGraph: {
    title: 'Demande de Travel Planning sur mesure | Heldonica',
    description: 'Remplis notre formulaire pour concevoir ton voyage slow travel sur mesure. Sans engagement, réponse sous 48h.',
    url: 'https://www.heldonica.fr/travel-planning-form',
    siteName: 'Heldonica',
    type: 'website',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('travel-planning-form', metadata);
}

export default async function TravelPlanningForm() {
  const zones = await getPageZones('travel-planning-form');
  return <TravelPlanningFormClient initialZones={zones} />;
}
