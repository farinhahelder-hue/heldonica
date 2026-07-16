import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center bg-cloud-dancer px-6">
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
              <circle cx="40" cy="40" r="38" stroke="#006D77" strokeWidth="2" strokeDasharray="8 4"/>
              <path
                d="M28 40h24M40 28v24"
                stroke="#6B2D1F"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* 404 Badge */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-mahogany/10 mb-6">
            <span className="text-3xl font-bold text-mahogany">404</span>
          </div>

          {/* Message */}
          <h1 className="text-3xl md:text-4xl font-serif text-mahogany mb-4 leading-tight">
            Cette page s&apos;est perdue en chemin...
          </h1>
          <p className="text-eucalyptus/80 text-base md:text-lg mb-8 leading-relaxed">
            On a cherché partout, mais elle semble avoir pris des chemins de traverse.
            Pas de panique, tu peux revenir à un endroit sûr.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-mahogany text-white font-semibold rounded-full hover:bg-mahogany/90 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 px-6 py-3 bg-eucalyptus text-white font-semibold rounded-full hover:bg-eucalyptus/90 transition-colors"
            >
              Découvrir nos destinations
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
