'use client'

import { useState } from 'react'
import Link from 'next/link'

const DESTINATIONS = [
  'Madère',
  'Roumanie / Transylvanie',
  'Sicile',
  'Monténégro',
  'Suisse',
  'Lisbonne',
  'Paris',
  'Autre / Je ne sais pas encore',
]

export default function PlanifierForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    destination: '',
    dates: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulate form submission (would connect to Brevo/email service)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSubmitted(true)
    setLoading(false)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-eucalyptus/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-eucalyptus" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-serif text-stone-900 mb-4">
          On a reçu ton message
        </h3>
        <p className="text-stone-600 mb-6">
          {formData.firstName ? `${formData.firstName}, on` : 'On'} te répond sous 48h avec nos premières idées.
        </p>
        <Link
          href="/destinations"
          className="inline-flex px-6 py-3 rounded-lg bg-mahogany text-white font-semibold hover:bg-mahogany/90 transition-colors"
        >
          Voir nos destinations →
        </Link>
      </div>
    )
  }

  return (
    <>
      <h2 className="text-2xl font-serif text-stone-900 mb-2 text-center">
        Raconte-nous ton voyage rêvé
      </h2>
      <p className="text-stone-500 text-center mb-8">On te répond sous 48h.</p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-stone-700 mb-2">
              Ton prénom
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              placeholder="Marie"
              className="w-full rounded-xl border border-stone-200 px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-400 outline-none transition bg-stone-50"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-2">
              Ton email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="marie@exemple.com"
              className="w-full rounded-xl border border-stone-200 px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-400 outline-none transition bg-stone-50"
            />
          </div>
        </div>

        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-stone-700 mb-2">
            Destination rêvée
          </label>
          <select
            id="destination"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            className="w-full rounded-xl border border-stone-200 px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-400 outline-none transition bg-stone-50"
          >
            <option value="">Choisir une destination</option>
            {DESTINATIONS.map((dest) => (
              <option key={dest} value={dest}>{dest}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dates" className="block text-sm font-medium text-stone-700 mb-2">
            Quand ? (optionnel)
          </label>
          <input
            type="text"
            id="dates"
            name="dates"
            value={formData.dates}
            onChange={handleChange}
            placeholder="Juin 2026, 10 jours..."
            className="w-full rounded-xl border border-stone-200 px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-400 outline-none transition bg-stone-50"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-2">
            Ce qui te tarde de découvrir
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            placeholder="Ce qu'on recherche, ce qu'on veut éviter, le genre d'expérience qu'on veut vivre..."
            className="w-full rounded-xl border border-stone-200 px-4 py-3 focus:ring-2 focus:ring-amber-500 focus:border-amber-400 outline-none transition resize-none bg-stone-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-xl bg-amber-700 text-white font-semibold hover:bg-amber-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Envoi en cours...
            </>
          ) : (
            'Envoyer ma demande →'
          )}
        </button>
      </form>
    </>
  )
}