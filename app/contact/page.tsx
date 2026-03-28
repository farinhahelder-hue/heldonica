import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import ContactForm from '@/components/ContactForm'

export const metadata = {
  title: 'Nous Contacter | Heldonica',
  description: 'Contactez Heldonica pour vos questions sur le slow travel et le consulting hôtelier.',
};

export default function Contact() {
  return (
    <>
      <Header />
      <Breadcrumb />
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-32">
          <div className="container">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-mahogany mb-6">Nous contacter</h1>
            <p className="text-xl text-charcoal max-w-2xl">
              Vous avez une question ? Une envie d'aventure ? Écrivez-nous !
            </p>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container max-w-2xl">
            <ContactForm />
          </div>
        </section>

        <section className="bg-cloud-dancer section-spacing">
          <div className="container">
            <h2 className="text-4xl font-serif font-bold text-mahogany mb-12 text-center">Autres moyens de nous joindre</h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl mb-4">📧</div>
                <h3 className="text-xl font-serif font-bold text-mahogany mb-2">Email</h3>
                <a href="mailto:info@heldonica.fr" className="text-eucalyptus hover:text-teal transition font-medium">
                  info@heldonica.fr
                </a>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-xl font-serif font-bold text-mahogany mb-2">Réseaux Sociaux</h3>
                <a 
                  href="https://www.instagram.com/heldonica/" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-eucalyptus hover:text-teal transition font-medium"
                >
                  @heldonica
                </a>
              </div>

              <div className="text-center">
                <div className="text-4xl mb-4">📍</div>
                <h3 className="text-xl font-serif font-bold text-mahogany mb-2">Localisation</h3>
                <p className="text-charcoal font-medium">
                  France
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
