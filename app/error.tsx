'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-[#f5f3ef] px-6">
        <div className="text-center max-w-lg">
          {/* Decorative element */}
          <div className="mb-8">
            <svg 
              width="80" 
              height="80" 
              viewBox="0 0 80 80" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="mx-auto"
            >
              <circle cx="40" cy="40" r="38" stroke="#01696f" strokeWidth="2" strokeDasharray="8 4"/>
              <path 
                d="M32 28l16 16M48 28L32 44" 
                stroke="#6b2a1a" 
                strokeWidth="3" 
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Error Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#6b2a1a]/10 mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4m0 4h.01M12 3l9 16H3L12 3z" stroke="#6b2a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Message */}
          <h1 className="text-3xl md:text-4xl font-serif text-[#6b2a1a] mb-4 leading-tight">
            Une erreur inattendue s&apos;est produite
          </h1>
          <p className="text-[#01696f]/80 text-base md:text-lg mb-8 leading-relaxed">
            Quelque chose n&apos;a pas fonctionn\u00e9 comme prévu. On s&apos;en occupe.
            Tu peux r\u00e9essayer ou revenir \u00e0 l&apos;accueil.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#6b2a1a] text-white font-semibold rounded-full hover:bg-[#6b2a1a]/90 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8a6 6 0 1 1 1.5 4M2 8V4m0 4H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              R\u00e9essayer
            </button>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#01696f] text-white font-semibold rounded-full hover:bg-[#01696f]/90 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Accueil
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}