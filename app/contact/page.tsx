import type { Metadata } from 'next'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import ContactForm from '@/components/ContactForm'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

export const metadata: Metadata = {
  title: 'Contact | Heldonica',
  description:
    "Une question, un projet de voyage ? On est là. Écris-nous pour ton travel planning sur mesure ou toute autre demande.",
  keywords: [
    'contact heldonica',
    'travel planning contact',
    'voyage sur mesure demande',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/contact',
  },
  openGraph: {
    title: 'Contact | Heldonica',
    description:
      "Une question, un projet de voyage ? On est là. Écris-nous pour ton travel planning sur mesure.",
    url: 'https://www.heldonica.fr/contact',
    siteName: 'Heldonica',
    locale: 'fr_FR',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=85',
        width: 1200,
        height: 630,
        alt: 'Contact Heldonica — Parlons de ton voyage sur mesure',
      },
    ],
  },
}

const CONTACT_SERVICES = [
  { zone: 'service_1', fallback: 'Voyages sur mesure construits à partir de contraintes réelles.' },
  { zone: 'service_2', fallback: 'Consulting hôtelier indépendant, vu depuis le terrain.' },
  { zone: 'service_3', fallback: 'Partenariats éditoriaux et collaborations alignées avec notre voix.' },
]

export default function Contact() {
  return (
    <InlineEditProvider page="contact">
      <Script id="contact-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact — Heldonica',
          description: "Une question, un projet de voyage ? Écris-nous pour ton travel planning sur mesure.",
          url: 'https://www.heldonica.fr/contact',
          mainEntity: {
            '@type': 'Person',
            name: 'Heldonica',
            email: 'contact@heldonica.fr',
          },
        }),
      }} />
      <Header />
      <Breadcrumb />
      <main>
        <section className="bg-gradient-to-br from-stone-50 via-eucalyptus/10 to-white py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-6 md:px-10">
            <EditableZone page="contact" zone="hero_badge" fallback="On lit tous les messages. On répond."
              className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-mahogany block"
            />
            <EditableZone page="contact" zone="hero_title" fallback="Parle-nous de ce qui est vrai."
              className="mb-6 text-4xl font-serif font-light leading-tight text-stone-900 md:text-5xl block"
            />
            <EditableZone page="contact" zone="hero_text" type="textarea" fallback="Un projet encore flou, une contrainte qu'on n'ose pas mettre dans un brief, une envie qu'on n'a pas encore mise en mots : c'est très bien comme ça. On préfère partir de la vraie vie que d'un brief lissé."
              className="max-w-2xl text-lg leading-relaxed text-stone-700 block"
            />
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-3 md:px-10">
            <div className="md:col-span-2">
              <div className="mb-10 max-w-2xl">
                <EditableZone page="contact" zone="form_badge" fallback="Ce qui nous aide"
                  className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-stone-500 block"
                />
                <EditableZone page="contact" zone="form_title" fallback="Quelques lignes suffisent pour commencer juste."
                  className="mb-4 text-3xl font-serif font-light leading-tight text-stone-900 block"
                />
                <EditableZone page="contact" zone="form_text" type="textarea" fallback="Où tu veux aller, ce que tu veux éviter, ce qui fatigue, ce qui compte vraiment, même en bas de chez toi. On reprend le fil à partir de là."
                  className="text-base leading-relaxed text-stone-700 block"
                />
              </div>
              <ContactForm />
            </div>

            <aside className="space-y-8 md:pt-2">
              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-6">
                <EditableZone page="contact" zone="email_title" fallback="Email direct"
                  className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-stone-500 block"
                />
                <a
                  href="mailto:contact@heldonica.fr"
                  className="text-lg font-semibold text-mahogany transition-colors duration-200 hover:text-mahogany/90"
                >
                  contact@heldonica.fr
                </a>
                <EditableZone page="contact" zone="email_text" fallback="Réponse humaine sous 48h, sans tunnel automatique."
                  className="mt-2 text-sm leading-relaxed text-stone-600 block"
                />
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <EditableZone page="contact" zone="instagram_title" fallback="Instagram"
                  className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-stone-500 block"
                />
                <a
                  href="https://www.instagram.com/heldonica/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-mahogany transition-colors duration-200 hover:text-mahogany/90"
                >
                  @heldonica
                </a>
                <EditableZone page="contact" zone="instagram_text" fallback="Si c'est plus simple pour toi, les DM restent ouverts."
                  className="mt-2 text-sm leading-relaxed text-stone-600 block"
                />
              </div>

              <div className="rounded-3xl border border-eucalyptus/20 bg-eucalyptus/5 p-6">
                <EditableZone page="contact" zone="services_title" fallback="Ce qu'on fait"
                  className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-mahogany block"
                />
                <ul className="space-y-3 text-sm leading-relaxed text-stone-700">
                  {CONTACT_SERVICES.map((s) => (
                    <li key={s.zone}>
                      <EditableZone page="contact" zone={s.zone} fallback={s.fallback} className="inline" />
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
