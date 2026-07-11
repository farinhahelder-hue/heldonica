'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trackLeadMagnetDownload, trackNewsletterSignup } from '@/lib/analytics'

interface GuideDownloadFormProps {
  variant?: 'hero' | 'inline' | 'footer'
  className?: string
  guideName?: string
}

export default function GuideDownloadForm({ variant = 'inline', className = '' }: GuideDownloadFormProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    setErrorMessage('')

    try {
      const res = await fetch('/api/brevo/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          source: 'guides',
          attributes: {
            GUIDES_DOWNLOADED: 'top-10-madere',
            DOWNLOAD_DATE: new Date().toISOString(),
          }
        }),
      })

      if (res.ok) {
        setStatus('success')
        // Track newsletter signup and lead magnet download
        trackNewsletterSignup(email, 'guides')
        trackLeadMagnetDownload('top-10-madere')
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
      <div className={`bg-eucalyptus/10 border border-eucalyptus/30 rounded-2xl p-6 text-center ${className}`}>
        <span className="text-3xl mb-3 block">✨</span>
        <p className="text-white font-semibold text-lg">C&apos;est parti !</p>
        <p className="text-stone-300 text-sm mt-1">Redirection vers le guide...</p>
      </div>
    )
  }

  const styles = {
    hero: {
      wrapper: 'bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 max-w-md mx-auto',
      input: 'w-full px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-stone-400 focus:outline-none focus:border-amber-400 transition-colors',
      button: 'w-full px-6 py-4 bg-amber-500 text-stone-900 font-bold rounded-xl hover:bg-amber-400 transition-all text-lg',
    },
    inline: {
      wrapper: 'max-w-md mx-auto',
      input: 'w-full px-5 py-3.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors',
      button: 'w-full px-6 py-3.5 bg-amber-500 text-stone-900 font-semibold rounded-xl hover:bg-amber-400 transition-all whitespace-nowrap',
    },
    footer: {
      wrapper: 'flex flex-col sm:flex-row gap-3 max-w-md mx-auto',
      input: 'flex-1 px-5 py-3.5 bg-stone-800 border border-stone-700 rounded-xl text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 transition-colors',
      button: 'px-6 py-3.5 bg-amber-500 text-stone-900 font-semibold rounded-xl hover:bg-amber-400 transition-all whitespace-nowrap',
    },
  }

  const s = styles[variant]

  return (
    <form onSubmit={handleSubmit} className={`${s.wrapper} ${className}`}>
      <input
        type="email"
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
        className={`${s.button} mt-3 disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {status === 'loading' ? 'Envoi...' : 'Je veux le guide →'}
      </button>
      {errorMessage && (
        <p className="text-red-400 text-sm mt-3 text-center">{errorMessage}</p>
      )}
      <p className="text-stone-500 text-xs mt-3 text-center">
        On t&apos;envoie le guide et tu restes inscrit·e à la newsletter. Désinscription à tout moment.
      </p>
    </form>
  )
}