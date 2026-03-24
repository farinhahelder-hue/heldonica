'use client'

import { useForm } from 'react-hook-form'
import { useState } from 'react'

type FormData = {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export default function ContactForm() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      // Envoyer à un endpoint (à configurer)
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        setSubmitted(true)
        reset()
        setTimeout(() => setSubmitted(false), 5000)
      }
    } catch (error) {
      console.error('Erreur envoi formulaire:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-charcoal mb-2">Nom *</label>
          <input
            {...register('name', { required: 'Le nom est requis' })}
            type="text"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eucalyptus"
            placeholder="Votre nom"
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-charcoal mb-2">Email *</label>
          <input
            {...register('email', { required: 'L\'email est requis', pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Email invalide' } })}
            type="email"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eucalyptus"
            placeholder="votre@email.com"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-charcoal mb-2">Téléphone</label>
        <input
          {...register('phone')}
          type="tel"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eucalyptus"
          placeholder="+33 6 12 34 56 78"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-charcoal mb-2">Sujet *</label>
        <select
          {...register('subject', { required: 'Veuillez sélectionner un sujet' })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eucalyptus"
        >
          <option value="">Sélectionnez un sujet</option>
          <option value="travel-planning">Travel Planning</option>
          <option value="hotel-consulting">Consulting Hôtelier</option>
          <option value="other">Autre</option>
        </select>
        {errors.subject && <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-charcoal mb-2">Message *</label>
        <textarea
          {...register('message', { required: 'Le message est requis' })}
          rows={5}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-eucalyptus"
          placeholder="Votre message..."
        />
        {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-8 py-3 bg-eucalyptus text-white rounded-lg hover:bg-teal transition font-semibold disabled:opacity-50"
      >
        {loading ? 'Envoi en cours...' : 'Envoyer le message'}
      </button>

      {submitted && (
        <div className="p-4 bg-green-100 text-green-800 rounded-lg">
          ✅ Merci ! Votre message a été envoyé avec succès.
        </div>
      )}
    </form>
  )
}
