import type { Metadata } from 'next';
import TravelPlanningClient from './TravelPlanningClient';

export const metadata: Metadata = {
  title: 'Travel Planning Sur Mesure Écoresponsable — Conception de Voyage | Heldonica',
  description:
    'On conçoit ton voyage sur mesure : itinéraire personnalisé, adresses authentiques, rythme slow travel. 100% écoresponsable, pensé pour toi.',
  keywords: [
    'travel planning sur mesure',
    'travel planner francophone',
    'voyage sur mesure écoresponsable',
    'itinéraire personnalisé',
    'conception voyage',
    'voyage hors sentiers battus',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/travel-planning',
  },
};

export default function TravelPlanningPage() {
  return <TravelPlanningClient />;
}
