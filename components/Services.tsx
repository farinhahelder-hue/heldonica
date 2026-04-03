'use client';

import Link from 'next/link';

export default function Services() {
  return (
    <section className="py-20 md:py-28 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-3">Nos services</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 mb-4">
            Deux expertises, une même philosophie
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Que vous cherchiez à vivre une aventure unique ou à transformer votre établissement, 
            nous apportons la même exigence de qualité et d&apos;authenticité.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* B2C - Travel Planning */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-amber-100 flex items-center justify-center text-2xl">
                ✈️
              </div>
              <div>
                <span className="text-amber-800 text-xs font-bold tracking-wider uppercase">Particuliers</span>
                <h3 className="text-xl font-serif font-bold text-stone-900">Travel Planning</h3>
              </div>
            </div>
            <p className="text-stone-600 mb-6">
              Des itinéraires sur mesure pour les couples qui veulent voyager lentement, 
              hors des sentiers battus, avec des adresses testées et approuvées.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Itinéraires personnalisés',
                'Hébergements éco-authentiques',
                'Carnet de voyage complet',
                'Conseils personnalisés',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-stone-600">
                  <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/travel-planning" className="inline-flex items-center gap-2 text-amber-800 font-semibold hover:gap-3 transition-all">
              Découvrir le service →
            </Link>
          </div>

          {/* B2B - Consulting */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-sky-100 flex items-center justify-center text-2xl">
                🏨
              </div>
              <div>
                <span className="text-sky-800 text-xs font-bold tracking-wider uppercase">Professionnels</span>
                <h3 className="text-xl font-serif font-bold text-stone-900">Consulting Hôtelier</h3>
              </div>
            </div>
            <p className="text-stone-600 mb-6">
              Accompagnement pour les établissements indépendants qui veulent optimiser 
              leurs revenus, améliorer l&apos;expérience client et se différencier.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                'Revenue Management',
                'Stratégie digitale',
                'Formation équipes',
                'Audit & optimisation',
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-stone-600">
                  <span className="w-5 h-5 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/hotel-consulting" className="inline-flex items-center gap-2 text-sky-700 font-semibold hover:gap-3 transition-all">
              Découvrir le service →
            </Link>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-stone-500 text-sm mt-12">
          Une question ? <Link href="/contact" className="text-amber-800 hover:underline">Contactez-nous</Link>
        </p>
      </div>
    </section>
  );
}
