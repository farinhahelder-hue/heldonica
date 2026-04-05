import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact | Heldonica — Travel Planning & Consulting Hôtelier',
  description: 'Écrivez-nous pour votre projet de voyage sur mesure ou pour un audit hôtelier. On répond sous 48h. Slow travel en couple ou consulting hôtelier indépendant — parlons-en.',
  alternates: {
    canonical: 'https://heldonica.fr/contact',
  },
  openGraph: {
    title: 'Contactez Heldonica',
    description: 'Projet de voyage sur mesure ou consulting hôtelier ? Écrivez-nous — on répond sous 48h.',
    url: 'https://heldonica.fr/contact',
    siteName: 'Heldonica',
    locale: 'fr_FR',
  },
};

export default function Contact() {
  return (
    <>
      <Header />
      <Breadcrumb />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-stone-50 to-amber-50/30 py-20 md:py-28">
          <div className="max-w-4xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-4">✦ On vous écoute</p>
            <h1 className="text-4xl md:text-5xl font-serif font-light text-stone-900 mb-5 leading-tight">
              Un projet, une question,<br />
              <em className="text-amber-800">une envie d'ailleurs ?</em>
            </h1>
            <p className="text-stone-600 text-lg max-w-xl leading-relaxed">
              On répond à chaque message personnellement, sous 48h. Pas de formulaire robot, pas de réponse automatique.
            </p>
          </div>
        </section>

        {/* Formulaire + infos contact */}
        <section className="bg-white py-16 md:py-20">
          <div className="max-w-5xl mx-auto px-6 md:px-10 grid md:grid-cols-3 gap-12">

            {/* Formulaire */}
            <div className="md:col-span-2">
              <ContactForm />
            </div>

            {/* Infos de contact */}
            <aside className="space-y-8 md:pt-2">
              <div>
                <p className="text-xs font-bold tracking-[0.15em] uppercase text-stone-400 mb-3">Email direct</p>
                <a href="mailto:info@heldonica.fr" className="text-amber-800 hover:text-amber-700 font-semibold transition-colors text-sm">
                  info@heldonica.fr
                </a>
                <p className="text-stone-500 text-xs mt-1">Réponse sous 48h</p>
              </div>

              <div>
                <p className="text-xs font-bold tracking-[0.15em] uppercase text-stone-400 mb-3">Instagram</p>
                <a
                  href="https://www.instagram.com/heldonica/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-800 hover:text-amber-700 font-semibold transition-colors text-sm"
                >
                  @heldonica
                </a>
                <p className="text-stone-500 text-xs mt-1">DM bienvenus</p>
              </div>

              <div className="border-t border-stone-100 pt-8">
                <p className="text-xs font-bold tracking-[0.15em] uppercase text-stone-400 mb-3">Ce qu'on fait</p>
                <ul className="space-y-2 text-sm text-stone-600">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">→</span>
                    Travel Planning sur mesure
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">→</span>
                    Consulting hôtelier indépendant
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">→</span>
                    Partenariats & collaborations
                  </li>
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
