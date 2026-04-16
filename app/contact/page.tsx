import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Contact | Heldonica',
  description:
    "Un projet de voyage, une question, un audit hôtelier ? On lit tous les messages. On répond sous 48h.",
  alternates: {
    canonical: 'https://heldonica.fr/contact',
  },
  openGraph: {
    title: 'Contact | Heldonica',
    description:
      "Un projet de voyage, une question, un audit hôtelier ? On lit tous les messages. On répond sous 48h.",
    url: 'https://heldonica.fr/contact',
    siteName: 'Heldonica',
    locale: 'fr_FR',
  },
}

export default function Contact() {
  return (
    <>
      <Header />
      <Breadcrumb />
      <main>
        <section className="bg-gradient-to-br from-stone-50 via-amber-50/40 to-white py-20 md:py-28">
          <div className="mx-auto max-w-4xl px-6 md:px-10">
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-amber-800">
              On lit tous les messages. On répond.
            </p>
            <h1 className="mb-6 text-4xl font-serif font-light leading-tight text-stone-900 md:text-5xl">
              Parle-nous de ce qui est vrai.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-stone-700">
              Un départ qui coince, un hôtel à réaligner, une idée encore floue, un simple besoin de
              remettre de l&apos;ordre dans le voyage : c&apos;est très bien comme ça. On préfère partir de
              la vraie vie que d&apos;un brief lissé.
            </p>
          </div>
        </section>

        <section className="bg-white py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-3 md:px-10">
            <div className="md:col-span-2">
              <div className="mb-10 max-w-2xl">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-stone-400">
                  Ce qui nous aide
                </p>
                <h2 className="mb-4 text-3xl font-serif font-light leading-tight text-stone-900">
                  Quelques lignes suffisent pour commencer juste.
                </h2>
                <p className="text-base leading-relaxed text-stone-700">
                  Où tu veux aller, ce que tu veux éviter, ce qui fatigue, ce qui compte vraiment,
                  même en bas de chez toi. On reprend le fil à partir de là.
                </p>
              </div>
              <ContactForm />
            </div>

            <aside className="space-y-8 md:pt-2">
              <div className="rounded-3xl border border-stone-200 bg-stone-50 p-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                  Email direct
                </p>
                <a
                  href="mailto:info@heldonica.fr"
                  className="text-lg font-semibold text-amber-800 transition-colors duration-200 hover:text-amber-700"
                >
                  info@heldonica.fr
                </a>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Réponse humaine sous 48h, sans tunnel automatique.
                </p>
              </div>

              <div className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">
                  Instagram
                </p>
                <a
                  href="https://www.instagram.com/heldonica/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold text-amber-800 transition-colors duration-200 hover:text-amber-700"
                >
                  @heldonica
                </a>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  Si c&apos;est plus simple pour toi, les DM restent ouverts.
                </p>
              </div>

              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-amber-800">
                  Ce qu&apos;on fait
                </p>
                <ul className="space-y-3 text-sm leading-relaxed text-stone-700">
                  <li>Voyages sur mesure construits à partir de contraintes réelles.</li>
                  <li>Consulting hôtelier indépendant, vu depuis le terrain.</li>
                  <li>Partenariats éditoriaux et collaborations alignées avec notre voix.</li>
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
