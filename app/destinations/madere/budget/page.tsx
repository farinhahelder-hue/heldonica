'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type StyleKey = 'equilibre' | 'confort' | 'signature';
type SeasonKey = 'basse' | 'haute';

const styleRanges: Record<StyleKey, { min: number; max: number }> = {
  equilibre: { min: 120, max: 150 },
  confort: { min: 170, max: 220 },
  signature: { min: 240, max: 320 },
};

const seasonMultiplier: Record<SeasonKey, number> = {
  basse: 1,
  haute: 1.2,
};

export default function MadereBudgetPage() {
  const [days, setDays] = useState(7);
  const [style, setStyle] = useState<StyleKey>('equilibre');
  const [season, setSeason] = useState<SeasonKey>('basse');
  const [withCar, setWithCar] = useState(true);

  const estimate = useMemo(() => {
    const base = styleRanges[style];
    const multiplier = seasonMultiplier[season];
    const flightsMin = 520;
    const flightsMax = 760;
    const carMin = withCar ? 45 * days : 0;
    const carMax = withCar ? 70 * days : 0;

    const min = Math.round(base.min * days * multiplier + flightsMin + carMin);
    const max = Math.round(base.max * days * multiplier + flightsMax + carMax);

    return { min, max };
  }, [days, season, style, withCar]);

  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-28">
          <div className="container">
            <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-4">
              Madere - Budget
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              Calculateur budget Madere
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              Point de depart fiable pour cadrer ton voyage. Reference heldonica:
              1400-1800 EUR pour 7 jours en duo, style equilibre.
            </p>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container grid lg:grid-cols-[1fr_420px] gap-8 items-start">
            <article className="rounded-2xl border border-stone-200 p-6 md:p-8">
              <h2 className="text-2xl font-serif text-mahogany mb-6">Parametres du voyage</h2>

              <label className="block text-sm font-medium text-charcoal mb-3">
                Duree: {days} jours
              </label>
              <input
                type="range"
                min={4}
                max={14}
                value={days}
                onChange={(event) => setDays(Number(event.target.value))}
                className="w-full mb-6"
              />

              <label className="block text-sm font-medium text-charcoal mb-2">
                Niveau de confort
              </label>
              <div className="grid sm:grid-cols-3 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setStyle('equilibre')}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    style === 'equilibre'
                      ? 'border-eucalyptus bg-eucalyptus/10 text-eucalyptus'
                      : 'border-stone-300'
                  }`}
                >
                  Equilibre
                </button>
                <button
                  type="button"
                  onClick={() => setStyle('confort')}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    style === 'confort'
                      ? 'border-eucalyptus bg-eucalyptus/10 text-eucalyptus'
                      : 'border-stone-300'
                  }`}
                >
                  Confort
                </button>
                <button
                  type="button"
                  onClick={() => setStyle('signature')}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    style === 'signature'
                      ? 'border-eucalyptus bg-eucalyptus/10 text-eucalyptus'
                      : 'border-stone-300'
                  }`}
                >
                  Signature
                </button>
              </div>

              <label className="block text-sm font-medium text-charcoal mb-2">Saison</label>
              <div className="grid sm:grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setSeason('basse')}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    season === 'basse'
                      ? 'border-eucalyptus bg-eucalyptus/10 text-eucalyptus'
                      : 'border-stone-300'
                  }`}
                >
                  Basse / intermediaire
                </button>
                <button
                  type="button"
                  onClick={() => setSeason('haute')}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    season === 'haute'
                      ? 'border-eucalyptus bg-eucalyptus/10 text-eucalyptus'
                      : 'border-stone-300'
                  }`}
                >
                  Haute saison
                </button>
              </div>

              <label className="inline-flex items-center gap-3 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={withCar}
                  onChange={(event) => setWithCar(event.target.checked)}
                />
                Inclure location voiture
              </label>
            </article>

            <aside className="rounded-2xl border border-stone-200 p-6 md:p-7 bg-cloud-dancer sticky top-24">
              <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">
                Estimation duo
              </p>
              <p className="text-4xl font-serif text-mahogany mb-3">
                {estimate.min} - {estimate.max} EUR
              </p>
              <p className="text-sm text-charcoal/75 leading-relaxed mb-5">
                Fourchette indicative hors achats personnels. On affine ensuite selon tes
                priorites reelles.
              </p>
              <div className="space-y-2 text-sm text-charcoal/80 mb-6">
                <p>- Vols A/R inclus</p>
                <p>- Hebergement + repas + activites</p>
                <p>- Ajustement automatique selon saison</p>
                <p>- Voiture integree si activee</p>
              </div>
              <Link
                href="/travel-planning-form?destination=madere"
                className="inline-flex w-full justify-center rounded-lg bg-mahogany px-5 py-2.5 text-white font-semibold hover:bg-mahogany/90 transition-colors"
              >
                Construire mon carnet Madere
              </Link>
            </aside>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl grid md:grid-cols-2 gap-5">
            <article className="rounded-2xl border border-stone-200 p-6 bg-white">
              <h2 className="text-xl font-serif text-mahogany mb-3">Reference rapide</h2>
              <p className="text-charcoal/80 text-sm leading-relaxed">
                7 jours, style equilibre, saison intermediaire, voiture incluse:
                generalement 1400-1800 EUR.
              </p>
            </article>
            <article className="rounded-2xl border border-stone-200 p-6 bg-white">
              <h2 className="text-xl font-serif text-mahogany mb-3">Conseil pilotage</h2>
              <p className="text-charcoal/80 text-sm leading-relaxed">
                Garde 10-15% de marge pour meteo et opportunites locales. C est ce qui
                preserve la qualite d experience.
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
