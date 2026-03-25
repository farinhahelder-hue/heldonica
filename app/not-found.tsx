import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cloud-dancer">
      <div className="text-center">
        <h1 className="text-6xl font-serif font-bold text-mahogany mb-4">404</h1>
        <p className="text-2xl text-charcoal mb-8">Page non trouvée</p>
        <Link href="/" className="px-8 py-3 bg-eucalyptus text-white rounded-lg hover:bg-teal transition">
          Retour à l'accueil
        </Link>
      </div>
    </div>
  )
}
