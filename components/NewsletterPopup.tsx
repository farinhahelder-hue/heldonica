'use client'

import { useState, useEffect } from 'react'

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Check if popup was already shown this session
    const wasShown = sessionStorage.getItem('newsletter-popup-shown')
    if (wasShown) return

    let timeout: NodeJS.Timeout
    let scrollHandler: () => void
    let exitIntentTriggered = false

    const showPopup = () => {
      sessionStorage.setItem('newsletter-popup-shown', 'true')
      setIsVisible(true)
      cleanup()
    }

    const cleanup = () => {
      if (timeout) clearTimeout(timeout)
      window.removeEventListener('scroll', scrollHandler)
      document.removeEventListener('mouseleave', exitIntentHandler)
    }

    // Timer: 45 seconds (augmenté pour moins d’agacement)
    timeout = setTimeout(showPopup, 45000)

    // Scroll: 70%
    scrollHandler = () => {
      const scrollTop = window.scrollY
      const docHeight = document.documentElement.scrollHeight - window.innerHeight
      const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      if (scrollPercent >= 70) {
        showPopup()
      }
    }
    window.addEventListener('scroll', scrollHandler, { passive: true })

    // Exit intent: quand la souris quitte le document par le haut
    const exitIntentHandler = (e: MouseEvent) => {
      if (exitIntentTriggered) return
      if (e.clientY <= 0) {
        exitIntentTriggered = true
        showPopup()
      }
    }
    document.addEventListener('mouseleave', exitIntentHandler)

    return cleanup
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      setErrorMessage('Adresse email invalide')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus('success')
        setTimeout(() => setIsVisible(false), 3000)
      } else {
        const data = await res.json()
        setStatus('error')
        setErrorMessage(data.error || 'Erreur lors de l\'inscription')
      }
    } catch {
      setStatus('error')
      setErrorMessage('Erreur réseau. Réessaie plus tard.')
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('newsletter-popup-shown', 'true')
    }
  }

  if (!isVisible) return null

  return (
    <div
      className="fixed bottom-6 right-6 z-50 bg-stone-950 rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-white"
      style={{
        animation: 'slideUp 0.3s ease-out',
      }}
    >
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
        aria-label="Fermer"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {status === 'success' ? (
        <div className="text-center py-4">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-bold mb-2">
            Bienvenue dans l&apos;aventure !
          </h3>
          <p className="text-stone-400 text-sm">
            Tu vas recevoir nos carnets de voyage et nos meilleures pépites.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <span className="inline-block px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-3">
              Guide gratuit
            </span>
            <h3 className="text-xl font-bold mb-2">
              Reçois les 10 meilleures adresses Madère
            </h3>
            <p className="text-stone-400 text-sm leading-relaxed">
              On t&apos;envoie notre guide testé sur le terrain + les pépites chaque semaine.
              Pas de spam, jamais.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.fr"
              required
              className="w-full px-4 py-3 rounded-xl bg-stone-800 border border-stone-700 text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors text-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full px-6 py-3.5 bg-amber-500 text-stone-900 font-bold rounded-xl hover:bg-amber-400 transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Inscription...' : 'Je veux le guide →'}
            </button>
          </form>

          {errorMessage && (
            <p className="text-red-400 text-xs mt-3 text-center">
              {errorMessage}
            </p>
          )}

          <p className="text-stone-600 text-xs mt-4 text-center">
            Désinscription possible à tout moment.
          </p>
        </>
      )}
    </div>
  )
}