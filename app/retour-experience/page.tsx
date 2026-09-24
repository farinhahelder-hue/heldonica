'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';

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
        setErrorMessage(data.error || 'Une erreur est survenue.');
      } else {
        setStatus('success');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Impossible d’envoyer votre retour. Réessayez plus tard.');
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 flex flex-col justify-between">
      <div>
        <Header />
        <Breadcrumb />

        <main className="container max-w-2xl py-12 px-4 sm:px-6">
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-stone-200">
            <span className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-2 block">
              Carnet de retour
            </span>
            <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-4">
              Votre retour d’expérience
            </h1>
            <p className="text-sm md:text-base text-stone-600 mb-8 leading-relaxed">
              On accorde une importance capitale à l’authenticité de nos retours. Si on a conçu votre voyage, racontez-nous ce que vous avez vraiment vécu : vos moments forts, vos pépites et vos éventuelles remarques.
            </p>

            {status === 'success' ? (
              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 animate-in fade-in duration-300">
                <div className="text-2xl">🌿</div>
                <h3 className="font-bold text-lg font-serif">Merci pour votre retour précieux !</h3>
                <p className="text-sm text-emerald-800 leading-relaxed">
                  Votre témoignage a bien été transmis. On le relit avec attention avant de le publier sur le site pour inspirer de futurs couples de voyageurs.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {status === 'error' && (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
                    {errorMessage}
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Vos prénoms *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex : Claire & Julien"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Ville ou Région
                    </label>
                    <input
                      type="text"
                      placeholder="Ex : Lyon, Bruxelles, Genève"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Destination vécue *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex : Madère (Nord), Monténégro, Roumanie"
                      value={formData.destination}
                      onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                      Note globale
                    </label>
                    <select
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus bg-white"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (Inoubliable / Exceptionnel)</option>
                      <option value={4}>⭐⭐⭐⭐ (Très réussi)</option>
                      <option value={3}>⭐⭐⭐ (Satisfaisant)</option>
                      <option value={2}>⭐⭐ (Mitigé)</option>
                      <option value={1}>⭐ (Décevant)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                    Votre témoignage détaillé *
                  </label>
                  <textarea
                    required
                    rows={5}
                    placeholder="Comment s'est passé votre séjour ? Qu'avez-vous pensé de l'accompagnement et du carnet de route sur mesure ?"
                    value={formData.quote}
                    onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus leading-relaxed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full py-3.5 px-6 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-sm rounded-xl transition shadow-sm disabled:opacity-50"
                >
                  {status === 'loading' ? 'Envoi en cours...' : 'Envoyer mon témoignage →'}
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
