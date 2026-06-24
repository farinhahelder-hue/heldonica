import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import B2bCtaButton from '@/components/B2bCtaButton';

const SITE_URL = 'https://heldonica.fr';

// DRAFT — not linked from nav or sitemap
export const metadata: Metadata = {
  title: 'Consulting Hôtelier SEO & Revenue Management | Heldonica',
  description: '+23% RevPAR, +22 pts réservation directe. Audit gratuit pour établissements indépendants. Revenue Management, SEO local, expérience client couple.',
  keywords: ['consulting hôtelier', 'revenue management', 'SEO local hôtel', 'expérience client couple', 'audit hôtelier gratuit', 'conseil hôtellerie'],
  robots: { index: false, follow: false },
  alternates: { canonical: `${SITE_URL}/expert-hotelier` },
  openGraph: {
    title: 'Consulting Hôtelier SEO & Revenue Management | Heldonica',
    description: '+23% RevPAR, +22 pts réservation directe. Audit gratuit pour établissements indépendants.',
    url: `${SITE_URL}/expert-hotelier`,
    images: [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80', width: 1200, height: 630, alt: 'Consulting hôtelier Heldonica' }],
    locale: 'fr_FR', type: 'website',
  },
};

const services = [
  {
    title: 'Revenue Management',
    subtitle: 'Optimisation tarifs et mix OTA/direct',
    icon: '📈',
    problem: 'Tarifs sous-optimisés, dépendance Booking.com (30%+ commission), remplissage irrégulier',
    solution: 'Yield management dynamique, analyse des élasticités prix par segment, stratégie channel mix pour maximiser la réservation directe',
    results: 'Jusqu\'à +23% de RevPAR en 6 mois, +22 pts de réservation directe',
  },
  {
    title: 'SEO Local & Visibilité',
    subtitle: 'Google Business Profile, E-E-A-T, rich snippets',
    icon: '🔍',
    problem: 'Visible uniquement sur Booking/OTA, pas dans Google local pack, avis non optimisés',
    solution: 'Audit complet Google Business Profile, stratégie de contenu E-E-A-T locale, implémentation rich snippets, maillage de citations locales',
    results: '+340% de visibilité Google Maps, 3× plus de clics sur GPS en 4 mois',
  },
  {
    title: 'Expérience Client Couple',
    subtitle: 'Parcours UX, upsell romantique, fidélisation',
    icon: '💎',
    problem: 'Expérience client générique, pas de upsell personnalisé, taux de retour <15%',
    solution: 'Audit parcours client 360°, design de séjours couple sur-mesure, programme fidélité émotionnel, upsell non-agressif intégré au parcours de réservation',
    results: '+31% de panier moyen, 24% de taux de retour à 12 mois',
  },
];

const caseStudies = [
  {
    title: 'Hôtel boutique 18 chambres — Bretagne',
    problem: 'Dépendance à Booking.com (78% des réservations), RevPAR stagnant à 89 €, pas de stratégie directe',
    solution: 'Yield management dynamique, refonte GPS, programme de fidélité par paliers, SEO local',
    resultat: '+23% RevPAR (109 €), réservation directe passe de 12% à 34%, 4,9 Google avg en 6 mois',
    tags: ['RevPAR', 'Direct', 'Fidélisation'],
  },
  {
    title: 'Maison d\'hôtes éco — Dordogne',
    problem: 'Taux d\'occupation 52% hors saison, pas de visibilité Google, avis non gérés (4,0 / 3,2)',
    solution: 'Stratégie contenu slow travel, Google Business Profile optimisé, campagnes email saisonnières',
    resultat: '+34% TO hors saison, 4,8 Google avg, +280% trafic site en 4 mois',
    tags: ['Saisonnalité', 'Avis', 'Trafic'],
  },
];

export default function ExpertHotelierPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            name: 'Heldonica — Consulting Hôtelier',
            description: 'Consulting hôtelier indépendant — Revenue Management, SEO local, expérience client couple.',
            url: `${SITE_URL}/expert-hotelier`,
            telephone: '',
            areaServed: 'FR',
            hasOfferCatalog: {
              '@type': 'OfferCatalog',
              name: 'Services de consulting hôtelier',
              itemListElement: services.map((s, i) => ({
                '@type': 'Offer',
                position: i + 1,
                name: s.title,
                description: s.subtitle,
              })),
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ProfessionalService',
            name: 'Heldonica — Consulting Hôtelier',
            description: 'Revenue Management, SEO local et expérience client couple pour hôtels indépendants.',
            url: `${SITE_URL}/expert-hotelier`,
            areaServed: { '@type': 'Country', name: 'FR' },
            serviceType: ['Revenue Management', 'SEO Local', 'Expérience Client'],
          }),
        }}
      />
      <Header />
      <Script id="ga4-expert-hotelier" strategy="lazyOnload">{`
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'page_view', { page_type: 'expert_hotelier_b2b' });
        }
      `}</Script>
      <main className="min-h-screen">
        <section className="relative bg-stone-950 text-white py-28 md:py-36 overflow-hidden">
          <div className="absolute inset-0 opacity-15" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=70)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-stone-950/90 via-stone-950/80 to-stone-950/90" />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <span className="inline-block px-4 py-1.5 bg-amber-500/15 text-amber-400 text-xs font-semibold rounded-full uppercase tracking-widest mb-6 border border-amber-500/20">
              Consulting Hôtelier B2B
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-tight mb-8">
              Votre établissement laisse-t-il 15 % de RevPAR sur la table&nbsp;?
            </h1>
            <p className="text-stone-300 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-10">
              Consulting hôtelier indépendant — Revenue Management, SEO local, expérience client couple. 
              On analyse les données, on challenge les habitudes, on délivre des résultats chiffrés.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <B2bCtaButton
                href="#audit-form"
                eventName="formulaire_audit_b2b_clique"
                eventParams={{ source: 'hero' }}
                className="inline-flex px-8 py-4 bg-eucalyptus text-white font-semibold rounded-xl hover:brightness-110 transition-all text-lg"
              >
                Demander un audit gratuit →
              </B2bCtaButton>
              <B2bCtaButton
                href="#cas-clients"
                eventName="etude_cas_lue"
                eventParams={{ source: 'hero' }}
                className="inline-flex px-8 py-4 border border-stone-600 text-stone-300 font-semibold rounded-xl hover:border-eucalyptus hover:text-white transition-all text-lg"
              >
                Voir les résultats concrets →
              </B2bCtaButton>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Le problème</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-6 text-center max-w-3xl mx-auto">
              Les hôtels indépendants perdent jusqu&apos;à 30 % de leur marge à cause d&apos;un positionnement générique.
            </h2>
            <p className="text-stone-600 text-lg text-center max-w-2xl mx-auto mb-12 leading-relaxed">
              Une stratégie OTA par défaut, un SEO local inexistant, une expérience client standardisée. 
              Résultat&nbsp;: des commissions à 15-25 %, une visibilité captive des plateformes, des taux de retour anémiques. 
              Et surtout, des séjours couple qui pourraient être vendus 30 % plus cher — avec une expérience vraiment mémorable.
            </p>
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
              <div>
                <p className="text-4xl font-bold text-eucalyptus">78%</p>
                <p className="text-sm text-stone-500 mt-2">des réservations via OTA en moyenne</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-amber-500">15-25%</p>
                <p className="text-sm text-stone-500 mt-2">de commission par réservation</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-amber-500">&lt;15%</p>
                <p className="text-sm text-stone-500 mt-2">de taux de retour client</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-stone-50">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Notre solution</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-4 text-center">
              Trois leviers pour transformer votre établissement
            </h2>
            <p className="text-stone-500 text-center max-w-2xl mx-auto mb-12">
              Chaque levier fait l&apos;objet d&apos;un diagnostic gratuit de 30 minutes, sans engagement.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-5">{s.icon}</div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 mb-1">{s.title}</h3>
                  <p className="text-sm text-eucalyptus font-semibold mb-5">{s.subtitle}</p>
                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                      <p className="text-xs font-semibold text-red-700 mb-1">Problème</p>
                      <p className="text-sm text-stone-700">{s.problem}</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <p className="text-xs font-semibold text-emerald-700 mb-1">Notre approche</p>
                      <p className="text-sm text-stone-700">{s.solution}</p>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                      <p className="text-xs font-semibold text-stone-600 mb-1">Résultats observés</p>
                      <p className="text-sm font-semibold text-eucalyptus">{s.results}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cas-clients" className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Études de cas</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-4 text-center">
              Des résultats qui parlent d&apos;eux-mêmes
            </h2>
            <p className="text-stone-500 text-center max-w-2xl mx-auto mb-12">
              Chiffres réels, établissements indépendants. On ne vend pas de la théorie.
            </p>
            <div className="grid md:grid-cols-2 gap-8">
              {caseStudies.map((cs, i) => (
                <article key={i} className="rounded-2xl border border-stone-200 p-8 bg-stone-50 hover:shadow-lg transition-shadow">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {cs.tags.map((t) => (
                      <span key={t} className="px-2.5 py-1 bg-eucalyptus/10 text-eucalyptus text-xs font-semibold rounded-full">{t}</span>
                    ))}
                  </div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 mb-4">{cs.title}</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold mt-0.5">!</span>
                      <div><span className="font-semibold text-stone-700">Problème :</span> {cs.problem}</div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-eucalyptus/20 text-eucalyptus flex items-center justify-center text-xs font-bold mt-0.5">→</span>
                      <div><span className="font-semibold text-stone-700">Solution :</span> {cs.solution}</div>
                    </div>
                    <div className="mt-4 p-4 bg-stone-900 text-white rounded-xl">
                      <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">Résultat</p>
                      <p className="font-semibold text-lg">{cs.resultat}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-stone-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4">Processus</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12">Comment nous travaillons</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Audit gratuit', desc: '30 min pour comprendre vos données, votre marché et vos objectifs' },
                { step: '02', title: 'Diagnostic', desc: 'Rapport stratégique avec KPI, benchmarks et recommandations chiffrées' },
                { step: '03', title: 'Mise en œuvre', desc: 'Accompagnement pas-à-pas sur 3 à 6 mois avec reporting mensuel' },
                { step: '04', title: 'Suivi', desc: 'Bilan à froid à 6 mois, ajustements si nécessaire, autonomisation de votre équipe' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-eucalyptus text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-stone-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="audit-form" className="py-20 md:py-28 bg-stone-950 text-white">
          <div className="max-w-2xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Audit gratuit</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-4 text-center">
              Demandez votre audit personnalisé
            </h2>
            <p className="text-stone-400 text-center mb-10 max-w-lg mx-auto">
              Laissez-nous vos coordonnées. Nous vous recontactons sous 48h pour planifier un échange découverte de 30 minutes.
            </p>
            <B2bCtaButton
              href="https://tally.so/embed/placeholder"
              target="_blank"
              rel="noreferrer noopener"
              eventName="formulaire_audit_b2b_clique"
              eventParams={{ source: 'section_audit' }}
              className="block w-full max-w-md mx-auto px-8 py-5 bg-eucalyptus text-white font-semibold rounded-xl hover:brightness-110 transition-all text-center text-lg mb-6"
            >
              Ouvrir le formulaire d&apos;audit →
            </B2bCtaButton>
            <p className="text-stone-500 text-center text-sm">Sans engagement. Réponse sous 48h ouvrées.</p>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">FAQ</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center">Questions fréquentes</h2>
            <div className="space-y-4">
              {[
                { q: 'Combien coûte un diagnostic complet ?', a: 'Le premier audit est gratuit (30 min). Pour un accompagnement complet, nos forfaits commencent à partir de 2 500 € pour un diagnostic stratégique et jusqu\'à 12 000 € pour un accompagnement trimestriel full-service.' },
                { q: 'Quels types d\'établissements accompagnons-nous ?', a: 'Hôtels indépendants 3-5 étoiles, maisons d\'hôtes premium, résidences de tourisme. De 8 à 80 chambres. Notre cœur de cible : les établissements qui veulent réduire leur dépendance aux OTA.' },
                { q: 'Quels résultats puis-je attendre et en combien de temps ?', a: 'Les premiers impacts (visibilité locale, taux d\'ouverture email) sont visibles sous 4 à 6 semaines. Les résultats structurels (RevPAR, mix direct/OTA) se mesurent à 3-6 mois. On ne promet jamais de miracle — on livre des données.' },
                { q: 'Travaillez-vous avec des agences ou directement ?', a: 'Directement avec les établissements. Pas d\'intermédiaire. On peut aussi travailler en marque blanche avec des agences de communication locales.' },
              ].map((faq, i) => (
                <details key={i} className="rounded-xl border border-stone-200 p-5 bg-stone-50">
                  <summary className="font-semibold text-stone-900 cursor-pointer">{faq.q}</summary>
                  <p className="text-stone-600 text-sm mt-3 leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28 bg-stone-950 text-white text-center">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6">
              Prêt à reprendre le contrôle de votre chiffre d&apos;affaires&nbsp;?
            </h2>
            <p className="text-stone-400 mb-8 max-w-lg mx-auto">
              30 minutes d&apos;échange gratuit pour analyser vos données et identifier vos leviers de croissance prioritaire.
            </p>
            <B2bCtaButton
              href="#audit-form"
              eventName="formulaire_audit_b2b_clique"
              eventParams={{ source: 'cta_final' }}
              className="inline-block px-10 py-5 bg-eucalyptus text-white font-semibold rounded-xl hover:brightness-110 transition-all text-lg"
            >
              Demander mon audit →
            </B2bCtaButton>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
