'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function TravelPlanningForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Étape 1
    tripType: '',
    vibe: '',
    destination: '',
    // Étape 2
    duration: '',
    budget: '',
    requirements: '',
    // Étape 3
    email: '',
    phone: '',
    travelMemory: '',
    // Anti-spam
    honeypot: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const blockedDomains = ['mailinator.com', 'temp-mail.org', '10minutemail.com', 'guerrillamail.com'];
    const domain = email.split('@')[1];
    return re.test(email) && !blockedDomains.includes(domain);
  };

  const validatePhone = (phone: string) => {
    const re = /^\+?[0-9\s\-\(\)]{10,}$/;
    return re.test(phone);
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.tripType || !formData.vibe || !formData.destination) {
        setError('Veuillez remplir tous les champs de cette étape');
        return;
      }
      setError('');
      setStep(2);
    } else if (step === 2) {
      if (!formData.duration || !formData.budget || !formData.requirements) {
        setError('Veuillez remplir tous les champs de cette étape');
        return;
      }
      setError('');
      setStep(3);
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    // Vérifier le honeypot
    if (formData.honeypot) {
      console.log('Bot detected');
      return;
    }

    // Validation
    if (!validateEmail(formData.email)) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    if (!validatePhone(formData.phone)) {
      setError('Veuillez entrer un numéro de téléphone valide');
      return;
    }

    if (!formData.travelMemory.trim()) {
      setError('Veuillez partager votre plus beau souvenir de voyage');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Envoyer les données
      const response = await fetch('/api/travel-planning', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'envoi du formulaire');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-3xl font-serif font-bold text-mahogany mb-4">
              Merci pour votre confiance !
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              Votre demande a été reçue avec succès. Vérifiez votre email pour confirmer votre adresse.
            </p>
            <p className="text-gray-600 mb-8">
              Une fois confirmée, notre équipe Heldonica vous contactera sous 48h avec une première estimation de votre itinéraire sur-mesure.
            </p>
            <div className="bg-blue-50 p-6 rounded-lg mb-8">
              <p className="text-sm text-gray-700">
                <strong>Promis, pas de spam.</strong> Vos coordonnées servent uniquement à vous envoyer votre carnet de voyage personnalisé.
              </p>
            </div>
            <a href="/" className="inline-block bg-mahogany hover:bg-red-900 text-white px-8 py-3 rounded-lg font-semibold transition">
              ← Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-mahogany mb-4">
            Confiez-moi les clés de votre prochaine aventure.
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Un itinéraire sur-mesure, des pépites hôtelières dénichées par un expert, et zéro stress.
          </p>
          <p className="text-gray-500">
            Répondez à ces quelques questions (2 min) pour recevoir une première estimation.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-semibold text-mahogany">Étape {step} / 3</span>
            <span className="text-sm text-gray-600">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-mahogany h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {/* Honeypot (invisible) */}
          <input
            type="text"
            name="honeypot"
            value={formData.honeypot}
            onChange={handleChange}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Étape 1 : L'Inspiration */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">
                🌍 Étape 1 : L'Inspiration
              </h2>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-3">
                  Quel est l'objet de votre escapade ?
                </label>
                <div className="space-y-2">
                  {['Couple', 'Solo', 'Amis', 'Noces'].map(type => (
                    <label key={type} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="tripType"
                        value={type}
                        checked={formData.tripType === type}
                        onChange={handleChange}
                        className="w-4 h-4 text-mahogany"
                      />
                      <span className="ml-3 text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-3">
                  Quelle est la "vibe" recherchée ?
                </label>
                <div className="space-y-2">
                  {['Slow Travel & Détente', 'Aventure & Nature', 'Culture & Gastronomie'].map(vibe => (
                    <label key={vibe} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="vibe"
                        value={vibe}
                        checked={formData.vibe === vibe}
                        onChange={handleChange}
                        className="w-4 h-4 text-mahogany"
                      />
                      <span className="ml-3 text-gray-700">{vibe}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-3">
                  Avez-vous déjà une destination en tête ?
                </label>
                <div className="space-y-2">
                  {['Destination précise', 'Suggestions Heldonica'].map(opt => (
                    <label key={opt} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="destination"
                        value={opt}
                        checked={formData.destination === opt}
                        onChange={handleChange}
                        className="w-4 h-4 text-mahogany"
                      />
                      <span className="ml-3 text-gray-700">{opt}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Étape 2 : Budget & Logistique */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">
                💰 Étape 2 : Budget & Logistique
              </h2>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Durée du séjour (nombre de jours) *
                </label>
                <Input
                  type="number"
                  name="duration"
                  min="1"
                  max="365"
                  value={formData.duration}
                  onChange={handleChange}
                  placeholder="Ex: 7"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-3">
                  Budget total estimé (hors transport) *
                </label>
                <div className="space-y-2">
                  {[
                    { value: 'Authentique', label: '€ Authentique (moins de 50€/nuit)' },
                    { value: 'Confort', label: '€€ Confort & Charme (50-150€/nuit)' },
                    { value: 'Luxe', label: '€€€ Luxe & Pépites hôtelières (150€+/nuit)' }
                  ].map(opt => (
                    <label key={opt.value} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="budget"
                        value={opt.value}
                        checked={formData.budget === opt.value}
                        onChange={handleChange}
                        className="w-4 h-4 text-mahogany"
                      />
                      <span className="ml-3 text-gray-700">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Qu'est-ce qui est non-négociable pour vous ? *
                </label>
                <Textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleChange}
                  placeholder="Ex: une baignoire, vue montagne, calme absolu, pas de wifi..."
                  required
                />
              </div>
            </div>
          )}

          {/* Étape 3 : Validation */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">
                ✅ Étape 3 : Validation
              </h2>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Votre Email *
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="vous@exemple.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Votre Numéro de Téléphone *
                </label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+33 6 12 34 56 78"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Racontez-moi en une phrase votre plus beau souvenir de voyage. *
                </label>
                <Textarea
                  name="travelMemory"
                  value={formData.travelMemory}
                  onChange={handleChange}
                  placeholder="Votre réponse ici..."
                  required
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Promis, pas de spam.</strong> Vos coordonnées servent uniquement à vous envoyer votre carnet de voyage personnalisé.
                </p>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button
                type="button"
                onClick={() => setStep(step - 1)}
                variant="outline"
                className="flex-1"
              >
                ← Retour
              </Button>
            )}
            {step < 3 ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="flex-1 bg-mahogany hover:bg-red-900"
              >
                Suivant →
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-mahogany hover:bg-red-900"
              >
                {loading ? '⏳ Envoi en cours...' : '🚀 Envoyer ma demande'}
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
