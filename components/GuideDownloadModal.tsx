'use client'

import { useState, useCallback } from 'react'
import { X, Download, CheckCircle2, Loader2 } from 'lucide-react'

interface GuideDownloadModalProps {
  destinationSlug: string
  destinationTitle: string
  open: boolean
  onClose: () => void
}

export default function GuideDownloadModal({
  destinationSlug, destinationTitle, open, onClose,
}: GuideDownloadModalProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/guides/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destinationSlug, email }),
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error || 'Erreur')
      }

      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `guide-${destinationSlug}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      setStatus('success')
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'guide_downloaded', { destination: destinationSlug })
      }
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'Erreur lors du téléchargement')
    }
  }, [destinationSlug, email])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-600"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>

        {status === 'success' ? (
          <div className="text-center py-6">
            <CheckCircle2 size={48} className="text-eucalyptus mx-auto mb-4" />
            <h3 className="text-xl font-serif text-mahogany mb-2">C&apos;est parti !</h3>
            <p className="text-charcoal/70 text-sm">
              Ton guide de {destinationTitle} a été téléchargé. Vérifie aussi ta boîte mail.
            </p>
            <button
              onClick={onClose}
              className="mt-6 px-6 py-2.5 bg-eucalyptus text-white rounded-full text-sm font-semibold hover:bg-eucalyptus/90"
            >
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <Download size={32} className="text-eucalyptus mx-auto mb-3" />
              <h3 className="text-xl font-serif text-mahogany mb-2">
                Télécharge ton guide {destinationTitle}
              </h3>
              <p className="text-charcoal/60 text-sm">
                Reçois notre guide complet en PDF avec les meilleures adresses et itinéraires.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.fr"
                required
                className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
              />
              {status === 'error' && (
                <p className="text-red-500 text-xs">{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full py-3 bg-eucalyptus text-white rounded-xl text-sm font-semibold hover:bg-eucalyptus/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {status === 'loading' ? (
                  <><Loader2 size={16} className="animate-spin" /> Génération...</>
                ) : (
                  <><Download size={16} /> Télécharger le guide PDF</>
                )}
              </button>
            </form>

            <p className="text-stone-400 text-xs text-center mt-4">
              Gratuit — 1 email pour recevoir les prochains guides en avant-première
            </p>
          </>
        )}
      </div>
    </div>
  )
}
