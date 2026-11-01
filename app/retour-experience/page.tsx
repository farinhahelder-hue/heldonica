'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import { useZoneTexts } from '@/components/inline-edit/useZoneTexts';

const PAGE = 'retour-experience';

export default function RetourExperiencePage() {
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    destination: '',
    rating: 5,
    quote: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const t = useZoneTexts(PAGE, {
    badge: 'Carnet de retour',
    title: 'Votre retour d’expérience',
    intro:
      'On accorde une importance capitale à l’authenticité de nos retours. Si on a conçu votre voyage, racontez-nous ce que vous avez vraiment vécu : vos moments forts, vos pépites et vos éventuelles remarques.',
    success_title: 'Merci pour votre retour précieux !',
    success_text:
      'Votre témoignage a bien été transmis. On le relit avec attention avant de le publier sur le site pour inspirer de futurs couples de voyageurs.',
    error_generic: 'Une erreur est survenue.',
    error_network: 'Impossible d’envoyer votre retour. Réessayez plus tard.',
    label_names: 'Vos prénoms *',
    placeholder_names: 'Ex : Claire & Julien',
    label_location: 'Ville ou Région',
    placeholder_location: 'Ex : Lyon, Bruxelles, Genève',
    label_destination: 'Destination vécue *',
    placeholder_destination: 'Ex : Madère (Nord), Monténégro, Roumanie',
    label_rating: 'Note globale',
    rating_5: '★★★★★ (Inoubliable / Exceptionnel)',
    rating_4: '★★★★ (Très réussi)',
    rating_3: '★★★ (Satisfaisant)',
    rating_2: '★★ (Mitigé)',
    rating_1: '★ (Décevant)',
    label_quote: 'Votre témoignage détaillé *',
    placeholder_quote:
      'Comment s’est passé votre séjour ? Qu’avez-vous pensé de l’accompagnement et du carnet de route sur mesure ?',
    btn_loading: 'Envoi en cours...',
    btn_submit: 'Envoyer mon témoignage',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/testimonials/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setErrorMessage(data.error || t.error_generic);
      } else {
        setStatus('success');
      }
    } catch {
      setStatus('error');
      setErrorMessage(t.error_network);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 flex flex-col justify-between">
      <div>
        <Header />
        <Breadcrumb />

        <main className="container max-w-2xl py-12 px-4 sm:px-6">
          <div className="bg-[#FAF7F2] rounded-sm p-8 md:p-12 border border-[#DED5C6]">
            <span className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-2 block">
              {t.badge}
            </span>
            <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4">
              {t.title}
            </h1>
            <p className="text-sm md:text-base text-stone-600 mb-8 leading-relaxed">
              {t.intro}
            </p>

            {status === 'success' ? (
              <div className="p-6 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 animate-in fade-in duration-300">
                <h3 className="font-bold text-lg font-serif">{t.success_title}</h3>
                <p className="text-sm text-emerald-800 leading-relaxed">
                  {t.success_text}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status === 'error' && (
                  <div className="p-4 rounded-sm bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                    {errorMessage}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      {t.label_names}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.placeholder_names}
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-sm border border-[#DED5C6] text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      {t.label_location}
                    </label>
                    <input
                      type="text"
                      placeholder={t.placeholder_location}
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 rounded-sm border border-[#DED5C6] text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      {t.label_destination}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={t.placeholder_destination}
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="w-full px-4 py-3 rounded-sm border border-[#DED5C6] text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      {t.label_rating}
                    </label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-sm border border-[#DED5C6] text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus bg-[#FAF7F2]"
                    >
                      <option value={5}>{t.rating_5}</option>
                      <option value={4}>{t.rating_4}</option>
                      <option value={3}>{t.rating_3}</option>
                      <option value={2}>{t.rating_2}</option>
                      <option value={1}>{t.rating_1}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    {t.label_quote}
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder={t.placeholder_quote}
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    className="w-full px-4 py-3 rounded-sm border border-[#DED5C6] text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3.5 px-6 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm rounded-sm transition disabled:opacity-50"
                >
                  {status === 'loading' ? t.btn_loading : t.btn_submit}
                </button>
              </form>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
