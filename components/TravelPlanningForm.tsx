'use client';
import { useState } from 'react';

type FormState = 'idle' | 'loading' | 'success' | 'error';
type WizardStep = 1 | 2 | 3;

const STEPS = [
  { step: 1, title: 'Vos coordonnées', description: 'Comment vous contacter' },
  { step: 2, title: 'Votre voyage', description: 'Vos envies et besoins' },
  { step: 3, title: 'Validation', description: 'Confirmez votre demande' },
];

export default function TravelPlanningForm() {
  const [state, setState] = useState<FormState>('idle');
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
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

  const nextStep = () => {
    if (currentStep < 3) setCurrentStep((currentStep + 1) as WizardStep);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as WizardStep);
  };

  const canProceed = () => {
    if (currentStep === 1) return formData.prenom && formData.nom && formData.email;
    if (currentStep === 2) return true; // Optional fields
    return true;
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
        <h2 className="font-serif text-2xl md:text-3xl text-charcoal/90 mb-4">
          Ta demande est bien reçue !
        </h2>
        <p className="text-charcoal/70 leading-relaxed mb-4">
          On commence déjà à imaginer ton aventure. On te répond dans les{' '}
          <strong>48h</strong> avec une première proposition sur mesure.
        </p>
        <p className="text-sm text-charcoal/40">
          Un email de confirmation vient de t'être envoyé.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s) => (
            <div key={s.step} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                currentStep >= s.step 
                  ? 'bg-eucalyptus text-white' 
                  : 'bg-stone-200 text-stone-500'
              }`}>
                {currentStep > s.step ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : s.step}
              </div>
              {s.step < 3 && (
                <div className={`w-12 sm:w-20 h-0.5 mx-2 transition-colors ${
                  currentStep > s.step ? 'bg-eucalyptus' : 'bg-stone-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-charcoal/80">
            {STEPS[currentStep - 1].title}
          </p>
          <p className="text-xs text-charcoal/50">
            Étape {currentStep} sur 3 · {STEPS[currentStep - 1].description}
          </p>
        </div>
      </div>

      {/* Step 1: Identité */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">
                Prénom <span className="text-eucalyptus">*</span>
              </label>
              <input
                name="prenom" type="text" required
                value={formData.prenom} onChange={handleChange}
                placeholder="Emma"
                className="w-full px-4 py-3 border border-cloud-dancer rounded-lg text-charcoal/90 placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-eucalyptus focus:border-transparent transition bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">
                Nom <span className="text-eucalyptus">*</span>
              </label>
              <input
                name="nom" type="text" required
                value={formData.nom} onChange={handleChange}
                placeholder="Dupont"
                className="w-full px-4 py-3 border border-cloud-dancer rounded-lg text-charcoal/90 placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-eucalyptus focus:border-transparent transition bg-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">
                Email <span className="text-eucalyptus">*</span>
              </label>
              <input
                name="email" type="email" required
                value={formData.email} onChange={handleChange}
                placeholder="emma@exemple.fr"
                className="w-full px-4 py-3 border border-cloud-dancer rounded-lg text-charcoal/90 placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-eucalyptus focus:border-transparent transition bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">
                Téléphone <span className="text-charcoal/40 text-xs">(optionnel)</span>
              </label>
              <input
                name="telephone" type="tel"
                value={formData.telephone} onChange={handleChange}
                placeholder="+33 6 12 34 56 78"
                className="w-full px-4 py-3 border border-cloud-dancer rounded-lg text-charcoal/90 placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-eucalyptus focus:border-transparent transition bg-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Voyage */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label className="block text-sm font-medium text-charcoal/80 mb-1.5">
              Destination rêvée
            </label>
            <input
              name="destination" type="text"
              value={formData.destination} onChange={handleChange}
              placeholder="Madère, Islande, Japon… ou encore ouverte !"
              className="w-full px-4 py-3 border border-cloud-dancer rounded-lg text-charcoal/90 placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-eucalyptus focus:border-transparent transition bg-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">
                Style de voyage
              </label>
              <select
                name="style_voyage"
                value={formData.style_voyage} onChange={handleChange}
                className="w-full px-4 py-3 border border-cloud-dancer rounded-lg text-charcoal/90 focus:outline-none focus:ring-2 focus:ring-eucalyptus transition bg-white"
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
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">
                Durée (jours)
              </label>
              <input
                name="duree_jours" type="number" min="1" max="90"
                value={formData.duree_jours} onChange={handleChange}
                placeholder="7"
                className="w-full px-4 py-3 border border-cloud-dancer rounded-lg text-charcoal/90 placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-eucalyptus transition bg-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">
                Voyageurs
              </label>
              <select
                name="nb_voyageurs"
                value={formData.nb_voyageurs} onChange={handleChange}
                className="w-full px-4 py-3 border border-cloud-dancer rounded-lg text-charcoal/90 focus:outline-none focus:ring-2 focus:ring-eucalyptus transition bg-white"
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
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">
                Budget par personne
              </label>
              <select
                name="budget_fourchette"
                value={formData.budget_fourchette} onChange={handleChange}
                className="w-full px-4 py-3 border border-cloud-dancer rounded-lg text-charcoal/90 focus:outline-none focus:ring-2 focus:ring-eucalyptus transition bg-white"
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
              <label className="block text-sm font-medium text-charcoal/80 mb-1.5">
                Mois de départ
              </label>
              <select
                name="mois_depart"
                value={formData.mois_depart} onChange={handleChange}
                className="w-full px-4 py-3 border border-cloud-dancer rounded-lg text-charcoal/90 focus:outline-none focus:ring-2 focus:ring-eucalyptus transition bg-white"
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
            <label className="block text-sm font-medium text-charcoal/80 mb-1.5">
              Vos envies, contraintes, ce qui vous inspire…
            </label>
            <textarea
              name="notes"
              value={formData.notes} onChange={handleChange}
              rows={3}
              placeholder="Plus vous nous en dites, plus on peut créer quelque chose de sur mesure."
              className="w-full px-4 py-3 border border-cloud-dancer rounded-lg text-charcoal/90 placeholder:text-charcoal/40 focus:outline-none focus:ring-2 focus:ring-eucalyptus transition resize-none bg-white"
            />
          </div>
        </div>
      )}

      {/* Step 3: Validation */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-cloud-dancer/30 rounded-lg p-4 space-y-2">
            <h3 className="font-medium text-charcoal/80">Résumé de votre demande</h3>
            <dl className="text-sm space-y-1">
              <div className="flex justify-between">
                <dt className="text-charcoal/50">Nom:</dt>
                <dd className="text-charcoal/90">{formData.prenom} {formData.nom}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-charcoal/50">Email:</dt>
                <dd className="text-charcoal/90">{formData.email}</dd>
              </div>
              {formData.destination && (
                <div className="flex justify-between">
                  <dt className="text-charcoal/50">Destination:</dt>
                  <dd className="text-charcoal/90">{formData.destination}</dd>
                </div>
              )}
              {formData.nb_voyageurs && (
                <div className="flex justify-between">
                  <dt className="text-charcoal/50"> Voyageurs:</dt>
                  <dd className="text-charcoal/90">{formData.nb_voyageurs} personne{parseInt(formData.nb_voyageurs) > 1 ? 's' : ''}</dd>
                </div>
              )}
            </dl>
          </div>
          <p className="text-xs text-charcoal/50 text-center">
            Envoi = accord pour être recontacté sous 48h · Aucun engagement
          </p>
        </div>
      )}

      {state === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 text-center">
          Une erreur est survenue. Écris-nous à{' '}
          <a href="mailto:contact@heldonica.fr" className="underline font-medium">
            contact@heldonica.fr
          </a>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-6">
        {currentStep > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 border border-charcoal/20 text-charcoal/70 font-medium py-3 px-6 rounded-lg hover:bg-charcoal/5 transition"
          >
            ← Retour
          </button>
        )}
        {currentStep < 3 ? (
          <button
            type="button"
            onClick={nextStep}
            disabled={!canProceed()}
            className="flex-1 bg-eucalyptus hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition"
          >
            Étape suivante →
          </button>
        ) : (
          <button
            type="submit"
            disabled={state === 'loading'}
            className="flex-1 bg-eucalyptus hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition"
          >
            {state === 'loading' ? '✈️ Envoi en cours…' : 'Envoyer ma demande'}
          </button>
        )}
      </div>
    </form>
  );
}
