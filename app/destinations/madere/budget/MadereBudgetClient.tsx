'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EditableZone from '@/components/inline-edit/EditableZone';

/*
 * Les libelles sont pilotes par le CMS ; les fourchettes de prix et les
 * coefficients restent dans le code. Une valeur aberrante saisie en base
 * fausserait toutes les estimations sans le moindre signal.
 *
 * Le texte d'origine avait perdu ses accents (Duree, Madere, Parametres) :
 * les fallbacks ci-dessous les retablissent, comme les valeurs semees en base.
 */

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

export default function MadereBudgetClient() {
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
              <EditableZone page="destinations-madere-budget" zone="hero_badge" fallback="Madère — Budget" />
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-mahogany mb-6">
              <EditableZone page="destinations-madere-budget" zone="hero_title" fallback="Calculateur budget Madère" />
            </h1>
            <p className="text-charcoal/80 text-lg max-w-3xl leading-relaxed">
              <EditableZone
                page="destinations-madere-budget"
                zone="hero_text"
                type="textarea"
                fallback="Point de départ fiable pour cadrer ton voyage. Référence Heldonica : 1 400–1 800 € pour 7 jours en duo, style équilibré."
              />
            </p>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container grid lg:grid-cols-[1fr_420px] gap-8 items-start">
            <article className="rounded-2xl border border-stone-200 p-6 md:p-8">
              <h2 className="text-2xl font-serif text-mahogany mb-6">
                <EditableZone page="destinations-madere-budget" zone="form_title" fallback="Paramètres du voyage" />
              </h2>

              <label className="block text-sm font-medium text-charcoal mb-3">
                <EditableZone page="destinations-madere-budget" zone="label_duration" fallback="Durée" />
                {' : '}
                {days}{' '}
                <EditableZone page="destinations-madere-budget" zone="label_days" fallback="jours" />
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
                <EditableZone page="destinations-madere-budget" zone="label_comfort" fallback="Niveau de confort" />
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
                  <EditableZone page="destinations-madere-budget" zone="style_1" fallback="Équilibré" />
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
                  <EditableZone page="destinations-madere-budget" zone="style_2" fallback="Confort" />
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
                  <EditableZone page="destinations-madere-budget" zone="style_3" fallback="Signature" />
                </button>
              </div>

              <label className="block text-sm font-medium text-charcoal mb-2">
                <EditableZone page="destinations-madere-budget" zone="label_season" fallback="Saison" />
              </label>
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
                  <EditableZone page="destinations-madere-budget" zone="season_1" fallback="Basse / intermédiaire" />
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
                  <EditableZone page="destinations-madere-budget" zone="season_2" fallback="Haute saison" />
                </button>
              </div>

              <label className="inline-flex items-center gap-3 text-sm text-charcoal">
                <input
                  type="checkbox"
                  checked={withCar}
                  onChange={(event) => setWithCar(event.target.checked)}
                />
                <EditableZone page="destinations-madere-budget" zone="label_car" fallback="Inclure la location de voiture" />
              </label>
            </article>

            <aside className="rounded-2xl border border-stone-200 p-6 md:p-7 bg-cloud-dancer sticky top-24">
              <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">
                <EditableZone page="destinations-madere-budget" zone="estimate_kicker" fallback="Estimation duo" />
              </p>
              <p className="text-4xl font-serif text-mahogany mb-3">
                {estimate.min} – {estimate.max} €
              </p>
              <p className="text-sm text-charcoal/75 leading-relaxed mb-5">
                <EditableZone
                  page="destinations-madere-budget"
                  zone="estimate_note"
                  type="textarea"
                  fallback="Fourchette indicative hors achats personnels. On affine ensuite selon tes priorités réelles."
                />
              </p>
              <div className="space-y-2 text-sm text-charcoal/80 mb-6">
                <p><EditableZone page="destinations-madere-budget" zone="included_1" fallback="— Vols A/R inclus" /></p>
                <p><EditableZone page="destinations-madere-budget" zone="included_2" fallback="— Hébergement + repas + activités" /></p>
                <p><EditableZone page="destinations-madere-budget" zone="included_3" fallback="— Ajustement automatique selon la saison" /></p>
                <p><EditableZone page="destinations-madere-budget" zone="included_4" fallback="— Voiture intégrée si activée" /></p>
              </div>
              <Link
                href="/travel-planning-form?destination=madere"
                className="inline-flex w-full justify-center rounded-lg bg-mahogany px-5 py-2.5 text-white font-semibold hover:bg-mahogany/90 transition-colors"
              >
                <EditableZone page="destinations-madere-budget" zone="cta_label" fallback="Construire mon carnet Madère" />
              </Link>
            </aside>
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container max-w-4xl grid md:grid-cols-2 gap-5">
            <article className="rounded-2xl border border-stone-200 p-6 bg-white">
              <h2 className="text-xl font-serif text-mahogany mb-3">
                <EditableZone page="destinations-madere-budget" zone="card_1_title" fallback="Référence rapide" />
              </h2>
              <p className="text-charcoal/80 text-sm leading-relaxed">
                <EditableZone
                  page="destinations-madere-budget"
                  zone="card_1_text"
                  type="textarea"
                  fallback="7 jours, style équilibré, saison intermédiaire, voiture incluse : généralement 1 400–1 800 €."
                />
              </p>
            </article>
            <article className="rounded-2xl border border-stone-200 p-6 bg-white">
              <h2 className="text-xl font-serif text-mahogany mb-3">
                <EditableZone page="destinations-madere-budget" zone="card_2_title" fallback="Conseil de pilotage" />
              </h2>
              <p className="text-charcoal/80 text-sm leading-relaxed">
                <EditableZone
                  page="destinations-madere-budget"
                  zone="card_2_text"
                  type="textarea"
                  fallback="Garde 10 à 15 % de marge pour la météo et les occasions locales. Cette marge préserve la qualité de l'expérience."
                />
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
