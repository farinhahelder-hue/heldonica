import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'À propos - Heldonica | Duo d\'explorateurs slow travel',
  description: 'Découvrez notre histoire : duo d\'explorateurs passionnés par le slow travel en couple et le consulting hôtelier. Expertise terrain 100% vécue.',
}

export default function AProposPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-stone-50 to-amber-50 py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-mahogany mb-6">
              Deux explorateurs, une vision
            </h1>
            <p className="text-xl md:text-2xl text-stone-600 leading-relaxed max-w-2xl mx-auto">
              Nous croyons en los viajes qui changent la mirada. En conversaciones auténtiques, itinéraires hors des sentiers y momentos qui ne s'inventent pas.
            </p>
          </div>
        </section>

        {/* Notre Histoire */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-eucalyptus font-medium tracking-wide uppercase text-sm">Notre histoire</span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-mahogany mt-4 mb-6">
                  D&apos;une rencontre à une philosophie
                </h2>
                <div className="space-y-4 text-stone-600 leading-relaxed">
                  <p>
                    Tout a commencé par un coup de cœur pour une île portugaise : Madère. 
                    Les premières levées de soleil sur les levadas, les odeurs de bolo do caco 
                    dans les ruelles de Funchal, les rencontres inattendues dans les petits villages 
                    de montagne.
                  </p>
                  <p>
                    De voyage en voyage, une conviction s&apos;est ancrée : les meilleurs souvenirs 
                    ne se trouvent pas dans les guides touristiques. Ils se vivent, se partagent, 
                    se construisent lentement.
                  </p>
                  <p>
                    Aujourd&apos;hui, Heldonica c&apos;est cette philosophie appliquée à deux axes : 
                    le <strong>slow travel en couple</strong> pour les voyageurs qui veulent aller 
                    au-delà du superficiel, et le <strong>consulting hôtelier</strong> pour les 
                    établissements qui souhaitent offrir une vraie expérience client.
                  </p>
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gradient-to-br from-eucalyptus/20 to-teal/20">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">🏝️</div>
                      <p className="text-stone-500 font-medium">Madère, 2024</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Notre Approche */}
        <section className="py-20 bg-cloud-dancer px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-eucalyptus font-medium tracking-wide uppercase text-sm">Notre approche</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-mahogany mt-4">
                Le slow travel, notre philosophie
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: '🎯',
                  title: 'Vécu terrain',
                  description: 'Chaque destination que nous recommandons, nous l\'avons explorée. Les photos sont les nôtres, les tips sont testés.',
                },
                {
                  icon: '💑',
                  title: 'Couple & proximité',
                  description: 'Nous concevons des itinéraires pour les couples qui veulent partager plus que des vacances : une aventure.',
                },
                {
                  icon: '🔍',
                  title: 'Hors des sentiers',
                  description: 'Nous dénichons les pépites que vous ne trouverez pas dans les guides : restaurants locaux, spots incontournés.',
                },
              ].map((item, idx) => (
                <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-serif font-bold text-mahogany mb-3">{item.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Expertise Hôtelière */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <div className="aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50">
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="text-6xl mb-4">🏨</div>
                      <p className="text-stone-500 font-medium">Expertise hôtelière</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <span className="text-eucalyptus font-medium tracking-wide uppercase text-sm">Consulting hôtelier</span>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-mahogany mt-4 mb-6">
                  L&apos;expertise au service de l&apos;hébergement
                </h2>
                <div className="space-y-4 text-stone-600 leading-relaxed">
                  <p>
                    Avec plus de 15 ans d&apos;expérience dans l&apos;industrie hôtelière, nous aidons 
                    les établissements à transformer l&apos;expérience client et optimiser leurs revenus.
                  </p>
                  <ul className="space-y-3 mt-6">
                    {[
                      'Revenue management & pricing stratégique',
                      'Expérience client & journey mapping',
                      'Formation équipes & mise en place process',
                      'Conseil en positionnement & différenciation',
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="text-eucalyptus">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a 
                  href="/hotel-consulting" 
                  className="inline-block mt-8 px-6 py-3 bg-amber-900 text-white rounded-full hover:bg-amber-800 transition-colors font-medium"
                >
                  Découvrir nos services →
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Chiffres clés */}
        <section className="py-20 bg-amber-900 text-white px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: '15+', label: "Années d'expérience" },
                { number: '40+', label: 'Destinations explorées' },
                { number: '100+', label: 'Itinéraires personnalisés' },
                { number: '+30%', label: 'RevPAR moyen client' },
              ].map((stat, idx) => (
                <div key={idx}>
                  <div className="text-4xl md:text-5xl font-serif font-bold mb-2">{stat.number}</div>
                  <div className="text-amber-200 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-mahogany mb-6">
              Prêt à vivre l&apos;aventure ?
            </h2>
            <p className="text-stone-600 text-lg mb-8">
              Que vous cherchiez un itinéraire slow travel ou des conseils pour votre établissement, 
              nous sommes là pour vous guider.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/travel-planning-form" 
                className="px-8 py-3 bg-amber-900 text-white rounded-full hover:bg-amber-800 transition-colors font-medium"
              >
                Planifier mon voyage
              </a>
              <a 
                href="/hotel-consulting" 
                className="px-8 py-3 border-2 border-amber-900 text-amber-900 rounded-full hover:bg-amber-50 transition-colors font-medium"
              >
                Consulting hôtelier
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}