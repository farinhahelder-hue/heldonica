'use client'

import { useState } from 'react'
import { useZoneTexts } from '@/components/inline-edit/useZoneTexts'

// Le formulaire vit dans la page expert-hotelier : ses textes sont des zones de
// cette page, éditables depuis sa barre latérale.
const PAGE = 'expert-hotelier'

const inputClass =
  'w-full rounded-sm border border-stone-700 bg-stone-900 px-4 py-3 text-white placeholder-stone-500 outline-none transition-all duration-200 focus:border-eucalyptus focus:ring-2 focus:ring-eucalyptus/20'

const labelClass = 'block text-sm font-semibold text-stone-300 mb-1.5'

export default function HotelierForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const t = useZoneTexts(PAGE, {
    hotelier_form_name_label: 'Votre nom *',
    hotelier_form_email_label: 'Email *',
    hotelier_form_establishment_label: "Nom de l'établissement *",
    hotelier_form_city_label: 'Ville *',
    hotelier_form_website_label: 'Site web',
    hotelier_form_website_placeholder: 'https://…',
    hotelier_form_type_label: "Type d'hébergement *",
    hotelier_form_type_option_placeholder: 'Sélectionne un type',
    hotelier_form_type_option_guesthouse: "Maison d'hôtes",
    hotelier_form_type_option_gite: 'Gîte',
    hotelier_form_type_option_hotel: 'Hôtel indépendant',
    hotelier_form_type_option_unusual: 'Hébergement insolite',
    hotelier_form_type_option_other: 'Autre',
    hotelier_form_rooms_label: 'Nombre de chambres',
    hotelier_form_direct_label: 'Part actuelle de réservations directes',
    hotelier_form_direct_option_unknown: 'Je ne sais pas encore',
    hotelier_form_direct_option_lt10: 'Moins de 10%',
    hotelier_form_direct_option_10_25: '10 à 25%',
    hotelier_form_direct_option_25_50: '25 à 50%',
    hotelier_form_direct_option_gt50: 'Plus de 50%',
    hotelier_form_message_label: 'Votre message',
    hotelier_form_message_placeholder: "Votre situation, vos objectifs, ce qui vous freine aujourd'hui…",
    hotelier_form_rgpd_label: "J'accepte que ces informations soient utilisées pour me recontacter. Voir notre",
    hotelier_form_rgpd_link: 'politique de confidentialité',
    hotelier_form_submit: 'Échanger sur mon projet',
    hotelier_form_submit_loading: 'Envoi en cours…',
    hotelier_form_reassurance: 'Sans engagement. Échange simple de 30 minutes. Réponse sous 48h.',
    hotelier_form_success_title: 'Merci, votre demande est bien enregistrée.',
    hotelier_form_success_text: 'On vous recontacte sous 48h pour planifier votre appel de diagnostic de 30 minutes.',
    hotelier_form_error_generic: "La demande n'a pas pu aboutir. Réessayez ou écrivez-nous directement à contact@heldonica.fr.",
  })

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
      setError(err instanceof Error && err.message !== 'request_failed' ? err.message : t.hotelier_form_error_generic)
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-sm border border-eucalyptus/20 bg-eucalyptus/5 p-8 text-center">
        <p className="text-lg font-semibold text-white mb-2">{t.hotelier_form_success_title}</p>
        <p className="text-sm text-stone-400">{t.hotelier_form_success_text}</p>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 text-left">
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="hf-name" className={labelClass}>{t.hotelier_form_name_label}</label>
          <input id="hf-name" name="name" type="text" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="hf-email" className={labelClass}>{t.hotelier_form_email_label}</label>
          <input id="hf-email" name="email" type="email" required className={inputClass} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="hf-establishment" className={labelClass}>{t.hotelier_form_establishment_label}</label>
          <input id="hf-establishment" name="establishment" type="text" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="hf-city" className={labelClass}>{t.hotelier_form_city_label}</label>
          <input id="hf-city" name="city" type="text" required className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="hf-website" className={labelClass}>{t.hotelier_form_website_label}</label>
        <input id="hf-website" name="website" type="text" placeholder={t.hotelier_form_website_placeholder} className={inputClass} />
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="hf-type" className={labelClass}>{t.hotelier_form_type_label}</label>
          {/* Les `value` restent fixes : c'est ce que reçoit l'API. Seuls les libellés viennent du CMS. */}
          <select id="hf-type" name="type" required className={inputClass}>
            <option value="">{t.hotelier_form_type_option_placeholder}</option>
            <option value="Maison d'hôtes">{t.hotelier_form_type_option_guesthouse}</option>
            <option value="Gîte">{t.hotelier_form_type_option_gite}</option>
            <option value="Hôtel indépendant">{t.hotelier_form_type_option_hotel}</option>
            <option value="Hébergement insolite">{t.hotelier_form_type_option_unusual}</option>
            <option value="Autre">{t.hotelier_form_type_option_other}</option>
          </select>
        </div>
        <div>
          <label htmlFor="hf-rooms" className={labelClass}>{t.hotelier_form_rooms_label}</label>
          <input id="hf-rooms" name="rooms" type="text" className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="hf-direct" className={labelClass}>{t.hotelier_form_direct_label}</label>
        <select id="hf-direct" name="directBookingsShare" className={inputClass}>
          <option value="">{t.hotelier_form_direct_option_unknown}</option>
          <option value="<10%">{t.hotelier_form_direct_option_lt10}</option>
          <option value="10-25%">{t.hotelier_form_direct_option_10_25}</option>
          <option value="25-50%">{t.hotelier_form_direct_option_25_50}</option>
          <option value=">50%">{t.hotelier_form_direct_option_gt50}</option>
        </select>
      </div>

      <div>
        <label htmlFor="hf-message" className={labelClass}>{t.hotelier_form_message_label}</label>
        <textarea id="hf-message" name="message" rows={4} className={inputClass} placeholder={t.hotelier_form_message_placeholder} />
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
          {t.hotelier_form_rgpd_label}{' '}
          <a href="/politique-confidentialite" className="text-eucalyptus hover:underline font-medium">
            {t.hotelier_form_rgpd_link}
          </a>.
        </label>
      </div>

      {status === 'error' && (
        <p className="text-sm text-red-400">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full px-8 py-4 bg-action text-white font-semibold rounded-sm hover:brightness-110 transition-all text-lg disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? t.hotelier_form_submit_loading : t.hotelier_form_submit}
      </button>
      <p className="text-center text-sm text-stone-500">{t.hotelier_form_reassurance}</p>
    </form>
  )
}
