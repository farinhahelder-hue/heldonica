'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

const PAGE = "travel-planning-form";

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

const STEPS = ["L'Inspiration", "Ton Voyage", "Tes Coordonnées"]

type RadioCardProps = {
  name: string
  value: string
  current: string
  onChange: (value: string) => void
  emoji?: React.ReactNode
  label: React.ReactNode
}

function RadioCard({ name, value, current, onChange, emoji, label }: RadioCardProps) {
  const selected = current === value
  return (
    <label
      className={`flex items-center gap-3 p-4 rounded-full border-2 cursor-pointer transition-all ${
        selected
          ? 'border-mahogany bg-mahogany/5 text-mahogany font-semibold'
          : 'border-charcoal/10 hover:border-mahogany/40 text-charcoal/70'
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

const TRIP_TYPES = [
  { value: "Couple", emoji: "💑", zone: "trip_1" },
  { value: "Solo", emoji: "🧭", zone: "trip_2" },
  { value: "Amis", emoji: "🥂", zone: "trip_3" },
  { value: "Lune de miel", emoji: "💍", zone: "trip_4" },
  { value: "Famille", emoji: "👨‍👩‍👧", zone: "trip_5" },
  { value: "Autre", emoji: "✨", zone: "trip_6" },
]

const VIBES = [
  { value: "Slow Travel & Détente", emoji: "🌿", zone: "vibe_1" },
  { value: "Aventure & Nature", emoji: "🏔️", zone: "vibe_2" },
  { value: "Culture & Gastronomie", emoji: "🎭", zone: "vibe_3" },
  { value: "Éco-responsable & Durable", emoji: "♻️", zone: "vibe_4" },
  { value: "Romantique & Intime", emoji: "🕯️", zone: "vibe_5" },
]

const DEST_OPTIONS = [
  { value: "Destination précise", emoji: "📍", zone: "dest_1" },
  { value: "Suggestions Heldonica", emoji: "🗺️", zone: "dest_2" },
  { value: "Région/continent", emoji: "🌐", zone: "dest_3" },
]

const DURATIONS = [
  { value: "Week-end (2-3 jours)", zone: "duration_1_label" },
  { value: "Court séjour (4-6 jours)", zone: "duration_2_label" },
  { value: "1 semaine", zone: "duration_3_label" },
  { value: "2 semaines", zone: "duration_4_label" },
  { value: "3 semaines et +", zone: "duration_5_label" },
  { value: "Pas encore décidé·e", zone: "duration_6_label" },
]

const BUDGETS = [
  { value: "Moins de 1 000 €", emoji: "💛", zone: "budget_1" },
  { value: "1 000 – 2 500 €", emoji: "💚", zone: "budget_2" },
  { value: "2 500 – 5 000 €", emoji: "💙", zone: "budget_3" },
  { value: "5 000 € et +", emoji: "💎", zone: "budget_4" },
  { value: "Je préfère qu'on en discute", emoji: "💬", zone: "budget_5" },
]

export default function TravelPlanningForm() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState<FormData>(INITIAL_FORM)
  const [loading, setLoading] = useState(false)
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
      
      // GA4 — Événement formulaire_travel_soumis
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', 'formulaire_travel_soumis', {
          event_category: 'Travel Planning',
          event_label: form.destination || 'Non précisé',
          value: 1,
        })
      }
      
      router.push('/merci')
    } catch {
      setError('Une erreur est survenue. Réessaie ou écris-nous directement à contact@heldonica.fr')
    } finally {
      setLoading(false)
    }
  }

  const progress = (step / 3) * 100

  const Z = (zone: string, type: 'text' | 'textarea' | 'html', fallback: string, className?: string, as?: any) => (
    <EditableZone page={PAGE} zone={zone} type={type} fallback={fallback} className={className} as={as} />
  )

  return (
    <InlineEditProvider page={PAGE}>
      <div className="min-h-screen bg-cloud-dancer py-12 px-4">
        <div className="max-w-2xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-serif font-light text-mahogany mb-4">
              {Z('hero_title_1', 'text', "Dis-nous où tu veux aller.", undefined, 'span')}<br />
              <em className="text-mahogany">{Z('hero_title_2', 'text', "On s'occupe du reste.", undefined, 'span')}</em>
            </h1>
            <p className="text-base text-charcoal/60 mb-2">
              {Z('hero_description', 'textarea', "Pas d'itinéraire copié-collé. Un voyage conçu sur mesure, à partir de ce que tu vis vraiment.", undefined, 'span')}
            </p>
            <p className="text-charcoal/40 text-sm">{Z('hero_note', 'text', "2 min · Sans engagement · Réponse sous 48h", undefined, 'span')}</p>
          </div>

          {/* Barre de progression */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-semibold text-mahogany">
                Étape {step} / 3 — {Z('step_name_' + step, 'text', STEPS[step - 1], undefined, 'span')}
              </span>
              <span className="text-sm text-charcoal/50">{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-charcoal/10 rounded-full h-2">
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

            {/* ── ÉTAPE 1 — L’Inspiration ─────────────────────────── */}
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">
                  🌍 {Z('step_1_title', 'text', "Étape 1 : L'Inspiration", undefined, 'span')}
                </h2>

                <div>
                  <p className="text-sm font-semibold text-charcoal/70 mb-3">
                    {Z('q_trip_type', 'textarea', "C'est quel type d'escapade ?", undefined, 'span')}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
              {TRIP_TYPES.map((opt) => (
                <RadioCard
                  key={opt.value}
                  name="tripType"
                  value={opt.value}
                  current={form.tripType}
                  onChange={(v) => set('tripType', v)}
                  emoji={Z(opt.zone + '_emoji', 'text', opt.emoji, undefined, 'span')}
                  label={Z(opt.zone + '_label', 'textarea', opt.value, undefined, 'span')}
                />
              ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-charcoal/70 mb-3">
                    {Z('q_vibe', 'textarea', "Quelle est la vibe recherchée ?", undefined, 'span')}
                  </p>
                  <div className="space-y-2">
              {VIBES.map((opt) => (
                <RadioCard
                  key={opt.value}
                  name="vibe"
                  value={opt.value}
                  current={form.vibe}
                  onChange={(v) => set('vibe', v)}
                  emoji={Z(opt.zone + '_emoji', 'text', opt.emoji, undefined, 'span')}
                  label={Z(opt.zone + '_label', 'textarea', opt.value, undefined, 'span')}
                />
              ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-charcoal/70 mb-3">
                    {Z('q_destination', 'textarea', "Tu as déjà une destination en tête ?", undefined, 'span')}
                  </p>
                  <div className="space-y-2">
              {DEST_OPTIONS.map((opt) => (
                <RadioCard
                  key={opt.value}
                  name="destination"
                  value={opt.value}
                  current={form.destination}
                  onChange={(v) => set('destination', v)}
                  emoji={Z(opt.zone + '_emoji', 'text', opt.emoji, undefined, 'span')}
                  label={Z(opt.zone + '_label', 'textarea', opt.value, undefined, 'span')}
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
                      className="mt-3 w-full border border-charcoal/10 rounded-full px-4 py-3 text-charcoal/70 focus:outline-none focus:border-mahogany transition"
                    />
                  )}
                </div>
              </div>
            )}

            {/* ── ÉTAPE 2 — Ton Voyage ───────────────────────────── */}
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">
                  📅 {Z('step_2_title', 'text', "Étape 2 : Ton Voyage", undefined, 'span')}
                </h2>

                <div>
                  <p className="text-sm font-semibold text-charcoal/70 mb-3">
                    {Z('q_duration', 'textarea', "Quelle durée envisages-tu ?", undefined, 'span')}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
              {DURATIONS.map((opt) => (
                <RadioCard
                  key={opt.value}
                  name="duration"
                  value={opt.value}
                  current={form.duration}
                  onChange={(v) => set('duration', v)}
                  
                  label={Z(opt.zone + '_label', 'textarea', opt.value, undefined, 'span')}
                />
              ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-charcoal/70 mb-3">
                    {Z('q_budget', 'textarea', "Quel est ton budget global pour le voyage ?", undefined, 'span')}
                  </p>
                  <div className="space-y-2">
              {BUDGETS.map((opt) => (
                <RadioCard
                  key={opt.value}
                  name="budget"
                  value={opt.value}
                  current={form.budget}
                  onChange={(v) => set('budget', v)}
                  emoji={Z(opt.zone + '_emoji', 'text', opt.emoji, undefined, 'span')}
                  label={Z(opt.zone + '_label', 'textarea', opt.value, undefined, 'span')}
                />
              ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="tpf-departureDate" className="block text-sm font-semibold text-charcoal/70 mb-2">
                    {Z('date_label', 'text', "Date de départ envisagée (optionnel)", undefined, 'span')}
                  </label>
                  <input
                    id="tpf-departureDate"
                    type="month"
                    value={form.departureDate}
                    onChange={(e) => set('departureDate', e.target.value)}
                    className="w-full border border-charcoal/10 rounded-full px-4 py-3 text-charcoal/70 focus:outline-none focus:border-mahogany transition"
                  />
                  <p className="text-xs text-charcoal/40 mt-1">{Z('date_hint', 'text', "Laisse vide si les dates sont flexibles", undefined, 'span')}</p>
                </div>
              </div>
            )}

            {/* ── ÉTAPE 3 — Tes Coordonnées ─────────────────────── */}
            {step === 3 && (
              <div className="space-y-5">
                <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">
                  📬 {Z('step_3_title', 'text', "Étape 3 : Tes Coordonnées", undefined, 'span')}
                </h2>

                <div>
                  <label htmlFor="tpf-firstName" className="block text-sm font-semibold text-charcoal/70 mb-2">
                    {Z('fname_label', 'text', "Ton prénom", undefined, 'span')} <span className="text-mahogany">*</span>
                  </label>
                  <input
                    id="tpf-firstName"
                    type="text"
                    required
                    placeholder="Ex : Sophie"
                    value={form.firstName}
                    onChange={(e) => set('firstName', e.target.value)}
                    className="w-full border border-charcoal/10 rounded-full px-4 py-3 focus:outline-none focus:border-mahogany transition"
                  />
                </div>

                <div>
                  <label htmlFor="tpf-email" className="block text-sm font-semibold text-charcoal/70 mb-2">
                    {Z('email_label', 'text', "Ton email", undefined, 'span')} <span className="text-mahogany">*</span>
                  </label>
                  <input
                    id="tpf-email"
                    type="email"
                    required
                    placeholder="sophie@exemple.fr"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    className="w-full border border-charcoal/10 rounded-full px-4 py-3 focus:outline-none focus:border-mahogany transition"
                  />
                </div>

                <div>
                  <label htmlFor="tpf-phone" className="block text-sm font-semibold text-charcoal/70 mb-2">
                    {Z('phone_label', 'text', "Ton numéro (optionnel)", undefined, 'span')}
                  </label>
                  <input
                    id="tpf-phone"
                    type="tel"
                    placeholder="+33 6 …"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    className="w-full border border-charcoal/10 rounded-full px-4 py-3 focus:outline-none focus:border-mahogany transition"
                  />
                </div>

                <div>
                  <label htmlFor="tpf-message" className="block text-sm font-semibold text-charcoal/70 mb-2">
                    {Z('msg_label', 'text', "Un mot sur ton voyage de rêve ? (optionnel)", undefined, 'span')}
                  </label>
                  <textarea
                    id="tpf-message"
                    rows={4}
                    placeholder="Ce qui te fait rêver, des contraintes particulières, des envies précises… Tout est utile !"
                    value={form.message}
                    onChange={(e) => set('message', e.target.value)}
                    className="w-full border border-charcoal/10 rounded-full px-4 py-3 focus:outline-none focus:border-mahogany transition resize-none"
                  />
                </div>

                <p className="text-xs text-charcoal/40">
                  {Z('footnote', 'textarea', "* Champs obligatoires. Tes données ne sont jamais revendues et ne servent qu'à concevoir ton itinéraire.", undefined, 'span')}
                </p>
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-full text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="px-5 py-3 rounded-full font-medium border border-charcoal/10 text-charcoal/60 hover:bg-cloud-dancer transition"
                >
                  ← {Z('nav_back', 'text', "Retour", undefined, 'span')}
                </button>
              )}
              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={!canGoNext()}
                  className="flex-1 py-3 rounded-full font-medium transition bg-mahogany text-white hover:bg-mahogany/90 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {Z('nav_next', 'text', "Suivant", undefined, 'span')} →
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 rounded-full font-medium transition bg-mahogany text-white hover:bg-mahogany/90 disabled:opacity-60"
                >
                  {loading ? Z('nav_sending', 'text', "Envoi en cours…", undefined, 'span') : Z('nav_submit', 'text', "Envoyer ma demande", undefined, 'span') + ' 🌍'}
                </button>
              )}
            </div>
          </form>

        </div>
      </div>
    </InlineEditProvider>
  )
}
