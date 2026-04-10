'use client'
import Link from 'next/link'

export default function MerciPage() {
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-24">
      <div className="max-w-xl mx-auto text-center">
        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-3">Demande bien reçue 🌿</p>
        <h1 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-4">On est sur le coup !</h1>
        <p className="text-stone-600 leading-relaxed mb-6">
          Ta demande est entre nos mains. On te répond <strong>sous 48h</strong> avec une proposition sur mesure.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/blog" className="px-6 py-3 bg-amber-900 hover:bg-amber-800 text-white rounded font-semibold text-sm transition">
            Découvrir nos carnets de voyage
          </Link>
          <a href="https://www.instagram.com/heldonica/" target="_blank" rel="noopener noreferrer"
            className="px-6 py-3 border border-stone-300 hover:border-amber-900 hover:text-amber-900 text-stone-700 rounded font-semibold text-sm transition">
            Nous suivre sur Instagram
          </a>
        </div>
        <div className="mt-10 p-5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-stone-700">
          <p className="font-semibold text-amber-900 mb-1">📬 Pas de réponse reçue ?</p>
          <p>Vérifie ton dossier spam ou écris-nous à <a href="mailto:info@heldonica.fr" className="text-amber-800 underline">info@heldonica.fr</a></p>
        </div>
      </div>
    </main>
  )
}