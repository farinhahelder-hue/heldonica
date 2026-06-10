'use client'

import Link from 'next/link'
import Script from 'next/script'

const CTA_COLOR = '#2D8B8A' // Teal

/**
 * Bloc CTA pour le Travel Planning en fin d'article
 */
export default function CtaTravelPlanning() {
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'cta_travel_click', {
        source: 'article',
      })
    }
  }

  return (
    <section className="my-16 rounded-[2rem] px-6 py-12 md:px-12" style={{ backgroundColor: CTA_COLOR }}>
      <Script id="ga4-cta-travel" strategy="lazyOnload">{`
        window.trackCtaTravelClick = function(source) {
          if (typeof window !== 'undefined' && window.gtag) {
            window.gtag('event', 'cta_travel_click', { source: source || 'article' });
          }
        };
      `}</Script>
      <div className="mx-auto max-w-2xl text-center text-white">
        {/* Icône boussole */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            <svg 
              className="h-8 w-8" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" 
              />
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" 
              />
            </svg>
          </div>
        </div>
        
        {/* Texte principal */}
        <h2 className="mb-3 text-2xl font-serif font-light md:text-3xl">
          Tu veux qu&apos;on conçoive ton aventure sur mesure ?
        </h2>
        
        {/* Sous-titre */}
        <p className="mb-8 text-base leading-relaxed text-white/85">
          On prend en charge tout le planning, toi tu n&apos;as plus qu&apos;à partir.
        </p>
        
        {/* Bouton avec tracking */}
        <Link
          href="/travel-planning"
          onClick={handleClick}
          className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-[#2D8B8A] transition-all duration-200 hover:bg-white/90 hover:shadow-lg"
        >
          Découvrir le Travel Planning
          <svg 
            className="h-5 w-5" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
            strokeWidth={2}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M13 7l5 5m0 0l-5 5m5-5H6" 
            />
          </svg>
        </Link>
      </div>
    </section>
  )
}
