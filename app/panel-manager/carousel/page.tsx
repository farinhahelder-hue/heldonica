'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

/**
 * Route de l'éditeur de carrousels.
 *
 * Le dossier contenait huit composants — éditeur, aperçu, pellicule, export,
 * panneau IA — soit plus de 1 500 lignes, mais aucune page pour les monter :
 * l'outil était injoignable et donc inutilisable. Cette page l'expose.
 *
 * Chargement côté client uniquement : l'éditeur manipule des refs DOM et
 * html-to-image pour l'export, qui n'ont pas d'équivalent au rendu serveur.
 */
const CarouselEditorV2 = dynamic(() => import('./CarouselEditorV2'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center min-h-[60vh]">
      <p className="text-stone-500 text-sm">Chargement de l&apos;éditeur…</p>
    </div>
  ),
});

export default function CarouselPage() {
  return (
    <div className="min-h-screen bg-cloud-dancer">
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-serif font-semibold text-mahogany">
            Carrousels Instagram
          </h1>
          <p className="text-sm text-charcoal/60 mt-1">
            Compose tes diapositives et illustre-les avec les photos du voyage.
          </p>
        </header>

        <Suspense fallback={null}>
          <CarouselEditorV2 />
        </Suspense>
      </div>
    </div>
  );
}
