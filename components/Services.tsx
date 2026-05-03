'use client';

import Link from 'next/link';

export default function Services() {
  return (
    <section className="py-20 md:py-28 bg-cloud-dancer">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-3">Nos services</p>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-mahogany mb-4">
            Deux expertises, une même philosophie
          </h2>
          <p className="text-charcoal/70 max-w-2xl mx-auto">
            Que vous cherchiez à vivre une aventure unique ou à transformer votre établissement, 
            nous apportons la même exigence de qualité et d&apos;authenticité.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* B2C - Travel Planning */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-cloud-dancer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-eucalyptus/10 flex items-center justify-center text-2xl">
                ✈️
              </div>
              <div>
                <span className="text-eucalyptus text-xs font-bold tracking-wider uppercase">Particuliers</span>
                <h3 className="text-xl font-serif font-bold text-mahogany">Travel Planning</h3>
              </div>
            </div>
            <p className="text-charcoal/70 mb-6">
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
                <li key={item} className="flex items-center gap-3 text-sm text-charcoal/70">
                  <span className="w-5 h-5 rounded-full bg-eucalyptus/10 text-eucalyptus flex items-center justify-center text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/travel-planning" className="inline-flex items-center gap-2 text-eucalyptus font-semibold hover:gap-3 transition-all">
              Découvrir le service →
            </Link>
          </div>

          {/* B2B - Consulting */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-cloud-dancer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-mahogany/10 flex items-center justify-center text-2xl">
                🏨
              </div>
              <div>
                <span className="text-mahogany text-xs font-bold tracking-wider uppercase">Professionnels</span>
                <h3 className="text-xl font-serif font-bold text-mahogany">Consulting Hôtelier</h3>
              </div>
            </div>
            <p className="text-charcoal/70 mb-6">
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
                <li key={item} className="flex items-center gap-3 text-sm text-charcoal/70">
                  <span className="w-5 h-5 rounded-full bg-mahogany/10 text-mahogany flex items-center justify-center text-xs">✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/travel-planning" className="inline-flex items-center gap-2 text-mahogany font-semibold hover:gap-3 transition-all">
              Découvrir le service →
            </Link>
          </div>
        </div>

        {/* Note */}
        <p className="text-center text-charcoal/50 text-sm mt-12">
          Une question ? <Link href="/contact" className="text-eucalyptus hover:underline">Contactez-nous</Link>
        </p>
      </div>
    </section>
  );
}
