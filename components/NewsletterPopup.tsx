'use client'

import { useState, useEffect } from 'react'

export default function NewsletterPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    // Check if popup was already shown this session
    if (typeof window !== 'undefined') {
      const wasShown = sessionStorage.getItem('newsletter-popup-shown')
      if (wasShown) return
    }

    // Show after 30 seconds OR scroll to 60%
    let timeout: NodeJS.Timeout
    let scrollHandler: () => void

    const showPopup = () => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('newsletter-popup-shown', 'true')
      }
      setIsVisible(true)
      cleanup()
    }

    const cleanup = () => {
      if (timeout) clearTimeout(timeout)
      if (typeof window !== 'undefined') {
        window.removeEventListener('scroll', scrollHandler)
      }
    }

    // Timer: 30 seconds
    timeout = setTimeout(showPopup, 30000)

    // Scroll: 60%
    if (typeof window !== 'undefined') {
      scrollHandler = () => {
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const scrollPercent = (scrollTop / docHeight) * 100
        if (scrollPercent >= 60) {
          showPopup()
        }
      }
      window.addEventListener('scroll', scrollHandler)
    }

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
        // Close after 3 seconds on success
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
      style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 9999,
        background: '#6b2a1a',
        borderRadius: '1rem',
        padding: '2rem',
        maxWidth: '380px',
        width: '100%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        color: 'white',
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
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'none',
          border: 'none',
          color: 'white',
          cursor: 'pointer',
          fontSize: '1.25rem',
          opacity: 0.7,
          padding: '0.25rem',
        }}
        aria-label="Fermer"
      >
        ✕
      </button>

      {status === 'success' ? (
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
            Bienvenue dans l&apos;aventure !
          </h3>
          <p style={{ opacity: 0.9, fontSize: '0.9rem', margin: 0 }}>
            Tu vas recevoir nos carnets de voyage et nos meilleures pépites.
          </p>
        </div>
      ) : (
        <>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
            Rejoins la tribu Heldonica 🌿
          </h3>
          <p style={{ opacity: 0.9, fontSize: '0.85rem', margin: '0 0 1.25rem', lineHeight: 1.5 }}>
            Carnets de voyage, destinations hors sentiers battus, et tips slow travel — une fois par semaine max.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ton@email.fr"
                required
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  fontSize: '0.9rem',
                  color: '#1a1a1a',
                }}
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: '0.5rem',
                  border: 'none',
                  background: 'white',
                  color: '#6b2a1a',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                  opacity: status === 'loading' ? 0.7 : 1,
                }}
              >
                {status === 'loading' ? 'Inscription...' : 'Rejoindre la tribu Heldonica'}
              </button>
            </div>

            {errorMessage && (
              <p style={{ color: '#fca5a5', fontSize: '0.8rem', marginTop: '0.75rem' }}>
                {errorMessage}
              </p>
            )}
          </form>

          <p style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '1rem', textAlign: 'center' }}>
            En t&apos;inscrivant, tu acceptes de recevoir nos carnets de voyage. Désinscription possible à tout moment.
          </p>
        </>
      )}
    </div>
  )
}