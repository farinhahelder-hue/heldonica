'use client'

import { useState } from 'react'

interface NewsletterBrevoProps {
  source?: string  // Pour l'attribution analytics (footer, blog, popup…)
}

export default function NewsletterBrevo({ source = 'footer' }: NewsletterBrevoProps) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Route canonique newsletter (J+0 Resend + J+3 + J+7 Brevo séquences)
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSubmitted(true)
        setEmail('')

        // GA4 — newsletter_inscription (event canonique Heldonica)
        if (typeof window !== 'undefined' && (window as any).gtag) {
          ;(window as any).gtag('event', 'newsletter_inscription', {
            event_category: 'Newsletter',
            source,
            value: 1,
          })
        }

        setTimeout(() => setSubmitted(false), 5000)
      } else {
        setError("Oups, quelque chose n'a pas fonctionné. Réessaie ou écris-nous à contact@heldonica.fr")
      }
    } catch (err) {
      setError('Erreur serveur — réessaie dans quelques secondes')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-gradient-to-r from-eucalyptus to-teal section-spacing">
      <div className="container max-w-2xl text-center">
        {/* Ton B2C : tutoiement, narratif, lexique Heldonica */}
        <h2 className="text-4xl font-serif font-bold text-white mb-3">
          Les pépites qu&apos;on ne publie nulle part ailleurs
        </h2>
        <p className="text-white/90 mb-8 text-lg leading-relaxed">
          Une adresse dénichée, un timing parfait, une erreur qu&apos;on a faite pour toi.<br />
          <span className="text-white/70 text-sm">Pas de spam. Juste du vrai, au rythme slow.</span>
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Ton email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            aria-label="Ton adresse email"
            className="flex-1 px-4 py-3 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-white text-eucalyptus font-semibold rounded-lg hover:bg-cloud-dancer transition disabled:opacity-50"
          >
            {loading ? 'Inscription…' : 'Je rejoins l\'aventure'}
          </button>
        </form>

        <p className="text-white/50 text-xs mt-4">
          Désinscription en 1 clic à tout moment.
        </p>

        {submitted && (
          <p className="text-white mt-4 text-sm font-medium">
            ✅ Bienvenue ! Vérifie ta boîte mail — on t&apos;a envoyé un premier message.
          </p>
        )}

        {error && (
          <p className="text-red-200 mt-4 text-sm">{error}</p>
        )}
      </div>
    </section>
  )
}
