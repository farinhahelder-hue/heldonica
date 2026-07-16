'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useContentLoader } from '@/hooks/useContentLoader'
import type { CmsZone } from '@/lib/content-loader'

type FormData = {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

const inputClass =
  'w-full rounded-xl border border-cloud-dancer bg-white px-4 py-3 text-charcoal/80 outline-none transition-all duration-200 focus:border-eucalyptus focus:ring-2 focus:ring-eucalyptus/20'

export default function ContactForm() {
  const { zones, settings } = useContentLoader()
  const z = zones as Record<string, CmsZone>

  function val(zoneKey: string, fallback: string): string {
    return z[zoneKey]?.value || settings?.[zoneKey] || fallback
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const labels = {
    name: val('contact_form_name_label', 'Nom *'),
    email: val('contact_form_email_label', 'Email *'),
    phone: val('contact_form_phone_label', 'Téléphone'),
    subject: val('contact_form_subject_label', 'Sujet *'),
    message: val('contact_form_message_label', 'Message *'),
  }

  const placeholders = {
    name: val('contact_form_name_placeholder', 'Ton nom'),
    email: val('contact_form_email_placeholder', 'toi@email.fr'),
    phone: val('contact_form_phone_placeholder', "Si tu veux qu'on te rappelle"),
    subject: val('contact_form_subject_placeholder', 'Choisir un sujet'),
    message: val('contact_form_message_placeholder', "Raconte-nous le contexte: destination, timing, budget, énergie du moment, ce que tu veux éviter."),
  }

  const errorsMsg = {
    name: val('contact_form_error_name', 'Le nom est requis.'),
    email_required: val('contact_form_error_email_required', "L'email est requis."),
    email_invalid: val('contact_form_error_email_invalid', 'Adresse email invalide.'),
    subject_required: val('contact_form_error_subject', "Choisis un sujet pour qu'on parte dans la bonne direction."),
  }

  const btnLabel = val('contact_form_submit', 'Nous écrire →')
  const btnLoading = val('contact_form_submit_loading', 'Envoi en cours...')
  const successMsg = val('contact_form_success', 'Merci. On a bien reçu ton message et on revient vers toi sous 48h.')
  const errorFallback = val('contact_form_error_generic', "Le message n'a pas pu partir. Réessaie ici ou écris-nous directement à contact@heldonica.fr.")

  const subjectOptions = [
    { value: '', label: val('contact_form_subject_option_placeholder', 'Choisir un sujet') },
    { value: 'travel-planning', label: val('contact_form_subject_option_travel', 'Voyage sur mesure') },
    { value: 'partnership', label: val('contact_form_subject_option_partnership', 'Partenariat / média') },
    { value: 'other', label: val('contact_form_subject_option_other', 'Autre') },
  ]

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
      setSubmitError(errorFallback)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-2xl space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mb-2 block text-sm font-semibold text-charcoal/90">{labels.name}</label>
          <input
            id="cf-name"
            {...register('name', { required: errorsMsg.name })}
            type="text"
            className={inputClass}
            placeholder={placeholders.name}
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="cf-email" className="mb-2 block text-sm font-semibold text-charcoal/90">{labels.email}</label>
          <input
            id="cf-email"
            {...register('email', {
              required: errorsMsg.email_required,
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: errorsMsg.email_invalid,
              },
            })}
            type="email"
            className={inputClass}
            placeholder={placeholders.email}
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="cf-phone" className="mb-2 block text-sm font-semibold text-charcoal/90">{labels.phone}</label>
        <input
          id="cf-phone"
          {...register('phone')}
          type="tel"
          className={inputClass}
          placeholder={placeholders.phone}
        />
      </div>

      <div>
        <label htmlFor="cf-subject" className="mb-2 block text-sm font-semibold text-charcoal/90">{labels.subject}</label>
        <select
          id="cf-subject"
          {...register('subject', {
            required: errorsMsg.subject_required,
          })}
          className={inputClass}
        >
          {subjectOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>}
      </div>

      <div>
        <label htmlFor="cf-message" className="mb-2 block text-sm font-semibold text-charcoal/90">{labels.message}</label>
        <textarea
          id="cf-message"
          {...register('message', { required: 'Le message est requis.' })}
          rows={6}
          className={inputClass}
          placeholder={placeholders.message}
        />
        {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-mahogany px-8 py-4 text-sm font-semibold text-white transition-all duration-200 hover:bg-mahogany/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? btnLoading : btnLabel}
      </button>

      {submitError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </div>
      )}

      {submitted && (
        <div className="rounded-xl border border-eucalyptus/20 bg-eucalyptus/5 px-4 py-3 text-sm text-eucalyptus">
          {successMsg}
        </div>
      )}
    </form>
  )
}
