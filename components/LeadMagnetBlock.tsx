'use client'

import { useState } from 'react'
import { Download, CheckCircle2, Loader2, FileText } from 'lucide-react'
import { trackEvent } from '@/lib/analytics'

interface LeadMagnetBlockProps {
  destinationSlug: string
  destinationName: string
  className?: string
}

export default function LeadMagnetBlock({
  destinationSlug,
  destinationName,
  className = '',
}: LeadMagnetBlockProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/guides/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationSlug, email }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Erreur')
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `guide-${destinationSlug}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setStatus('success')
      trackEvent('guidepdftelecharge', {
        destination: destinationSlug,
        destination_name: destinationName,
      })
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'Erreur lors du téléchargement')
    }
  }

  if (status === 'success') {
    return (
      <section className={`bg-gradient-to-br from-eucalyptus/5 via-eucalyptus/10 to-amber-50 py-16 md:py-20 ${className}`}>
        <div className="container max-w-2xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-eucalyptus/10 mb-6">
            <CheckCircle2 size={32} className="text-eucalyptus" />
          </div>
          <h3 className="text-2xl font-serif text-mahogany mb-3">
            C'est parti pour {destinationName} !
          </h3>
          <p className="text-charcoal/70 mb-4">
            Ton guide a été téléchargé. Vérifie aussi ta boîte mail — on t'a envoyé une copie pour le retrouver facilement.
          </p>
          <p className="text-sm text-stone-500">
            Tu restes inscrit·e à la newsletter pour recevoir nos prochains guides en avant-première.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className={`bg-gradient-to-br from-stone-50 via-amber-50/30 to-eucalyptus/5 py-16 md:py-20 ${className}`}>
      <div className="container max-w-2xl">
        {/* Badge */}
        <div className="flex justify-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-eucalyptus/10 text-eucalyptus text-xs font-semibold">
            <FileText size={14} />
            Guide gratuit
          </span>
        </div>

        {/* Titre */}
        <h3 className="text-2xl md:text-3xl font-serif text-mahogany text-center mb-3">
          Télécharge le guide pratique pour garder l'essentiel sous la main
        </h3>

        {/* Promesse */}
        <p className="text-charcoal/70 text-center mb-8 max-w-lg mx-auto">
          On t'a préparé une version claire et utile à consulter avant de partir.
          Parfait pour retrouver nos pépites dénichées, le budget, les étapes et les repères terrain.
        </p>

        {/* 3 Bénéfices */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mb-3">
              <span className="text-amber-600 text-sm">💰</span>
            </div>
            <p className="text-sm font-semibold text-mahogany">Budget réaliste</p>
            <p className="text-xs text-charcoal/60 mt-1">Les vrais prix qu'on a payés, pas des estimations</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-teal/10 flex items-center justify-center mb-3">
              <span className="text-teal text-sm">📍</span>
            </div>
            <p className="text-sm font-semibold text-mahogany">Nos adresses testées</p>
            <p className="text-xs text-charcoal/60 mt-1">Chaque lieu qu'on te recommande, on y est allés</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm">
            <div className="w-8 h-8 rounded-full bg-eucalyptus/10 flex items-center justify-center mb-3">
              <span className="text-eucalyptus text-sm">🗺️</span>
            </div>
            <p className="text-sm font-semibold text-mahogany">Itinéraire clé en main</p>
            <p className="text-xs text-charcoal/60 mt-1">Jour par jour, avec nos tips terrain</p>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="max-w-sm mx-auto">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.fr"
              required
              disabled={status === 'loading'}
              className="flex-1 px-5 py-3.5 rounded-xl border border-stone-200 bg-white text-charcoal placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3.5 bg-eucalyptus text-white font-semibold rounded-xl hover:bg-eucalyptus/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {status === 'loading' ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Je veux le guide
                </>
              )}
            </button>
          </div>
          {errorMsg && (
            <p className="text-red-500 text-sm mt-3 text-center">{errorMsg}</p>
          )}
        </form>

        {/* Réassurance */}
        <p className="text-stone-400 text-xs text-center mt-4">
          Gratuit · On t'envoie le guide, tu restes inscrit·e à la newsletter · Désinscription à tout moment
        </p>
      </div>
    </section>
  )
}
