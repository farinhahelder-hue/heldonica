'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function MerciPage() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      <Header />
      <main className="min-h-screen">
        
        {/* ── HERO CONFIRMATION ── */}
        <section className="relative bg-stone-950 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=60)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative max-w-3xl mx-auto px-6 text-center">
            <div 
              className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              {/* Badge animé */}
              <div className="inline-flex items-center gap-2 bg-teal text-white px-5 py-2 rounded-full mb-8 text-sm font-semibold shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Demande envoyée
              </div>

              {/* Titre */}
              <h1 className="text-4xl md:text-5xl font-serif font-light mb-4 leading-tight">
                On a bien reçu ton projet. 🌍
              </h1>
              
              {/* Sous-titre */}
              <p className="text-stone-300 text-lg md:text-xl leading-relaxed mb-8">
                On revient vers toi sous 48h — un vrai échange,<br />
                <span className="text-amber-400">pas un devis automatique.</span>
              </p>

              {/* Icône confirmation */}
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
                <svg className="w-10 h-10 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* ── CE QUI SE PASSE MAINTENANT ── */}
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-2 text-center">Prochaine étape</p>
            <h2 className="text-2xl md:text-3xl font-serif font-light text-stone-900 mb-12 text-center">
              Ce qui se passe maintenant
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Étape 1 */}
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
                  <span className="text-2xl">📖</span>
                </div>
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">01</div>
                <h3 className="text-lg font-serif font-light text-stone-900 mb-2">On lit ton brief</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  On prend le temps de comprendre ce que tu veux vraiment. Pas de case à cocher.
                </p>
              </div>

              {/* Étape 2 */}
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
                  <span className="text-2xl">✉️</span>
                </div>
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">02</div>
                <h3 className="text-lg font-serif font-light text-stone-900 mb-2">On te répond sous 48h</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Par email, avec nos premières idées et questions si besoin pour affiner ton voyage.
                </p>
              </div>

              {/* Étape 3 */}
              <div className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-stone-100 flex items-center justify-center">
                  <span className="text-2xl">🗺️</span>
                </div>
                <div className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">03</div>
                <h3 className="text-lg font-serif font-light text-stone-900 mb-2">On construit ensemble</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  Si le courant passe, on démarre la conception sur mesure pour ton voyage.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── UPSELL DOUX ── */}
        <section className="py-16 md:py-20 bg-stone-50">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-light text-stone-900 mb-4">
              En attendant, explore nos carnets
            </h2>
            <p className="text-stone-600 leading-relaxed mb-8 max-w-xl mx-auto">
              Des destinations qu&apos;on a vraiment vécues. Peut-être que ta prochaine pépite est là.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/blog" className="px-8 py-4 bg-amber-900 hover:bg-amber-800 text-white rounded font-semibold text-sm transition shadow-lg">
                Voir les carnets de voyage →
              </Link>
              <Link href="/destinations" className="px-8 py-4 border-2 border-stone-300 hover:border-amber-900 text-stone-700 hover:text-amber-900 rounded font-semibold text-sm transition">
                Découvrir nos destinations →
              </Link>
            </div>
          </div>
        </section>

        {/* ── RÉASSURANCE FINALE ── */}
        <section className="py-12 bg-white border-t border-stone-100">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-stone-500 text-sm">
              Des questions ? Écris-nous à{' '}
              <a href="mailto:info@heldonica.fr" className="text-teal hover:underline font-medium">
                info@heldonica.fr
              </a>
            </p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}