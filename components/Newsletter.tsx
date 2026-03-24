'use client'

import { useState } from 'react'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // Brevo integration would go here
    setSubmitted(true)
    setEmail('')
    setTimeout(() => setSubmitted(false), 3000)
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
            className="flex-1 px-4 py-3 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-white"
          />
          <button
            type="submit"
            className="px-8 py-3 bg-white text-eucalyptus font-semibold rounded-lg hover:bg-cloud-dancer transition"
          >
            S'abonner
          </button>
        </form>

        {submitted && (
          <p className="text-white mt-4 text-sm">✅ Merci ! Vérifiez votre email.</p>
        )}
      </div>
    </section>
  )
}
