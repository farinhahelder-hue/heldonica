'use client';
import { useState } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function TravelPlanningForm() {
  const [state, setState] = useState<FormState>('idle');
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    telephone: '',
    destination: '',
    style_voyage: '',
    duree_jours: '',
    budget_fourchette: '',
    nb_voyageurs: '2',
    mois_depart: '',
    notes: ''
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      const res = await fetch('/api/travel-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!res.ok) throw new Error('HTTP error');
      setState('success');
    } catch {
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <div className="text-center py-16 px-8 max-w-lg mx-auto">
        <div className="text-6xl mb-6">✨</div>
        <h2 className="font-serif text-2xl md:text-3xl text-stone-800 mb-4">
          Ta demande est bien reçue !
        </h2>
        <p className="text-stone-600 leading-relaxed mb-4">
          On commence déjà à imaginer ton aventure. On te répond dans les{' '}
          <strong>48h</strong> avec une première proposition sur mesure.
        </p>
        <p className="text-sm text-stone-400">
          Un email de confirmation vient de t'être envoyé.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">

      {/* Identité */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Prénom <span className="text-teal-600">*</span>
          </label>
          <input
            name="prenom" type="text" required
            value={formData.prenom} onChange={handleChange}
            placeholder="Emma"
            className="w-full px-4 py-3 border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Nom <span className="text-teal-600">*</span>
          </label>
          <input
            name="nom" type="text" required
            value={formData.nom} onChange={handleChange}
            placeholder="Dupont"
            className="w-full px-4 py-3 border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Email <span className="text-teal-600">*</span>
          </label>
          <input
            name="email" type="email" required
            value={formData.email} onChange={handleChange}
            placeholder="emma@exemple.fr"
            className="w-full px-4 py-3 border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Téléphone <span className="text-stone-400 text-xs">(optionnel)</span>
          </label>
          <input
            name="telephone" type="tel"
            value={formData.telephone} onChange={handleChange}
            placeholder="+33 6 12 34 56 78"
            className="w-full px-4 py-3 border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-white"
          />
        </div>
      </div>

      {/* Voyage */}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Destination rêvée
        </label>
        <input
          name="destination" type="text"
          value={formData.destination} onChange={handleChange}
          placeholder="Madère, Islande, Japon… ou encore ouverte !"
          className="w-full px-4 py-3 border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition bg-white"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Style de voyage
          </label>
          <select
            name="style_voyage"
            value={formData.style_voyage} onChange={handleChange}
            className="w-full px-4 py-3 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition bg-white"
          >
            <option value="">Choisir…</option>
            <option value="slow-travel">Slow Travel</option>
            <option value="aventure">Aventure & Randonnée</option>
            <option value="culture">Culture & Découvertes</option>
            <option value="gastronomie">Gastronomie & Terroir</option>
            <option value="nature">Nature & Éco-tourisme</option>
            <option value="detente">Détente & Ressourcement</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Durée (jours)
          </label>
          <input
            name="duree_jours" type="number" min="1" max="90"
            value={formData.duree_jours} onChange={handleChange}
            placeholder="7"
            className="w-full px-4 py-3 border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 transition bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Voyageurs
          </label>
          <select
            name="nb_voyageurs"
            value={formData.nb_voyageurs} onChange={handleChange}
            className="w-full px-4 py-3 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition bg-white"
          >
            {[1, 2, 3, 4, 5, 6].map(n => (
              <option key={n} value={n}>
                {n} personne{n > 1 ? 's' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Budget par personne
          </label>
          <select
            name="budget_fourchette"
            value={formData.budget_fourchette} onChange={handleChange}
            className="w-full px-4 py-3 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition bg-white"
          >
            <option value="">Choisir…</option>
            <option value="moins-1000">Moins de 1 000 €</option>
            <option value="1000-2000">1 000 – 2 000 €</option>
            <option value="2000-3500">2 000 – 3 500 €</option>
            <option value="3500-5000">3 500 – 5 000 €</option>
            <option value="plus-5000">Plus de 5 000 €</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Mois de départ envisagé
          </label>
          <select
            name="mois_depart"
            value={formData.mois_depart} onChange={handleChange}
            className="w-full px-4 py-3 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-600 transition bg-white"
          >
            <option value="">Flexible</option>
            {[
              'Janvier','Février','Mars','Avril','Mai','Juin',
              'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
            ].map(m => (
              <option key={m} value={m.toLowerCase()}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Dis-nous en plus sur votre voyage rêvé
        </label>
        <textarea
          name="notes"
          value={formData.notes} onChange={handleChange}
          rows={4}
          placeholder="Vos envies, contraintes, ce qui vous a inspiré… Plus vous nous en dites, plus on peut créer quelque chose de vraiment sur mesure."
          className="w-full px-4 py-3 border border-stone-200 rounded-lg text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600 transition resize-none bg-white"
        />
      </div>

      {state === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 text-center">
          Une erreur est survenue. Écris-nous directement à{' '}
          <a href="mailto:contact@heldonica.fr" className="underline font-medium">
            contact@heldonica.fr
          </a>
        </div>
      )}

      <button
        type="submit"
        disabled={state === 'loading'}
        className="w-full bg-teal-700 hover:bg-teal-800 active:bg-teal-900 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-4 px-8 rounded-lg transition-all text-base"
      >
        {state === 'loading'
          ? '✈️ Envoi en cours…'
          : 'Envoyer ma demande de conception sur mesure ✈️'}
      </button>

      <p className="text-xs text-stone-400 text-center">
        Réponse garantie sous 48h · Aucun engagement · Données protégées
      </p>
    </form>
  );
}
