import type { Metadata } from 'next';
import { getPageZones } from '@/lib/cms-zones';
import { buildPageMetadata } from '@/lib/page-metadata';
import QuizClient from './QuizClient';

export const revalidate = 300;

const metadata: Metadata = {
  title: 'Quiz : Quel voyageur es-tu ? | Heldonica',
  description: '5 questions pour découvrir ton profil travel et recevoir des recommandations personnalisées.',
  alternates: {
    canonical: 'https://www.heldonica.fr/quiz',
  },
  openGraph: {
    title: 'Quiz : Quel voyageur es-tu ? | Heldonica',
    description: '5 questions pour découvrir ton profil travel et recevoir des recommandations personnalisées.',
    url: 'https://www.heldonica.fr/quiz',
    siteName: 'Heldonica',
    type: 'website',
  },
};

export async function generateMetadata(): Promise<Metadata> {
  return buildPageMetadata('quiz', metadata);
}

export default async function QuizPage() {
  const zones = await getPageZones('quiz');
  return <QuizClient initialZones={zones} />;
}
