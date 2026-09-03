import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-cloud-dancer px-6">
      <div className="text-center max-w-lg">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-mahogany/10 mb-6">
          <span className="text-3xl font-bold text-mahogany">404</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-mahogany mb-4">Cette page s&apos;est perdue en chemin…</h1>
        <p className="text-eucalyptus/80 text-base md:text-lg mb-8 leading-relaxed">
          On a cherché partout, mais elle semble avoir pris des chemins de traverse. Pas de panique, tu peux revenir à un endroit sûr.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-mahogany text-white font-semibold rounded-full hover:bg-mahogany/90 transition-colors">
            Retour à l&apos;accueil
          </Link>
          <Link href="/destinations" className="inline-flex items-center gap-2 px-6 py-3 bg-eucalyptus text-white font-semibold rounded-full hover:bg-eucalyptus/90 transition-colors">
            Découvrir nos destinations
          </Link>
        </div>
      </div>
    </main>
  )
}
