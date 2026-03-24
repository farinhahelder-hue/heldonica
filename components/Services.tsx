export default function Services() {
  return (
    <section className="bg-white section-spacing">
      <div className="container">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-mahogany mb-4 text-center">
          Ce qu'on fait
        </h2>
        <p className="text-center text-gray-600 mb-16 text-lg max-w-2xl mx-auto">
          Deux expertises, une philosophie : l'authenticité et la qualité
        </p>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="p-8 bg-gradient-to-br from-eucalyptus/5 to-teal/5 rounded-lg border border-eucalyptus/20">
            <div className="w-12 h-12 bg-eucalyptus rounded-full flex items-center justify-center mb-6">
              <span className="text-white text-2xl">✈️</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-mahogany mb-4">Travel Planning</h3>
            <p className="text-charcoal text-lg leading-relaxed">
              Itinéraires sur mesure hors sentiers battus. Conception de voyages lents et authentiques pour couples, avec hébergements éco et budgets optimisés.
            </p>
          </div>

          <div className="p-8 bg-gradient-to-br from-teal/5 to-eucalyptus/5 rounded-lg border border-teal/20">
            <div className="w-12 h-12 bg-teal rounded-full flex items-center justify-center mb-6">
              <span className="text-white text-2xl">🏨</span>
            </div>
            <h3 className="text-2xl font-serif font-bold text-mahogany mb-4">Consulting Hôtelier</h3>
            <p className="text-charcoal text-lg leading-relaxed">
              RevPAR +30% hôtels indépendants. Revenue Management, SEO local, expérience client pour maximiser vos revenus et votre impact.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
