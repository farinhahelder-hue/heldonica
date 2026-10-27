'use client'

import { useState, useEffect } from 'react'
import { BookOpen, X, Check, ShieldCheck, ArrowRight, Compass } from 'lucide-react'

interface LeadMagnetCoupleModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LeadMagnetCoupleModal({
  isOpen,
  onClose,
}: LeadMagnetCoupleModalProps) {
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('') // Honeypot
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

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
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          source: 'lead-magnet-guide-couple',
          profil: firstName || 'duo',
          website_url: websiteUrl,
        }),
      })

      if (!res.ok) {
        throw new Error("Une erreur s'est produite lors de l'envoi.")
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err?.message || 'Erreur réseau, réessaie dans quelques instants.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Guide offert : 5 erreurs qui gâchent un voyage en couple"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#241D1A]/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg rounded-sm border border-[#DED5C6] bg-[#FAF7F2] p-6 md:p-8 text-[#241D1A] shadow-xl max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la fenêtre"
          className="absolute top-4 right-4 p-2 text-mahogany/60 hover:text-mahogany transition-colors"
        >
          <X className="w-5 h-5" strokeWidth={1.25} />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] text-xs text-mahogany mb-3">
            <BookOpen className="w-3.5 h-3.5 text-eucalyptus" strokeWidth={1.25} />
            <span>Guide numérique offert • Lecture 12 min</span>
          </div>
          <h2 className="text-2xl font-serif font-normal text-mahogany mb-2">
            Les 5 erreurs qui gâchent un voyage en couple
          </h2>
          <p className="text-sm text-charcoal/70 leading-relaxed">
            Comment alléger la charge mentale, déjouer les faux avis en ligne et s&apos;approprier
            l&apos;art de la demi-journée vide pour vraiment déconnecter à deux.
          </p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 mx-auto mb-4 rounded-sm bg-[#EFE9DF] border border-[#DED5C6] flex items-center justify-center text-eucalyptus">
              <Check className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif font-normal text-mahogany mb-2">
              Le guide est en route !
            </h3>
            <p className="text-sm text-charcoal/70 mb-6 max-w-sm mx-auto leading-relaxed">
              Vérifie ta boîte de réception (et tes spams). Le carnet numérique t&apos;a été envoyé directement.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-sm bg-eucalyptus text-[#FAF7F2] text-xs font-medium uppercase tracking-[0.14em] hover:bg-eucalyptus/90 transition-colors"
            >
              C&apos;est parfait
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="website_url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            <div>
              <label className="block text-xs font-medium text-mahogany mb-1">
                Ton prénom
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Ex: Camille"
                className="w-full px-3.5 py-2.5 rounded-sm border border-[#DED5C6] bg-white text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-eucalyptus transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-mahogany mb-1">
                Où doit-on t&apos;envoyer le guide ?
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton.email@exemple.fr"
                className="w-full px-3.5 py-2.5 rounded-sm border border-[#DED5C6] bg-white text-sm text-charcoal placeholder:text-charcoal/40 focus:outline-none focus:border-eucalyptus transition-colors"
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
                <span>Zéro spam • Désinscription en 1 clic</span>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 rounded-sm bg-eucalyptus text-[#FAF7F2] text-xs font-medium uppercase tracking-[0.14em] hover:bg-eucalyptus/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Envoi...' : 'Recevoir le guide'}
                <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
