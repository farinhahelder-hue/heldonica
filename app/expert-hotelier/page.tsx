import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Expertise Hôtelière B2B — Heldonica | Audit & Consulting',
  description:
    "Service d'audit et consulting pour hôteliers et gestionnaires de biens. On analyse, on optimise, on forme. Expert slow travel et expérience client.",
  keywords: [
    'expertise hôtelière',
    'audit hôtelier',
    'consulting tourisme',
    'gestion biens',
    'B2B tourisme',
    'Heldonica',
  ],
  alternates: {
    canonical: 'https://heldonica.fr/expert-hotelier',
  },
  openGraph: {
    title: 'Expertise Hôtelière B2B | Heldonica',
    description: "Audit et consulting pour hôteliers. On analyse ton offre, on optimise l'expérience client et on forme ton équipe.",
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Heldonica — Expertise hôtelière B2B',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

const SERVICES = [
  {
    title: 'Audit complet',
    description: 'Analyse approfondie de ton offre, positionnement, concurrents et opportunités de croissance.',
    icon: '🔍',
    deliverables: ['Rapport détaillé 30+ pages', 'Analyse concurrentielle', 'Recommandations priorisées'],
  },
  {
    title: 'Stratégie contenu',
    description: 'On définit ensemble votre voix de marque, votre stratégie editorialiale et votre calendrier de publication.',
    icon: '📝',
    deliverables: ['Charte éditoriale', 'Plan de contenu 3 mois', 'Formation rédaction web'],
  },
  {
    title: 'Formation équipes',
    description: 'Sessions de formation sur l\'accueil premium, la gestion des avis et l\'expérience client différenciante.',
    icon: '🎓',
    deliverables: ['Modules e-learning', 'Workshops en présentiel', 'Certification équipe'],
  },
]

const TESTIMONIALS = [
  {
    quote: "L'audit Heldonica nous a permis de repositionner notre établissement et d'augmenter notre taux d'occupation de 15% en 6 mois.",
    author: "Marie D.",
    role: "Directrice, Hôtel du Port — Nice",
  },
  {
    quote: "Leurs recommandations sur le contenu ont transformé notre presence en ligne. On reçoit des demandes de presse chaque semaine maintenant.",
    author: "Thomas L.",
    role: "Gérant, Maison d'hôtes — Bordeaux",
  },
]

export default function ExpertHotelierPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="relative bg-stone-950 text-white py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1400&q=70)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <span className="inline-block px-4 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-6">
              Service B2B
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-light leading-tight mb-6">
              Ton établissement mérite<br />
              <span className="text-amber-400">mieux qu&apos;une stratégie générique.</span>
            </h1>
            <p className="text-stone-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
              On analyse, on challenge, on forme. Et surtout, on partage ce qui fonctionne — parce qu&apos;on teste nous-mêmes.
            </p>
          </div>
        </section>

        {/* Services */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Ce qu&apos;on propose</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center">
              Trois approches, un seul objectif&nbsp;:
              <br className="hidden md:block" />
              <span className="text-eucalyptus">ton établissement se différencie</span>
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {SERVICES.map((service, i) => (
                <div key={i} className="bg-stone-50 rounded-2xl p-8 border border-stone-100 hover:shadow-lg transition-shadow">
                  <div className="text-4xl mb-5">{service.icon}</div>
                  <h3 className="text-xl font-serif font-bold text-stone-900 mb-3">{service.title}</h3>
                  <p className="text-stone-600 leading-relaxed mb-6">{service.description}</p>
                  <ul className="space-y-2">
                    {service.deliverables.map((d, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-stone-500">
                        <span className="text-eucalyptus mt-0.5">✓</span>
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="py-20 md:py-28 bg-stone-50">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Ils nous font confiance</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center">
              Ce qu&apos;ils en disent
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 border border-stone-100">
                  <p className="text-lg text-stone-700 leading-relaxed mb-6 italic">&ldquo;{t.quote}&rdquo;</p>
                  <div>
                    <p className="font-semibold text-stone-900">{t.author}</p>
                    <p className="text-sm text-stone-500">{t.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Processus */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Comment ça marche</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center">
              Un process simple, efficace
            </h2>
            
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Échange découverte', desc: '30 min pour comprendre ta situation et tes objectifs' },
                { step: '2', title: 'Audit terrain', desc: 'On analyse ton établissement, tes avis, ta concurrence' },
                { step: '3', title: 'Plan d&apos;action', desc: 'On te livre un rapport avec des recommandations concrètes' },
                { step: '4', title: 'Suivi', desc: 'On reste disponibles pour accompagner la mise en place' },
              ].map((item, i) => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-eucalyptus text-white flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-stone-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formulaire de contact */}
        <section className="py-20 md:py-28 bg-stone-950 text-white">
          <div className="max-w-2xl mx-auto px-6">
            <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Demande d&apos;information</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-4 text-center">
              Parlons de ton établissement
            </h2>
            <p className="text-stone-400 text-center mb-12">
              Remplis le formulaire ci-dessous et on te recontacte sous 48h pour planifier un échange découverte gratuit.
            </p>
            
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-stone-300 mb-2">Nom complet</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-eucalyptus transition-colors"
                    placeholder="Marie Dupont"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-stone-300 mb-2">Email professionnel</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-eucalyptus transition-colors"
                    placeholder="marie@hotel.fr"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="establishment" className="block text-sm font-medium text-stone-300 mb-2">Nom de l&apos;établissement</label>
                <input
                  type="text"
                  id="establishment"
                  name="establishment"
                  required
                  className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-eucalyptus transition-colors"
                  placeholder="Hôtel du Port"
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-stone-300 mb-2">Type d&apos;établissement</label>
                <select
                  id="type"
                  name="type"
                  required
                  className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-eucalyptus transition-colors"
                >
                  <option value="">Sélectionne...</option>
                  <option value="hotel">Hôtel</option>
                  <option value="maison-hotes">Maison d&apos;hôtes</option>
                  <option value="gite">Gîte / Chambres d&apos;hôtes</option>
                  <option value="villa">Villa / Appartement de luxe</option>
                  <option value="restaurant">Restaurant avec hébergement</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="services" className="block text-sm font-medium text-stone-300 mb-2">Service qui t&apos;intéresse</label>
                <select
                  id="services"
                  name="services"
                  className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white focus:outline-none focus:border-eucalyptus transition-colors"
                >
                  <option value="">Sélectionne...</option>
                  <option value="audit">Audit complet</option>
                  <option value="strategie">Stratégie contenu</option>
                  <option value="formation">Formation équipes</option>
                  <option value="complet">Package complet</option>
                  <option value="autre">Autre / Je ne sais pas encore</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-stone-300 mb-2">Parle-nous de ton établissement</label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-4 py-3 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-eucalyptus transition-colors resize-none"
                  placeholder="On a 12 chambres, un positionnement premium mais les avis en ligne ne reflètent pas la qualité réelle..."
                />
              </div>
              
              <div className="text-center">
                <button
                  type="submit"
                  className="px-10 py-4 bg-eucalyptus text-white font-semibold rounded-xl hover:brightness-110 transition-all text-lg"
                >
                  Demander mon audit gratuit →
                </button>
                <p className="text-stone-500 text-sm mt-4">
                  Pas de engagement. Réponse sous 48h.
                </p>
              </div>
            </form>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-28 bg-amber-50">
          <div className="max-w-3xl mx-auto px-6">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4 text-center">Questions fréquentes</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12 text-center">
              Tu te poses des questions&nbsp;?
            </h2>
            
            <div className="space-y-6">
              {[
                {
                  q: 'Combien coûte un audit ?',
                  a: 'Chaque projet est unique. L\'audit commence à partir de 1 500€ pour les petites structures et peut aller jusqu\'à plusieurs milliers d\'euros pour les établissements premium. On en parle ensemble lors de l\'échange découverte.',
                },
                {
                  q: 'Travaillez-vous uniquement avec des hôtels haut de gamme ?',
                  a: 'Non. On adapte notre approche à tous les types d\'établissements, des maisons d\'hôtes aux hôtels 4 étoiles. Ce qui compte, c\'est la volonté de se différencier et d\'améliorer l\'expérience client.',
                },
                {
                  q: 'En combien de temps voit-on des résultats ?',
                  a: 'Cela dépend des actions recommandées. Certains changements (comme une meilleure gestion des avis) peuvent avoir un impact en quelques semaines. D\'autres (comme une refonte de la stratégie contenu) prennent 3 à 6 mois pour montrer leurs effets.',
                },
                {
                  q: 'Travaillez-vous à distance uniquement ?',
                  a: 'Pour l\'audit et la stratégie, on peut travailler à distance. Pour les formations, on propose des sessions en présentiel ou en visio selon ta localisation.',
                },
              ].map((faq, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 border border-stone-100">
                  <h3 className="text-lg font-semibold text-stone-900 mb-3">{faq.q}</h3>
                  <p className="text-stone-600 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-20 md:py-28 bg-white text-center">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-6">
              Prêt à voir ton établissement sous un nouveau jour&nbsp;?
            </h2>
            <p className="text-stone-600 mb-8">
              On ne te propose que ce qu&apos;on sait faire. Et on sait faire pas mal de choses.
            </p>
            <Link
              href="#formulaire"
              className="inline-block px-8 py-4 bg-eucalyptus text-white font-semibold rounded-full hover:brightness-110 transition-all text-lg"
            >
              Demander mon audit gratuit →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}