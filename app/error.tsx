'use client'

import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cloud-dancer">
      <div className="text-center">
        <h1 className="text-6xl font-serif font-bold text-mahogany mb-4">Erreur</h1>
        <p className="text-xl text-charcoal mb-8">Une erreur s'est produite</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 bg-eucalyptus text-white rounded-lg hover:bg-teal transition"
          >
            Réessayer
          </button>
          <Link href="/" className="px-8 py-3 bg-gray-300 text-charcoal rounded-lg hover:bg-gray-400 transition">
            Accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
