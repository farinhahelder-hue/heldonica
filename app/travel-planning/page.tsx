import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function TravelPlanning() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-32">
          <div className="container">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-mahogany mb-6">Travel Planning</h1>
            <p className="text-xl text-charcoal max-w-2xl">
              Conception sur mesure de voyages lents et authentiques pour couples. Itinéraires hors sentiers, hébergements éco, budget optimisé.
            </p>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container">
            <h2 className="text-4xl font-serif font-bold text-mahogany mb-12 text-center">Nos Services</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Itinéraires sur mesure', desc: 'Découvrez des destinations hors sentiers battus, adaptées à votre rythme.' },
                { title: 'Hébergements éco', desc: 'Sélection d\'hébergements authentiques et responsables pour une immersion.' },
                { title: 'Budget optimisé', desc: 'Maximisez votre expérience sans exploser votre budget.' },
              ].map((service, i) => (
                <div key={i} className="p-8 border border-gray-200 rounded-lg hover:shadow-lg transition">
                  <h3 className="text-2xl font-serif font-bold text-mahogany mb-4">{service.title}</h3>
                  <p className="text-gray-700">{service.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-r from-eucalyptus to-teal section-spacing">
          <div className="container text-center">
            <h2 className="text-4xl font-serif font-bold text-white mb-6">Prêt pour l'aventure ?</h2>
            <p className="text-white/90 mb-8 text-lg max-w-2xl mx-auto">
              Contactez-nous pour planifier votre prochain voyage en couple.
            </p>
            <button className="px-8 py-3 bg-white text-eucalyptus font-semibold rounded-lg hover:bg-cloud-dancer transition">
              Nous contacter
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
