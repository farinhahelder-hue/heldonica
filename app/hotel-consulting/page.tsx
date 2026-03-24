import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function HotelConsulting() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-32">
          <div className="container">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-mahogany mb-6">Consulting Hôtelier</h1>
            <p className="text-xl text-charcoal max-w-2xl">
              Revenue Management, SEO local, expérience client. +30% RevPAR pour hôtels indépendants.
            </p>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container">
            <h2 className="text-4xl font-serif font-bold text-mahogany mb-12 text-center">Notre Expertise</h2>
            
            <div className="grid md:grid-cols-2 gap-12">
              {[
                {
                  title: 'Revenue Management',
                  items: ['Analyse des données de marché', 'Stratégie de pricing dynamique', 'Gestion des canaux']
                },
                {
                  title: 'SEO Local & Digital',
                  items: ['Optimisation Google My Business', 'Stratégie de contenu', 'Gestion des avis']
                },
                {
                  title: 'Expérience Client',
                  items: ['Audit de l\'expérience', 'Formation du personnel', 'Stratégie de fidélisation']
                },
                {
                  title: 'Résultats Mesurables',
                  items: ['+30% RevPAR en moyenne', 'Augmentation réservations directes', 'Amélioration satisfaction']
                },
              ].map((service, i) => (
                <div key={i}>
                  <h3 className="text-2xl font-serif font-bold text-mahogany mb-4">{service.title}</h3>
                  <ul className="space-y-2 text-gray-700">
                    {service.items.map((item, j) => (
                      <li key={j}>✓ {item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-teal to-eucalyptus section-spacing">
          <div className="container text-center">
            <h2 className="text-4xl font-serif font-bold text-white mb-6">Prêt à augmenter votre RevPAR ?</h2>
            <p className="text-white/90 mb-8 text-lg max-w-2xl mx-auto">
              Découvrez comment nous pouvons transformer votre hôtel.
            </p>
            <button className="px-8 py-3 bg-white text-teal font-semibold rounded-lg hover:bg-cloud-dancer transition">
              Demander une consultation
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
