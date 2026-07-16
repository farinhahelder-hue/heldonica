'use client'

import { useState } from 'react'
import { Download, Loader2, CheckCircle } from 'lucide-react'

interface LeadMagnetBlockProps {
  destinationSlug: string
  destinationName: string
}

export default function LeadMagnetBlock({
  destinationSlug,
  destinationName,
}: LeadMagnetBlockProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorMsg('Merci d\'entrer une adresse email valide')
      return
    }

    setStatus('loading')
    setErrorMsg('')

    try {
      // GA4 — guide_pdf_telecharge (event canonique Heldonica)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'guide_pdf_telecharge', {
          event_category: 'Lead Magnet',
          destination: destinationSlug,
          event_label: `guide-${destinationSlug}`,
        })
        // GA4 — newsletter_inscription (le lead magnet capte l'email pour Brevo/Newsletter)
        ;(window as any).gtag('event', 'newsletter_inscription', {
          event_category: 'Newsletter',
          source: 'lead_magnet_block',
          destination: destinationSlug,
        })
      }

      const response = await fetch('/api/guides/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationSlug, email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Erreur lors du téléchargement')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `guide-${destinationSlug}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Une erreur est survenue')
    }
  }

  if (status === 'success') {
    return (
      <section className="bg-white py-16 md:py-20 border-y border-stone-100">
        <div className="container max-w-3xl">
          <div className="bg-gradient-to-br from-eucalyptus/5 via-white to-amber-50/30 rounded-2xl p-8 md:p-10 border border-eucalyptus/10 text-center">
            <CheckCircle size={48} className="mx-auto text-eucalyptus mb-4" />
            <h2 className="text-2xl md:text-3xl font-serif text-mahogany mb-3">
              C&apos;est parti ! 
            </h2>
            <p className="text-charcoal/70">
              Le guide {destinationName} arrive dans ta boîte mail.{' '}
              <span className="text-charcoal/50">Vérifie tes spams si tu ne le vois pas dans les 2 minutes.</span>
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white py-16 md:py-20 border-y border-stone-100">
      <div className="container max-w-3xl">
        <div className="bg-gradient-to-br from-eucalyptus/5 via-white to-amber-50/30 rounded-2xl p-8 md:p-10 border border-eucalyptus/10">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-serif text-mahogany mb-3">
              Télécharge le guide pratique pour garder l&apos;essentiel sous la main
            </h2>
            <p className="text-charcoal/70 leading-relaxed">
              On t&apos;a préparé une version claire et utile à consulter avant de partir.
            </p>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl p-5 border border-stone-100 text-center">
              <span className="text-3xl mb-3 block" role="img" aria-label="Budget">💰</span>
              <p className="text-sm font-semibold text-charcoal">Budget réaliste</p>
              <p className="text-xs text-charcoal/60 mt-1">Les vrais prix qu&apos;on a payés</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-stone-100 text-center">
              <span className="text-3xl mb-3 block" role="img" aria-label="Localisation">📍</span>
              <p className="text-sm font-semibold text-charcoal">Nos adresses testées</p>
              <p className="text-xs text-charcoal/60 mt-1">Chaque lieu qu&apos;on recommande, on y est allés</p>
            </div>
            <div className="bg-white rounded-xl p-5 border border-stone-100 text-center">
              <span className="text-3xl mb-3 block" role="img" aria-label="Carte">🗺️</span>
              <p className="text-sm font-semibold text-charcoal">Itinéraire clé en main</p>
              <p className="text-xs text-charcoal/60 mt-1">Jour par jour, avec nos tips terrain</p>
            </div>
          </div>

          {/* Email Form CTA */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                aria-label="Ton adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.fr"
                required
                className="flex-1 px-4 py-3 rounded-xl border border-stone-200 focus:border-eucalyptus focus:ring-2 focus:ring-eucalyptus/20 outline-none text-charcoal"
                disabled={status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-all shadow-lg shadow-eucalyptus/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Download size={18} />
                    Je veux le guide
                  </>
                )}
              </button>
            </div>
            {errorMsg && (
              <p className="text-red-500 text-sm mt-2 text-center">{errorMsg}</p>
            )}
            <p className="text-xs text-charcoal/50 mt-4 text-center">
              Gratuit · Tu restes inscrit·e à la newsletter · Désinscription à tout moment
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
