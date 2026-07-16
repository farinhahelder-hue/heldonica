import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import B2bCtaButton from '@/components/B2bCtaButton';
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider';
import EditableZone from '@/components/inline-edit/EditableZone';

const SITE_URL = 'https://www.heldonica.fr';

// DRAFT — not linked from nav or sitemap
export const metadata: Metadata = {
  title: 'Hébergements Slow Travel & Indépendance | Heldonica',
  description: 'Accompagnement pour hôtels indépendants, maisons d’hôtes et gîtes de charme. Valorise ton positionnement slow travel, libère-toi des plateformes et fidélise les couples.',
  keywords: ['slow travel gîte', 'maison d\'hôtes de charme', 'indépendance booking', 'expérience couple', 'conseil hébergement insolite'],
  robots: { index: true, follow: true },
  alternates: { canonical: `${SITE_URL}/expert-hotelier` },
  openGraph: {
    title: 'Hébergements Slow Travel & Indépendance | Heldonica',
    description: 'Accompagnement pour hôtels indépendants, gîtes de charme et maisons d’hôtes pour développer les réservations directes.',
    url: `${SITE_URL}/expert-hotelier`,
    images: [{ url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80', width: 1200, height: 630, alt: 'Accompagnement hébergements Heldonica' }],
    locale: 'fr_FR', type: 'website',
  },
};

const services = [
  {
    title: 'Indépendance & Réservations Directes',
    subtitle: 'Se libérer de la dépendance aux plateformes',
    icon: '🌾',
    problem: 'Forte dépendance à Booking.com ou Airbnb, commissions élevées (jusqu\'à 25%), relation client inexistante avant le séjour.',
    solution: 'Optimisation de ton propre parcours de réservation, stratégie tarifaire intelligente en direct, et maillage de contacts avant l\'arrivée pour instaurer la confiance.',
    results: 'Marge préservée et jusqu\'à 45% de réservations en direct en quelques mois.',
  },
  {
    title: 'Visibilité Naturelle & Authentique',
    subtitle: 'Attirer les bons voyageurs au bon endroit',
    icon: '🔍',
    problem: 'Invisible sur Google en dehors des plateformes intermédiaires, fiche locale délaissée, pas d\'histoire racontée.',
    solution: 'Référencement local (Google Business Profile) optimisé aux petits oignons, création de contenu authentique inspiré du slow travel, et mise en valeur de tes vrais atouts régionaux.',
    results: 'Un trafic qualifié de voyageurs qui recherchent précisément ton authenticité.',
  },
  {
    title: 'L\'Expérience Slow Travel Couple',
    subtitle: 'Offrir des séjours mémorables et fidéliser',
    icon: '💎',
    problem: 'Accueil générique similaire aux hôtels standard, manque d\'attention personnalisée, aucun levier pour encourager le retour.',
    solution: 'Audit du parcours d\'accueil, création d\'attentions locales personnalisées pour les couples (guides papier, adresses secrètes testées), et conception d\'activités de slow-tourisme sur place.',
    results: 'Des voyageurs conquis qui deviennent tes meilleurs ambassadeurs et reviennent.',
  },
];

const caseStudies = [
  {
    title: 'La Grange d\'Émilie — Maison d\'hôtes en Bretagne',
    problem: 'Près de 80% des séjours réservés sur les plateformes, RevPAR stagnant hors saison, manque d\'identité claire.',
    solution: 'Mise en avant d\'itinéraires slow-travel locaux et d\'un panier d\'accueil terroir en direct.',
    resultat: 'Les réservations en direct passent de 12% à 45%, et le taux de retour client double.',
    tags: ['Bretagne', 'Réservations Directes', 'Expérience'],
  },
  {
    title: 'Le Domaine de la Combe — Gîtes éco-conçus en Dordogne',
    problem: 'Faible taux de remplissage en automne-hiver, site internet peu visible et manque de clarté sur la démarche éco.',
    solution: 'Storytelling axé sur la déconnexion automnale et campagnes email ciblées vers les couples.',
    resultat: '+34% de taux d\'occupation hors saison et création d\'une vraie communauté de fidèles.',
    tags: ['Dordogne', 'Slow Travel', 'Fidélisation'],
  },
];

const faqItems = [
  { q: 'Comment se passe notre premier échange ?', a: 'On s’appelle pendant 30 minutes. Tu nous présentes ton projet, tes problématiques (taux de remplissage, dépendance aux plateformes, etc.), et on regarde ensemble si notre approche slow travel est adaptée à ton lieu.' },
  { q: 'À quel type d’hébergements s’adresse cet accompagnement ?', a: 'Aux maisons d’hôtes de charme, aux gîtes éco-conçus, aux hébergements insolites haut de gamme, et aux petits hôtels indépendants qui mettent l’humain et l’authenticité au centre de leur projet.' },
  { q: 'Quels résultats peut-on attendre ?', a: 'Une augmentation significative de tes réservations directes (et donc une baisse des commissions payées), une meilleure visibilité sur Google auprès d’une clientèle qualifiée, et surtout des voyageurs qui viennent pour ton concept.' },
  { q: 'Combien coûte un accompagnement ?', a: 'Le premier échange de diagnostic est totalement gratuit et sans engagement. Si nous décidons de travailler ensemble, nous te proposons un forfait sur-mesure adapté à la taille de ton établissement et à tes besoins.' },
];

export default function ExpertHotelierPage() {
  return (
    <InlineEditProvider page="expert-hotelier">
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
        {/* Hero Section */}
        <section className="relative bg-stone-950 text-white py-28 md:py-36 overflow-hidden">
          <div className="absolute inset-0 opacity-[0.35]" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=70)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="absolute inset-0 bg-gradient-to-br from-stone-950/[0.60] via-stone-950/50 to-stone-950/[0.60]" />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <EditableZone page="expert-hotelier" zone="hero_badge" fallback="Hébergements & Slow Travel"
              className="inline-block px-4 py-1.5 bg-eucalyptus/15 text-eucalyptus text-xs font-semibold rounded-full uppercase tracking-widest mb-6 border border-eucalyptus/20"
            />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-tight mb-8">
              <EditableZone page="expert-hotelier" zone="hero_title" fallback="Fais vivre l'expérience slow travel dans ton hébergement" className="inline" />
            </h1>
            <EditableZone page="expert-hotelier" zone="hero_text" type="textarea" fallback="Tu gères une maison d'hôtes, un gîte de charme ou un hôtel indépendant ? On t'aide à attirer des voyageurs qui aiment prendre leur temps, à maximiser tes réservations directes et à créer des séjours inoubliables."
              className="text-stone-300 text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-10 block"
            />
            <div className="flex flex-wrap justify-center gap-4">
              <B2bCtaButton
                href="#audit-form"
                eventName="formulaire_audit_b2b_clique"
                eventParams={{ source: 'hero' }}
                className="inline-flex px-8 py-4 bg-eucalyptus text-white font-semibold rounded-xl hover:brightness-110 transition-all text-lg"
              >
                <EditableZone page="expert-hotelier" zone="hero_cta_1" fallback="Échangeons sur ton projet →" />
              </B2bCtaButton>
              <B2bCtaButton
                href="#cas-clients"
                eventName="etude_cas_lue"
                eventParams={{ source: 'hero' }}
                className="inline-flex px-8 py-4 border border-stone-600 text-stone-300 font-semibold rounded-xl hover:border-eucalyptus hover:text-white transition-all text-lg"
              >
                <EditableZone page="expert-hotelier" zone="hero_cta_2" fallback="Voir nos retours d'expérience →" />
              </B2bCtaButton>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <EditableZone page="expert-hotelier" zone="section_problem_badge" fallback="Le défi"
              className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center block"
            />
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-6 text-center max-w-3xl mx-auto">
              <EditableZone page="expert-hotelier" zone="section_problem_title" fallback="Pourquoi le positionnement standard ne suffit plus aujourd'hui" className="inline" />
            </h2>
            <EditableZone page="expert-hotelier" zone="section_problem_text" type="textarea" fallback="Des commissions élevées versées aux plateformes intermédiaires, une visibilité captive et un accueil souvent trop impersonnel font perdre de la valeur à ton hébergement. En adoptant un positionnement slow travel authentique, tu attires des couples de voyageurs engagés en direct, prêts à s'investir pour vivre une vraie expérience locale."
              className="text-stone-600 text-lg text-center max-w-2xl mx-auto mb-12 leading-relaxed block"
            />
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
              <div>
                <EditableZone page="expert-hotelier" zone="stat_1_value" fallback="78%"
                  className="text-4xl font-bold text-eucalyptus block"
                />
                <EditableZone page="expert-hotelier" zone="stat_1_label" fallback="de dépendance moyenne aux plateformes"
                  className="text-sm text-stone-500 mt-2 block"
                />
              </div>
              <div>
                <EditableZone page="expert-hotelier" zone="stat_2_value" fallback="15-25%"
                  className="text-4xl font-bold text-amber-500 block"
                />
                <EditableZone page="expert-hotelier" zone="stat_2_label" fallback="de commission laissée aux intermédiaires"
                  className="text-sm text-stone-500 mt-2 block"
                />
              </div>
              <div>
                <EditableZone page="expert-hotelier" zone="stat_3_value" fallback="+30%"
                  className="text-4xl font-bold text-eucalyptus block"
                />
                <EditableZone page="expert-hotelier" zone="stat_3_label" fallback="de panier moyen sur un séjour personnalisé"
                  className="text-sm text-stone-500 mt-2 block"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20 md:py-28 bg-stone-50">
          <div className="max-w-6xl mx-auto px-6">
            <EditableZone page="expert-hotelier" zone="section_solution_badge" fallback="Notre approche"
              className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center block"
            />
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-4 text-center">
              <EditableZone page="expert-hotelier" zone="section_solution_title" fallback="Trois leviers pour révéler ton hébergement" className="inline" />
            </h2>
            <EditableZone page="expert-hotelier" zone="section_solution_subtitle" type="textarea" fallback="On t'accompagne pas à pas pour valoriser ton lieu de vie."
              className="text-stone-500 text-center max-w-2xl mx-auto mb-12 block"
            />
            <div className="grid md:grid-cols-3 gap-8">
              {services.map((s, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 border border-stone-200 hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-5">{s.icon}</div>
                  <EditableZone page="expert-hotelier" zone={`service_${i + 1}_title`} fallback={s.title}
                    className="text-xl font-serif font-bold text-stone-900 mb-1 block"
                  />
                  <EditableZone page="expert-hotelier" zone={`service_${i + 1}_subtitle`} fallback={s.subtitle}
                    className="text-sm text-eucalyptus font-semibold mb-5 block"
                  />
                  <div className="space-y-4">
                    <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                      <p className="text-xs font-semibold text-red-700 mb-1">Problème</p>
                      <EditableZone page="expert-hotelier" zone={`service_${i + 1}_problem`} fallback={s.problem}
                        className="text-sm text-stone-700 block"
                      />
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                      <p className="text-xs font-semibold text-emerald-700 mb-1">Notre approche</p>
                      <EditableZone page="expert-hotelier" zone={`service_${i + 1}_solution`} type="textarea" fallback={s.solution}
                        className="text-sm text-stone-700 block"
                      />
                    </div>
                    <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                      <p className="text-xs font-semibold text-stone-600 mb-1">Résultats observés</p>
                      <EditableZone page="expert-hotelier" zone={`service_${i + 1}_results`} fallback={s.results}
                        className="text-sm font-semibold text-eucalyptus block"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Case Studies Section */}
        <section id="cas-clients" className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <EditableZone page="expert-hotelier" zone="cas_clients_badge" fallback="Retours d'expérience"
              className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center block"
            />
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-4 text-center">
              <EditableZone page="expert-hotelier" zone="cas_clients_title" fallback="Ils nous font confiance" className="inline" />
            </h2>
            <EditableZone page="expert-hotelier" zone="cas_clients_text" type="textarea" fallback="Découvre comment d'autres hébergements ont franchi le pas."
              className="text-stone-500 text-center max-w-2xl mx-auto mb-12 block"
            />
            <div className="grid md:grid-cols-2 gap-8">
              {caseStudies.map((cs, i) => (
                <article key={i} className="rounded-2xl border border-stone-200 p-8 bg-stone-50 hover:shadow-lg transition-shadow">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {cs.tags.map((t) => (
                      <span key={t} className="px-2.5 py-1 bg-eucalyptus/10 text-eucalyptus text-xs font-semibold rounded-full">{t}</span>
                    ))}
                  </div>
                  <EditableZone page="expert-hotelier" zone={`cas_${i + 1}_title`} fallback={cs.title}
                    className="text-xl font-serif font-bold text-stone-900 mb-4 block"
                  />
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-bold mt-0.5">!</span>
                      <div>
                        <span className="font-semibold text-stone-700">Problème : </span>
                        <EditableZone page="expert-hotelier" zone={`cas_${i + 1}_problem`} fallback={cs.problem} className="inline" />
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-eucalyptus/20 text-eucalyptus flex items-center justify-center text-xs font-bold mt-0.5">→</span>
                      <div>
                        <span className="font-semibold text-stone-700">Solution : </span>
                        <EditableZone page="expert-hotelier" zone={`cas_${i + 1}_solution`} type="textarea" fallback={cs.solution} className="inline" />
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-stone-900 text-white rounded-xl">
                      <p className="text-xs uppercase tracking-wider text-stone-400 mb-1">Résultat</p>
                      <EditableZone page="expert-hotelier" zone={`cas_${i + 1}_resultat`} fallback={cs.resultat}
                        className="font-semibold text-lg block"
                      />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Processus Section */}
        <section className="py-20 md:py-28 bg-stone-50">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <EditableZone page="expert-hotelier" zone="processus_badge" fallback="Le cheminement"
              className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
            />
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12">
              <EditableZone page="expert-hotelier" zone="processus_title" fallback="Comment on avance ensemble" className="inline" />
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '01', title: 'Diagnostic initial', desc: 'Un appel de 30 min pour faire le point sur ton positionnement et tes objectifs' },
                { step: '02', title: 'Plan d\'action', desc: 'Une feuille de route personnalisée avec des solutions adaptées et concrètes' },
                { step: '03', title: 'Mise en place', desc: 'On t\'accompagne pas-à-pas pour implémenter les changements à ton rythme' },
                { step: '04', title: 'Autonomie', desc: 'Un bilan à 6 mois pour ajuster et s\'assurer que tu es totalement autonome' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-eucalyptus text-white flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <EditableZone page="expert-hotelier" zone={`processus_${i + 1}_title`} fallback={item.title}
                    className="text-lg font-semibold text-stone-900 mb-2 block"
                  />
                  <EditableZone page="expert-hotelier" zone={`processus_${i + 1}_desc`} type="textarea" fallback={item.desc}
                    className="text-sm text-stone-500 block"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Audit Form Section */}
        <section id="audit-form" className="py-20 md:py-28 bg-stone-950 text-white">
          <div className="max-w-2xl mx-auto px-6">
            <EditableZone page="expert-hotelier" zone="audit_badge" fallback="Diagnostic offert"
              className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center block"
            />
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-4 text-center">
              <EditableZone page="expert-hotelier" zone="audit_title" fallback="Raconte-nous ton projet" className="inline" />
            </h2>
            <EditableZone page="expert-hotelier" zone="audit_text" type="textarea" fallback="Laisse-nous tes coordonnées. On te recontacte sous 48h pour planifier un appel découverte de 30 minutes, en toute simplicité."
              className="text-stone-400 text-center mb-10 max-w-lg mx-auto block"
            />
            <B2bCtaButton
              href="/contact"
              eventName="formulaire_audit_b2b_clique"
              eventParams={{ source: 'section_audit' }}
              className="block w-full max-w-md mx-auto px-8 py-5 bg-eucalyptus text-white font-semibold rounded-xl hover:brightness-110 transition-all text-center text-lg mb-6"
            >
              <EditableZone page="expert-hotelier" zone="audit_cta" fallback="Échanger sur mon projet →" />
            </B2bCtaButton>
            <EditableZone page="expert-hotelier" zone="audit_note" fallback="Sans engagement. Échange simple de 30 minutes."
              className="text-stone-500 text-center text-sm block"
            />
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <EditableZone page="expert-hotelier" zone="faq_badge" fallback="Des questions ?"
              className="text-eucalyptus text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center block"
            />
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center">
              <EditableZone page="expert-hotelier" zone="faq_title" fallback="Tout ce que tu te demandes" className="inline" />
            </h2>
            <div className="space-y-4">
              {faqItems.map((faq, i) => (
                <details key={i} className="rounded-xl border border-stone-200 p-5 bg-stone-50">
                  <summary className="font-semibold text-stone-900 cursor-pointer">
                    <EditableZone page="expert-hotelier" zone={`faq_${i + 1}_q`} fallback={faq.q} className="inline" />
                  </summary>
                  <EditableZone page="expert-hotelier" zone={`faq_${i + 1}_a`} type="textarea" fallback={faq.a}
                    className="text-stone-600 text-sm mt-3 leading-relaxed block"
                  />
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final Section */}
        <section className="py-20 md:py-28 bg-stone-950 text-white text-center">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-6">
              <EditableZone page="expert-hotelier" zone="cta_title" fallback="Prêt à franchir le pas du slow travel ?" className="inline" />
            </h2>
            <EditableZone page="expert-hotelier" zone="cta_text" type="textarea" fallback="30 minutes d'échange offert pour faire le point ensemble et imaginer la suite."
              className="text-stone-400 mb-8 max-w-lg mx-auto block"
            />
            <B2bCtaButton
              href="#audit-form"
              eventName="formulaire_audit_b2b_clique"
              eventParams={{ source: 'cta_final' }}
              className="inline-block px-10 py-5 bg-eucalyptus text-white font-semibold rounded-xl hover:brightness-110 transition-all text-lg"
            >
              <EditableZone page="expert-hotelier" zone="cta_button" fallback="Discuter de mon projet →" />
            </B2bCtaButton>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  );
}
