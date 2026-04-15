'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

type ProfileKey =
  | 'explorateur_sensoriel'
  | 'contemplatif_alpin'
  | 'mediterraneen_gourmand'
  | 'curieux_patrimoine';

type Option = {
  label: string;
  scores: Record<ProfileKey, number>;
};

type Question = {
  title: string;
  options: Option[];
};

const profileMeta: Record<
  ProfileKey,
  {
    title: string;
    subtitle: string;
    recommendation: string;
    primaryHref: string;
    planningHref: string;
  }
> = {
  explorateur_sensoriel: {
    title: 'Profil: Explorateur Sensoriel',
    subtitle: 'Tu voyages pour ressentir le lieu avant de le consommer.',
    recommendation: 'Destination recommandee: Madere',
    primaryHref: '/destinations/madere',
    planningHref: '/travel-planning-form?destination=madere',
  },
  contemplatif_alpin: {
    title: 'Profil: Contemplatif Alpin',
    subtitle: 'Tu privilegies les paysages ouverts, le silence et le rythme lent.',
    recommendation: 'Destination recommandee: Suisse',
    primaryHref: '/destinations/suisse',
    planningHref: '/travel-planning-form?destination=suisse',
  },
  mediterraneen_gourmand: {
    title: 'Profil: Mediterraneen Gourmand',
    subtitle: 'Ton voyage ideal melange soleil, table locale et belles matieres.',
    recommendation: 'Destination recommandee: Sicile (sur mesure)',
    primaryHref: '/travel-planning-form?destination=sicile',
    planningHref: '/travel-planning-form?destination=sicile',
  },
  curieux_patrimoine: {
    title: 'Profil: Curieux Patrimoine',
    subtitle: 'Tu aimes les lieux avec une epaisseur historique et culturelle forte.',
    recommendation: 'Destination recommandee: Roumanie',
    primaryHref: '/destinations/roumanie',
    planningHref: '/travel-planning-form?destination=roumanie',
  },
};

const questions: Question[] = [
  {
    title: 'Ton rythme ideal sur place ?',
    options: [
      {
        label: 'Une base lente, peu de deplacements',
        scores: { explorateur_sensoriel: 2, contemplatif_alpin: 2, mediterraneen_gourmand: 1, curieux_patrimoine: 1 },
      },
      {
        label: 'Alterner exploration et pauses',
        scores: { explorateur_sensoriel: 1, contemplatif_alpin: 1, mediterraneen_gourmand: 2, curieux_patrimoine: 2 },
      },
      {
        label: 'Changer souvent d ambiance',
        scores: { explorateur_sensoriel: 0, contemplatif_alpin: 0, mediterraneen_gourmand: 2, curieux_patrimoine: 3 },
      },
    ],
  },
  {
    title: 'Ce qui te marque le plus en voyage ?',
    options: [
      {
        label: 'Nature, lumiere, reliefs',
        scores: { explorateur_sensoriel: 3, contemplatif_alpin: 3, mediterraneen_gourmand: 0, curieux_patrimoine: 1 },
      },
      {
        label: 'Cuisine, marche, artisans',
        scores: { explorateur_sensoriel: 1, contemplatif_alpin: 0, mediterraneen_gourmand: 3, curieux_patrimoine: 1 },
      },
      {
        label: 'Architecture, histoire, culture locale',
        scores: { explorateur_sensoriel: 1, contemplatif_alpin: 1, mediterraneen_gourmand: 1, curieux_patrimoine: 3 },
      },
    ],
  },
  {
    title: 'Ta matinee parfaite ?',
    options: [
      {
        label: 'Rando douce puis point de vue',
        scores: { explorateur_sensoriel: 3, contemplatif_alpin: 2, mediterraneen_gourmand: 0, curieux_patrimoine: 1 },
      },
      {
        label: 'Cafe local puis balade urbaine',
        scores: { explorateur_sensoriel: 1, contemplatif_alpin: 1, mediterraneen_gourmand: 2, curieux_patrimoine: 2 },
      },
      {
        label: 'Visite d un lieu patrimonial',
        scores: { explorateur_sensoriel: 0, contemplatif_alpin: 1, mediterraneen_gourmand: 1, curieux_patrimoine: 3 },
      },
    ],
  },
  {
    title: 'Ton niveau de confort attendu ?',
    options: [
      {
        label: 'Simple mais tres authentique',
        scores: { explorateur_sensoriel: 2, contemplatif_alpin: 2, mediterraneen_gourmand: 1, curieux_patrimoine: 1 },
      },
      {
        label: 'Confort boutique hotel',
        scores: { explorateur_sensoriel: 1, contemplatif_alpin: 1, mediterraneen_gourmand: 3, curieux_patrimoine: 1 },
      },
      {
        label: 'Confort variable selon le contexte',
        scores: { explorateur_sensoriel: 1, contemplatif_alpin: 1, mediterraneen_gourmand: 1, curieux_patrimoine: 2 },
      },
    ],
  },
  {
    title: 'Quel souvenir veux-tu rapporter ?',
    options: [
      {
        label: 'Des sensations et des paysages',
        scores: { explorateur_sensoriel: 3, contemplatif_alpin: 2, mediterraneen_gourmand: 0, curieux_patrimoine: 1 },
      },
      {
        label: 'Des saveurs et de belles adresses',
        scores: { explorateur_sensoriel: 1, contemplatif_alpin: 0, mediterraneen_gourmand: 3, curieux_patrimoine: 1 },
      },
      {
        label: 'Des recits et une culture vivante',
        scores: { explorateur_sensoriel: 0, contemplatif_alpin: 1, mediterraneen_gourmand: 1, curieux_patrimoine: 3 },
      },
    ],
  },
];

const profileOrder: ProfileKey[] = [
  'explorateur_sensoriel',
  'contemplatif_alpin',
  'mediterraneen_gourmand',
  'curieux_patrimoine',
];

export default function SlowTravelQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Option[]>([]);

  const result = useMemo(() => {
    if (answers.length !== questions.length) {
      return null;
    }

    const scores: Record<ProfileKey, number> = {
      explorateur_sensoriel: 0,
      contemplatif_alpin: 0,
      mediterraneen_gourmand: 0,
      curieux_patrimoine: 0,
    };

    for (const answer of answers) {
      for (const profile of profileOrder) {
        scores[profile] += answer.scores[profile];
      }
    }

    return profileOrder.reduce((best, profile) =>
      scores[profile] > scores[best] ? profile : best
    );
  }, [answers]);

  const handleAnswer = (option: Option) => {
    const nextAnswers = [...answers, option];
    setAnswers(nextAnswers);
    setCurrentQuestion((value) => value + 1);
  };

  const restart = () => {
    setAnswers([]);
    setCurrentQuestion(0);
  };

  const progress = Math.round((answers.length / questions.length) * 100);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 md:p-8 shadow-sm">
      <p className="text-xs uppercase tracking-[0.16em] text-eucalyptus font-semibold mb-3">
        Quiz slow travel
      </p>
      <h3 className="text-2xl font-serif text-mahogany mb-2">
        Quel slow traveler es-tu ?
      </h3>
      <p className="text-sm text-charcoal/75 mb-6">
        5 questions rapides pour identifier ta destination la plus naturelle.
      </p>

      {!result ? (
        <>
          <div className="mb-4">
            <div className="flex justify-between text-xs text-charcoal/60 mb-2">
              <span>
                Question {Math.min(currentQuestion + 1, questions.length)} / {questions.length}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
              <div
                className="h-full bg-eucalyptus transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <p className="font-semibold text-charcoal mb-4">
            {questions[currentQuestion].title}
          </p>
          <div className="space-y-3">
            {questions[currentQuestion].options.map((option) => (
              <button
                type="button"
                key={option.label}
                onClick={() => handleAnswer(option)}
                className="w-full text-left rounded-xl border border-stone-200 px-4 py-3 hover:border-eucalyptus hover:bg-cloud-dancer/60 transition-colors"
              >
                {option.label}
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-xl border border-teal/50 bg-cloud-dancer p-5 md:p-6">
          <p className="text-xs uppercase tracking-[0.16em] text-eucalyptus font-semibold mb-2">
            Ton resultat
          </p>
          <h4 className="text-xl font-serif text-mahogany mb-2">
            {profileMeta[result].title}
          </h4>
          <p className="text-charcoal/80 mb-3">{profileMeta[result].subtitle}</p>
          <p className="font-semibold text-eucalyptus mb-5">
            {profileMeta[result].recommendation}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={profileMeta[result].primaryHref}
              className="px-5 py-2.5 rounded-lg bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors"
            >
              Voir la destination
            </Link>
            <Link
              href={profileMeta[result].planningHref}
              className="px-5 py-2.5 rounded-lg border border-eucalyptus text-eucalyptus font-semibold hover:bg-eucalyptus/10 transition-colors"
            >
              Demarrer mon projet
            </Link>
            <button
              type="button"
              onClick={restart}
              className="px-5 py-2.5 rounded-lg border border-stone-300 text-charcoal/80 hover:bg-white transition-colors"
            >
              Refaire le quiz
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
