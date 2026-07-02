'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

export default function MerciPage() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <InlineEditProvider page="merci">
      <Header />
      <main className="min-h-screen">
        <section className="relative bg-stone-950 text-white py-20 md:py-28 overflow-hidden">
          <EditableZone page="merci" zone="hero_image_url" type="image"
            fallback="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=60"
            className="absolute inset-0 opacity-10 w-full h-full object-cover"
          />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <div
              className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <div className="inline-flex items-center gap-2 bg-teal text-white px-5 py-2 rounded-full mb-8 text-sm font-semibold shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                <EditableZone page="merci" zone="hero_badge" fallback="Demande envoyée" />
              </div>

              <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 leading-tight">
                <EditableZone page="merci" zone="hero_title" fallback="On a bien reçu ton projet. 🌍" />
              </h1>

              <EditableZone page="merci" zone="hero_text" type="textarea" fallback="On revient vers toi sous 48h — un vrai échange, pas un devis automatique."
                className="text-stone-300 text-lg md:text-xl leading-relaxed mb-8 block"
              />

              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <svg className="w-10 h-10 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <EditableZone page="merci" zone="steps_badge" fallback="Prochaine étape"
              className="text-mahogany text-xs font-bold tracking-[0.2em] uppercase mb-2 text-center block"
            />
            <EditableZone page="merci" zone="steps_title" fallback="Ce qui se passe maintenant"
              className="text-2xl md:text-3xl font-serif font-light text-stone-900 mb-12 text-center block"
            />

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
                  <span className="text-2xl">📖</span>
                </div>
                <div className="text-xs font-bold text-mahogany uppercase tracking-wider mb-2">01</div>
                <EditableZone page="merci" zone="step_1_title" fallback="On lit ton brief"
                  className="text-lg font-serif font-light text-stone-900 mb-2 block"
                />
                <EditableZone page="merci" zone="step_1_text" fallback="On prend le temps de comprendre ce que tu veux vraiment. Pas de case à cocher."
                  className="text-stone-600 text-sm leading-relaxed block"
                />
              </div>

              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
                  <span className="text-2xl">✉️</span>
                </div>
                <div className="text-xs font-bold text-mahogany uppercase tracking-wider mb-2">02</div>
                <EditableZone page="merci" zone="step_2_title" fallback="On te répond sous 48h"
                  className="text-lg font-serif font-light text-stone-900 mb-2 block"
                />
                <EditableZone page="merci" zone="step_2_text" fallback="Par email, avec nos premières idées et questions si besoin pour affiner ton voyage."
                  className="text-stone-600 text-sm leading-relaxed block"
                />
              </div>

              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
                  <span className="text-2xl">🗺️</span>
                </div>
                <div className="text-xs font-bold text-mahogany uppercase tracking-wider mb-2">03</div>
                <EditableZone page="merci" zone="step_3_title" fallback="On construit ensemble"
                  className="text-lg font-serif font-light text-stone-900 mb-2 block"
                />
                <EditableZone page="merci" zone="step_3_text" fallback="Si le courant passe, on démarre la conception sur mesure pour ton voyage."
                  className="text-stone-600 text-sm leading-relaxed block"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-stone-50">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <EditableZone page="merci" zone="upsell_title" fallback="En attendant, explore nos carnets"
              className="text-2xl md:text-3xl font-serif font-light text-stone-900 mb-4 block"
            />
            <EditableZone page="merci" zone="upsell_text" fallback="Des destinations qu'on a vraiment vécues. Peut-être que ta prochaine pépite est là."
              className="text-stone-600 leading-relaxed mb-8 max-w-xl mx-auto block"
            />
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/blog" className="px-8 py-4 bg-mahogany hover:bg-mahogany/90 text-white rounded font-semibold text-sm transition shadow-lg">
                <EditableZone page="merci" zone="upsell_cta_1" fallback="Voir les carnets de voyage →" />
              </Link>
              <Link href="/destinations" className="px-8 py-4 border-2 border-stone-300 hover:border-mahogany text-stone-700 hover:text-mahogany rounded font-semibold text-sm transition">
                <EditableZone page="merci" zone="upsell_cta_2" fallback="Découvrir nos destinations →" />
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 bg-white border-t border-stone-100">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-stone-500 text-sm">
              <EditableZone page="merci" zone="contact_text" fallback="Des questions ? Écris-nous à" className="inline" />{' '}
              <a href="mailto:contact@heldonica.fr" className="text-teal hover:underline font-medium">
                contact@heldonica.fr
              </a>
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
