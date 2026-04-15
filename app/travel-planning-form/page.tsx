'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

type FormData = {
  // Étape 1
  tripType: string
  vibe: string
  destination: string
  destinationDetail: string
  // Étape 2
  duration: string
  budget: string
  departureDate: string
  // Étape 3
  firstName: string
  email: string
  phone: string
  message: string
  honeypot: string
}

const INITIAL_FORM: FormData = {
  tripType: '',
  vibe: '',
  destination: '',
  destinationDetail: '',
  duration: '',
  budget: '',
  departureDate: '',
  firstName: '',
  email: '',
  phone: '',
  message: '',
  honeypot: '',
}

const STEPS = ['L\'Inspiration', 'Ton Voyage', 'Tes Coordonnées']

type RadioCardProps = {
  name: string
  value: string
  current: string
  onChange: (value: string) => void
  emoji?: string
  label: string
}

function RadioCard({ name, value, current, onChange, emoji, label }: RadioCardProps) {
  const selected = current === value
  return (
    <label
      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
        selected
          ? 'border-mahogany bg-mahogany/5 text-mahogany font-semibold'
          : 'border-gray-200 hover:border-mahogany/40 text-gray-700'
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={selected}
        onChange={() => onChange(value)}
        className="sr-only"
      />
      {emoji && <span className="text-xl">{emoji}</span>}
      <span>{label}</span>
      {selected && (
        <span className="ml-auto text-mahogany">✓</span>
      )}
    </label>
  )
}

export default function TravelPlanningForm() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const set = (field: keyof FormData, value: string) =>
    setForm((f) => ({ ...f, [field]: value }))

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const destinationFromQuery = searchParams.get('destination')
    if (!destinationFromQuery) return

    const normalized = destinationFromQuery.trim()
    if (!normalized) return

    setForm((prev) => {
      if (prev.destinationDetail) {
        return prev
      }

      const formatted = normalized.charAt(0).toUpperCase() + normalized.slice(1)
      return {
        ...prev,
        destination: 'Destination précise',
        destinationDetail: formatted,
      }
    })
  }, [])

  const canGoNext = () => {
    if (step === 1) return form.tripType && form.vibe && form.destination
    if (step === 2) return form.duration && form.budget
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.firstName || !form.email) {
      setError('Ton prénom et ton email sont nécessaires pour te répondre.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/travel-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Erreur serveur')
      setSubmitted(true)
    } catch {
      setError('Une erreur est survenue. Réessaie ou écris-nous directement à contact@heldonica.fr')
    } finally {
      setLoading(false)
    }
  }

  const progress = (step / 3) * 100

  // ── Page de confirmation ─────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white flex items-center justify-center px-4">
        <div className="max-w-lg mx-auto text-center py-16">
          <div className="text-6xl mb-6">✈️</div>
          <h1 className="text-3xl font-serif font-bold text-mahogany mb-4">
            C&apos;est parti, {form.firstName} !
          </h1>
          <p className="text-lg text-gray-600 mb-3">
            On a bien reçu ta demande et on la lit avec soin.
          </p>
          <p className="text-gray-500 mb-8">
            On te revient dans les <strong>48h</strong> avec une première proposition sur mesure adaptée à ta vibe <em>{form.vibe}</em>.
          </p>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-left mb-8">
            <p className="text-xs uppercase tracking-widest text-gray-400 mb-3">Récapitulatif</p>
            <p className="text-gray-700">🌍 <strong>{form.tripType}</strong> · {form.vibe}</p>
            <p className="text-gray-700">📍 {form.destination}{form.destinationDetail ? ` — ${form.destinationDetail}` : ''}</p>
            {form.duration && <p className="text-gray-700">⏳ {form.duration}</p>}
            {form.budget && <p className="text-gray-700">💶 {form.budget}</p>}
          </div>
          <Link
            href="/blog"
            className="inline-block bg-mahogany text-white px-8 py-3 rounded-xl font-medium hover:bg-red-900 transition"
          >
            Explorer le blog en attendant →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif font-bold text-mahogany mb-4">
            Confie-nous les clés de ta prochaine aventure.
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Un itinéraire sur-mesure, des pépites dénichées par des experts du terrain, zéro stress.
          </p>
          <p className="text-gray-500">2 min pour nous parler de toi · Réponse sous 48h</p>
        </div>

        {/* Barre de progression */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-mahogany">
              Étape {step} / 3 — {STEPS[step - 1]}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-mahogany h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8">

          {/* Honeypot anti-spam */}
          <input
            type="text"
            name="honeypot"
            value={form.honeypot}
            onChange={(e) => set('honeypot', e.target.value)}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* ── ÉTAPE 1 — L'Inspiration ─────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">
                🌍 Étape 1 : L&apos;Inspiration
              </h2>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  C&apos;est quel type d&apos;escapade ?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'Couple', emoji: '💑' },
                    { value: 'Solo', emoji: '🧭' },
                    { value: 'Amis', emoji: '🥂' },
                    { value: 'Lune de miel', emoji: '💍' },
                    { value: 'Famille', emoji: '👨‍👩‍👧' },
                    { value: 'Autre', emoji: '✨' },
                  ].map(({ value, emoji }) => (
                    <RadioCard
                      key={value}
                      name="tripType"
                      value={value}
                      current={form.tripType}
                      onChange={(v) => set('tripType', v)}
                      emoji={emoji}
                      label={value}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Quelle est la vibe recherchée ?
                </p>
                <div className="space-y-2">
                  {[
                    { value: 'Slow Travel & Détente', emoji: '🌿' },
                    { value: 'Aventure & Nature', emoji: '🏔️' },
                    { value: 'Culture & Gastronomie', emoji: '🎭' },
                    { value: 'Éco-responsable & Durable', emoji: '♻️' },
                    { value: 'Romantique & Intime', emoji: '🕯️' },
                  ].map(({ value, emoji }) => (
                    <RadioCard
                      key={value}
                      name="vibe"
                      value={value}
                      current={form.vibe}
                      onChange={(v) => set('vibe', v)}
                      emoji={emoji}
                      label={value}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Tu as déjà une destination en tête ?
                </p>
                <div className="space-y-2">
                  {[
                    { value: 'Destination précise', emoji: '📍' },
                    { value: 'Suggestions Heldonica', emoji: '🗺️' },
                    { value: 'Région/continent', emoji: '🌐' },
                  ].map(({ value, emoji }) => (
                    <RadioCard
                      key={value}
                      name="destination"
                      value={value}
                      current={form.destination}
                      onChange={(v) => set('destination', v)}
                      emoji={emoji}
                      label={value}
                    />
                  ))}
                </div>
                {form.destination && form.destination !== 'Suggestions Heldonica' && (
                  <input
                    type="text"
                    placeholder={
                      form.destination === 'Destination précise'
                        ? 'Ex : Madère, Sicile, Colombie…'
                        : 'Ex : Europe du Sud, Amérique Latine…'
                    }
                    value={form.destinationDetail}
                    onChange={(e) => set('destinationDetail', e.target.value)}
                    className="mt-3 w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-mahogany transition"
                  />
                )}
              </div>
            </div>
          )}

          {/* ── ÉTAPE 2 — Ton Voyage ───────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">
                📅 Étape 2 : Ton Voyage
              </h2>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Quelle durée envisages-tu ?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Week-end (2-3 jours)',
                    'Court séjour (4-6 jours)',
                    '1 semaine',
                    '2 semaines',
                    '3 semaines et +',
                    'Pas encore décidé·e',
                  ].map((v) => (
                    <RadioCard
                      key={v}
                      name="duration"
                      value={v}
                      current={form.duration}
                      onChange={(val) => set('duration', val)}
                      label={v}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Quel est votre budget global (par personne) ?
                </p>
                <div className="space-y-2">
                  {[
                    { value: 'Moins de 1 000 €', emoji: '💛' },
                    { value: '1 000 – 2 500 €', emoji: '💚' },
                    { value: '2 500 – 5 000 €', emoji: '💙' },
                    { value: '5 000 € et +', emoji: '💎' },
                    { value: 'Je préfère qu\'on en discute', emoji: '💬' },
                  ].map(({ value, emoji }) => (
                    <RadioCard
                      key={value}
                      name="budget"
                      value={value}
                      current={form.budget}
                      onChange={(v) => set('budget', v)}
                      emoji={emoji}
                      label={value}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date de départ envisagée (optionnel)
                </label>
                <input
                  type="month"
                  value={form.departureDate}
                  onChange={(e) => set('departureDate', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:border-mahogany transition"
                />
                <p className="text-xs text-gray-400 mt-1">Laisse vide si les dates sont flexibles</p>
              </div>
            </div>
          )}

          {/* ── ÉTAPE 3 — Tes Coordonnées ─────────────────────── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">
                📬 Étape 3 : Tes Coordonnées
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ton prénom <span className="text-mahogany">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex : Sophie"
                  value={form.firstName}
                  onChange={(e) => set('firstName', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-mahogany transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ton email <span className="text-mahogany">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="sophie@exemple.fr"
                  value={form.email}
                  onChange={(e) => set('email', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-mahogany transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Ton numéro (optionnel)
                </label>
                <input
                  type="tel"
                  placeholder="+33 6 …"
                  value={form.phone}
                  onChange={(e) => set('phone', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-mahogany transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Un mot sur ton voyage de rêve ? (optionnel)
                </label>
                <textarea
                  rows={4}
                  placeholder="Ce qui te fait rêver, des contraintes particulières, des envies précises… Tout est utile !"
                  value={form.message}
                  onChange={(e) => set('message', e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-mahogany transition resize-none"
                />
              </div>

              <p className="text-xs text-gray-400">
                * Champs obligatoires. Tes données ne sont jamais revendues et ne servent qu&apos;à concevoir ton itinéraire.
              </p>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-3 rounded-xl font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                ← Retour
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                disabled={!canGoNext()}
                className="flex-1 py-3 rounded-xl font-medium transition bg-mahogany text-white hover:bg-red-900 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant →
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl font-medium transition bg-mahogany text-white hover:bg-red-900 disabled:opacity-60"
              >
                {loading ? 'Envoi en cours…' : 'Envoyer ma demande 🌍'}
              </button>
            )}
          </div>
        </form>

      </div>
    </div>
  )
}
