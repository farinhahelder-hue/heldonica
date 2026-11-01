'use client'

import { useState, useEffect } from 'react'
import { PhoneCall, Clock, ShieldCheck, X, Check, ArrowRight } from 'lucide-react'

interface DiscoveryCallModalProps {
  isOpen: boolean
  onClose: () => void
  defaultAudience?: 'voyageur' | 'hotelier'
  calUrl?: string
}

export default function DiscoveryCallModal({
  isOpen,
  onClose,
  defaultAudience = 'voyageur',
  calUrl = 'https://cal.com/heldonica/decouverte-20min',
}: DiscoveryCallModalProps) {
  const [audience, setAudience] = useState<'voyageur' | 'hotelier'>(defaultAudience)
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [slot, setSlot] = useState('Matinée (9h - 12h)')
  const [notes, setNotes] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('') // Honeypot
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setAudience(defaultAudience)
  }, [defaultAudience])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = 'auto'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (websiteUrl) {
      setSuccess(true)
      return
    }

    setLoading(true)
    setError('')

    try {
      const endpoint = audience === 'hotelier' ? '/api/expert-hotelier' : '/api/travel-planning'
      const payload =
        audience === 'hotelier'
          ? {
              name: firstName,
              email,
              phone,
              hotelType: 'Appel découverte 20 min',
              message: `Créneau souhaité: ${slot}. Projet: ${notes || 'Non renseigné'}`,
              website_url: websiteUrl,
            }
          : {
              firstName,
              email,
              phone,
              tripType: 'appel_decouverte_20min',
              duration: slot,
              message: `Appel découverte 20 min en duo. Créneau souhaité: ${slot}. Détails: ${notes || 'Non renseigné'}`,
              website_url: websiteUrl,
            }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        throw new Error('Une erreur est survenue lors de la confirmation.')
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || 'Erreur réseau, réessayez dans quelques instants.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Réserver un appel découverte de 20 minutes"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241D1A]/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-6 md:p-8 text-[#241D1A] shadow-xl max-h-[90vh] overflow-y-auto"
      >
        {/* Bouton fermeture */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
          className="absolute top-4 right-4 p-2 text-mahogany/60 hover:text-mahogany transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={1.25} />
        </button>

        {/* En-tête sobre */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] text-xs text-mahogany mb-3">
            <Clock className="w-3.5 h-3.5 text-eucalyptus" strokeWidth={1.25} />
            <span>20 minutes • Gratuit & sans engagement</span>
          </div>
          <h2 className="text-2xl font-serif font-normal text-mahogany mb-2">
            Échangeons de vive voix
          </h2>
          <p className="text-sm text-charcoal/70 leading-relaxed">
            Un appel posé avec le duo fondateur pour faire le point sur tes envies ou votre établissement,
            sans pression commerciale.
          </p>
        </div>

        {/* Sélecteur de profil */}
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 bg-[#EFE9DF] rounded-sm border border-[#DED5C6]">
          <button
            type="button"
            onClick={() => setAudience('voyageur')}
            className={`py-2 text-xs font-medium uppercase tracking-[0.14em] rounded-sm transition-all ${
              audience === 'voyageur'
                ? 'bg-[#FAF7F2] text-mahogany shadow-sm'
                : 'text-charcoal/60 hover:text-mahogany'
            }`}
          >
            Voyage en couple
          </button>
          <button
            type="button"
            onClick={() => setAudience('hotelier')}
            className={`py-2 text-xs font-medium uppercase tracking-[0.14em] rounded-sm transition-all ${
              audience === 'hotelier'
                ? 'bg-[#FAF7F2] text-mahogany shadow-sm'
                : 'text-charcoal/60 hover:text-mahogany'
            }`}
          >
            Hôte ou hôtelier
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center text-eucalyptus">
              <Check className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif font-normal text-mahogany mb-2">
              Demande d&apos;appel bien reçue
            </h3>
            <p className="text-sm text-charcoal/70 mb-6 max-w-sm mx-auto leading-relaxed">
              On revient vers toi par e-mail ou SMS dans les prochaines heures ouvrées pour caler le créneau exact.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-sm bg-eucalyptus text-[#FAF7F2] text-xs font-medium uppercase tracking-[0.14em] hover:bg-eucalyptus/90 transition-colors"
            >
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Honeypot anti-spam */}
            <input
              type="text"
              name="website_url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-mahogany mb-1">
                  Prénom & Nom
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder={audience === 'voyageur' ? 'Ex: Sophie & Marc' : 'Ex: Julien Laurent'}
                  className="w-full px-3.5 py-2.5 rounded-sm border border-[#DED5C6] bg-white text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-eucalyptus transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-mahogany mb-1">
                  Adresse e-mail
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@exemple.fr"
                  className="w-full px-3.5 py-2.5 rounded-sm border border-[#DED5C6] bg-white text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-eucalyptus transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-mahogany mb-1">
                  Numéro de téléphone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className="w-full px-3.5 py-2.5 rounded-sm border border-[#DED5C6] bg-white text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-eucalyptus transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-mahogany mb-1">
                  Créneau de préférence
                </label>
                <select
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-sm border border-[#DED5C6] bg-white text-sm text-charcoal focus:outline-none focus:border-eucalyptus transition-colors"
                >
                  <option value="Matinée (9h - 12h)">Matinée (9h - 12h)</option>
                  <option value="Début d'après-midi (14h - 17h)">Début d&apos;après-midi (14h - 17h)</option>
                  <option value="Fin de journée (18h - 20h)">Fin de journée (18h - 20h)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-mahogany mb-1">
                {audience === 'voyageur' ? 'Votre destination ou vos envies' : 'Votre hébergement (nom, lieu, chambres)'}
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={
                  audience === 'voyageur'
                    ? 'Ex: Madère en mai, envie de sentiers calmes et vue mer.'
                    : 'Ex: Maison d\'hôtes 5 chambres dans le Lot, dépendance Booking.'
                }
                className="w-full px-3.5 py-2.5 rounded-sm border border-[#DED5C6] bg-white text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-eucalyptus transition-colors resize-none"
              />
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-sm border border-red-200">
                {error}
              </p>
            )}

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 text-xs text-charcoal/60">
                <ShieldCheck className="w-4 h-4 text-eucalyptus shrink-0" strokeWidth={1.25} />
                <span>0 commission cachée • Données protégées</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-sm bg-eucalyptus text-[#FAF7F2] text-xs font-medium uppercase tracking-[0.14em] hover:bg-eucalyptus/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Envoi...' : 'Confirmer l\'appel'}
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
