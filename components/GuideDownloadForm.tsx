'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CONSENT_PRIVACY_LINK, NEWSLETTER_CONSENT_LABEL } from '@/lib/consent-copy'

interface GuideDownloadFormProps {
  variant?: 'hero' | 'inline' | 'footer'
  className?: string
}

export default function GuideDownloadForm({ variant = 'inline', className = '' }: GuideDownloadFormProps) {
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !consent) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/brevo/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          source: 'guides',
          consent,
          attributes: {
            GUIDES_DOWNLOADED: 'top-10-madere',
            DOWNLOAD_DATE: new Date().toISOString(),
          }
        }),
      })

      if (res.ok) {
        setStatus('success')
        // Redirect to thank you page
        setTimeout(() => {
          router.push('/guides/merci')
        }, 1500)
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

  if (status === 'success') {
    return (
      <div className={`bg-eucalyptus/10 border border-eucalyptus/30 rounded-sm p-6 text-center ${className}`}>
        <p className="text-white font-semibold text-lg">C&apos;est parti !</p>
        <p className="text-stone-300 text-sm mt-1">Redirection vers le guide...</p>
      </div>
    )
  }

  const styles = {
    hero: {
      wrapper: 'bg-[#FAF7F2]/5 backdrop-blur-sm rounded-sm p-6 md:p-8 border border-white/10 max-w-md mx-auto',
      input: 'w-full px-5 py-3.5 bg-[#FAF7F2]/10 border border-white/20 rounded-sm text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition-colors',
      button: 'w-full px-6 py-4 bg-amber-500 text-stone-900 font-bold rounded-sm hover:bg-amber-400 transition-all text-lg',
    },
    inline: {
      wrapper: 'max-w-md mx-auto',
      input: 'w-full px-5 py-3.5 bg-stone-800 border border-stone-700 rounded-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors',
      button: 'w-full px-6 py-3.5 bg-amber-500 text-stone-900 font-semibold rounded-sm hover:bg-amber-400 transition-all whitespace-nowrap',
    },
    footer: {
      wrapper: 'flex flex-col sm:flex-row gap-3 max-w-md mx-auto',
      input: 'flex-1 px-5 py-3.5 bg-stone-800 border border-stone-700 rounded-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors',
      button: 'px-6 py-3.5 bg-amber-500 text-stone-900 font-semibold rounded-sm hover:bg-amber-400 transition-all whitespace-nowrap',
    },
  }

  const s = styles[variant]

  return (
    <form onSubmit={handleSubmit} className={`${variant === 'footer' ? 'max-w-md mx-auto' : s.wrapper} ${className}`}>
      <div className={variant === 'footer' ? 'flex flex-col sm:flex-row gap-3' : ''}>
        <input
          type="email"
          aria-label="Ton adresse email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ton@email.fr"
          required
          disabled={status === 'loading'}
          className={`${s.input} ${status === 'loading' ? 'opacity-50' : ''}`}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className={`${s.button} ${variant === 'footer' ? '' : 'mt-3'} disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {status === 'loading' ? 'Envoi...' : 'Je veux le guide'}
        </button>
      </div>
      {errorMessage && (
        <p className="text-red-400 text-sm mt-3 text-center">{errorMessage}</p>
      )}
      <label className="flex items-start gap-2 text-stone-500 text-xs mt-3 text-left">
        <input
          type="checkbox"
          required
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-stone-600 bg-stone-800 text-eucalyptus focus:ring-eucalyptus cursor-pointer"
        />
        <span>
          {NEWSLETTER_CONSENT_LABEL}{' '}
          <Link href="/politique-confidentialite" className="underline hover:text-stone-300">
            {CONSENT_PRIVACY_LINK}
          </Link>.
        </span>
      </label>
    </form>
  )
}