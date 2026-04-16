'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'

type FormData = {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setSubmitError('')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('request_failed')
      }

      setSubmitted(true)
      reset()
      setTimeout(() => setSubmitted(false), 5000)
    } catch (error) {
      console.error('Erreur envoi formulaire:', error)
      setSubmitError("Le message n'a pas pu partir. Réessaie ici ou écris-nous directement à info@heldonica.fr.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-800">Nom *</label>
          <input
            {...register('name', { required: 'Le nom est requis.' })}
            type="text"
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 outline-none transition-all duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            placeholder="Ton nom"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-stone-800">Email *</label>
          <input
            {...register('email', {
              required: "L'email est requis.",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Adresse email invalide.',
              },
            })}
            type="email"
            className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 outline-none transition-all duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
            placeholder="toi@email.com"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-stone-800">Téléphone</label>
        <input
          {...register('phone')}
          type="tel"
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 outline-none transition-all duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          placeholder="Si tu veux qu'on te rappelle"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-stone-800">Sujet *</label>
        <select
          {...register('subject', { required: 'Choisis un sujet pour qu’on parte dans la bonne direction.' })}
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-stone-700 outline-none transition-all duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
        >
          <option value="">Choisir un sujet</option>
          <option value="travel-planning">Voyage sur mesure</option>
          <option value="hotel-consulting">Consulting hôtelier</option>
          <option value="partnership">Partenariat / média</option>
          <option value="other">Autre</option>
        </select>
        {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
      </div>

      <div>
        <label className="mb-2 block text-sm font-semibold text-stone-800">Message *</label>
        <textarea
          {...register('message', { required: 'Le message est requis.' })}
          rows={6}
          className="w-full rounded-3xl border border-stone-200 bg-white px-4 py-3 text-stone-700 outline-none transition-all duration-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
          placeholder="Raconte-nous le contexte: destination, timing, budget, énergie du moment, ce que tu veux éviter."
        />
        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-amber-900 px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Envoi en cours...' : 'Nous écrire →'}
      </button>

      {submitError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {submitted && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Merci. On a bien reçu ton message et on revient vers toi sous 48h.
        </div>
      )}
    </form>
  )
}
