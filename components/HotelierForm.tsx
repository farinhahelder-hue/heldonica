'use client'

import { useState } from 'react'

const inputClass =
  'w-full rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 text-white placeholder-stone-500 outline-none transition-all duration-200 focus:border-eucalyptus focus:ring-2 focus:ring-eucalyptus/20'

export default function HotelierForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('loading')
    setError('')

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form).entries())

    try {
      const res = await fetch('/api/expert-hotelier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, rgpd: data.rgpd === 'on' }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'request_failed')
      }
      setStatus('success')
      form.reset()
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error && err.message !== 'request_failed' ? err.message : "La demande n'a pas pu aboutir. Réessayez ou écrivez-nous directement à contact@heldonica.fr.")
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-eucalyptus/20 bg-eucalyptus/5 p-8 text-center">
        <p className="text-lg font-semibold text-white mb-2">Merci, votre demande est bien enregistrée.</p>
        <p className="text-sm text-stone-400">On vous recontacte sous 48h pour planifier votre appel de diagnostic de 30 minutes.</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 text-left">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="hf-name" className="block text-sm font-semibold text-stone-300 mb-1.5">Votre nom *</label>
          <input id="hf-name" name="name" type="text" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="hf-email" className="block text-sm font-semibold text-stone-300 mb-1.5">Email *</label>
          <input id="hf-email" name="email" type="email" required className={inputClass} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="hf-establishment" className="block text-sm font-semibold text-stone-300 mb-1.5">Nom de l&apos;établissement *</label>
          <input id="hf-establishment" name="establishment" type="text" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="hf-city" className="block text-sm font-semibold text-stone-300 mb-1.5">Ville *</label>
          <input id="hf-city" name="city" type="text" required className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="hf-website" className="block text-sm font-semibold text-stone-300 mb-1.5">Site web</label>
        <input id="hf-website" name="website" type="text" placeholder="https://…" className={inputClass} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="hf-type" className="block text-sm font-semibold text-stone-300 mb-1.5">Type d&apos;hébergement *</label>
          <select id="hf-type" name="type" required className={inputClass}>
            <option value="">Sélectionne un type</option>
            <option value="Maison d'hôtes">Maison d&apos;hôtes</option>
            <option value="Gîte">Gîte</option>
            <option value="Hôtel indépendant">Hôtel indépendant</option>
            <option value="Hébergement insolite">Hébergement insolite</option>
            <option value="Autre">Autre</option>
          </select>
        </div>
        <div>
          <label htmlFor="hf-rooms" className="block text-sm font-semibold text-stone-300 mb-1.5">Nombre de chambres</label>
          <input id="hf-rooms" name="rooms" type="text" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="hf-direct" className="block text-sm font-semibold text-stone-300 mb-1.5">Part actuelle de réservations directes</label>
        <select id="hf-direct" name="directBookingsShare" className={inputClass}>
          <option value="">Je ne sais pas encore</option>
          <option value="<10%">Moins de 10%</option>
          <option value="10-25%">10 à 25%</option>
          <option value="25-50%">25 à 50%</option>
          <option value=">50%">Plus de 50%</option>
        </select>
      </div>

      <div>
        <label htmlFor="hf-message" className="block text-sm font-semibold text-stone-300 mb-1.5">Votre message</label>
        <textarea id="hf-message" name="message" rows={4} className={inputClass} placeholder="Votre situation, vos objectifs, ce qui vous freine aujourd'hui…" />
      </div>

      <div className="flex items-start gap-2.5">
        <input
          id="hf-rgpd"
          name="rgpd"
          type="checkbox"
          required
          className="mt-1 h-4 w-4 rounded border-stone-700 bg-stone-900 text-eucalyptus focus:ring-eucalyptus cursor-pointer"
        />
        <label htmlFor="hf-rgpd" className="text-xs leading-normal text-stone-400">
          J&apos;accepte que ces informations soient utilisées pour me recontacter. Voir notre{' '}
          <a href="/politique-confidentialite" className="text-eucalyptus hover:underline font-medium">
            politique de confidentialité
          </a>.
        </label>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full px-8 py-4 bg-eucalyptus text-white font-semibold rounded-xl hover:brightness-110 transition-all text-lg disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? 'Envoi en cours…' : 'Échanger sur mon projet →'}
      </button>
      <p className="text-center text-sm text-stone-500">Sans engagement. Échange simple de 30 minutes. Réponse sous 48h.</p>
    </form>
  )
}
