'use client'

import { useState } from 'react'

export default function NewsletterBrevo() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Envoyer à Brevo via API
      const response = await fetch('/api/brevo/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setSubmitted(true)
        setEmail('')
        setTimeout(() => setSubmitted(false), 5000)
      } else {
        setError('Erreur lors de l\'inscription')
      }
    } catch (err) {
      setError('Erreur serveur')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="bg-gradient-to-r from-eucalyptus to-teal section-spacing">
      <div className="container max-w-2xl text-center">
        <h2 className="text-4xl font-serif font-bold text-white mb-4">
          Restez informé
        </h2>
        <p className="text-white/90 mb-8 text-lg">
          Pépites exclusives + 1 guide PDF/mois
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            placeholder="Votre email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-white disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-white text-eucalyptus font-semibold rounded-lg hover:bg-cloud-dancer transition disabled:opacity-50"
          >
            {loading ? 'Inscription...' : 'S\'abonner'}
          </button>
        </form>

        {submitted && (
          <p className="text-white mt-4 text-sm">✅ Merci ! Vérifiez votre email pour confirmer.</p>
        )}

        {error && (
          <p className="text-red-200 mt-4 text-sm">{error}</p>
        )}
      </div>
    </section>
  )
}
