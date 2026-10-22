import type { Metadata } from 'next';
import { getPageZones } from '@/lib/cms-zones';
import { buildPageMetadata } from '@/lib/page-metadata';
import MerciClient from './MerciClient';

export const revalidate = 300;

const metadata: Metadata = {
  title: 'Merci pour votre demande | Heldonica',
  description: 'On a bien reçu ton projet. On revient vers toi sous 48h pour un vrai échange slow travel.',
  robots: { index: false, follow: true },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('merci', metadata);
}

export default async function MerciPage() {
  const zones = await getPageZones('merci');
  return <MerciClient initialZones={zones} />;
}
