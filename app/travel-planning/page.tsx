'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'

const SITE_URL = 'https://heldonica.fr'

type Testimonial = {
  id: string;
  name: string;
  location: string;
  quote: string;
  destination: string;
  rating: number;
  avatar_url: string | null;
  source: string;
  display_order: number;
};

const FAQS = [
  { zone: 'faq_1', q: 'Dans combien de temps reçoit-on la proposition ?', a: 'Sous 48h ouvrées maximum. On analyse ta demande en détail avant de te répondre avec une proposition concrète.' },
  { zone: 'faq_2', q: "La destination doit-elle être dans la liste ?", a: 'Non — on peut aussi concevoir ton voyage sur une destination hors liste si elle correspond à nos valeurs slow travel. On fait des recherches approfondies pour chaque nouvelle destination.' },
  { zone: 'faq_3', q: "Peut-on modifier l'itinéraire après validation ?", a: "Oui, jusqu'à 2 allers-retours inclus dans la formule. On ajuste jusqu'à ce que le planning soit parfait pour toi." },
  { zone: 'faq_4', q: 'Tu travailles avec des agences partenaires ?', a: 'Non. On conçoit nous-mêmes, sans commission cachée. Chaque adresse est testée ou recommandée par quelqu\'un en qui on a confiance.' },
  { zone: 'faq_5', q: 'Est-ce adapté aux voyages en famille ?', a: "On se spécialise dans les voyages en couple. Pour les familles, on peut orienter vers des ressources adaptées — mais notre cœur de métier reste le slow travel à deux." },
]

const TESTIMONIALS_DATA_FALLBACK = [
  { zone: 'testimonial_1', text: 'On voulait du vrai, pas du touristique. Heldonica nous a trouvé une quinta sauvage qu\'on n\'aurait jamais découverte seuls.', author: 'Sophie & Marc — Madère, Mai 2025', dest: 'Madère' },
  { zone: 'testimonial_2', text: "L'itinéraire slow était tellement bien pensé qu'on n'a pas eu à réfléchir une seule fois. Juste à se laisser porter.", author: 'Julie & Alex — Monténégro, Septembre 2025', dest: 'Monténégro' },
  { zone: 'testimonial_3', text: 'On est partis 10 jours en Roumanie sans savoir par où commencer. Le carnet Heldonica a été notre meilleur investissement voyage.', author: 'Camille & Thomas — Roumanie, Juin 2025', dest: 'Roumanie' },
]

const PRICING_PLANS = [
  {
    zone: 'plan_1',
    name: 'Essentielle',
    price: '250€',
    desc: 'Pour ceux qui veulent l\'itinéraire clé en main',
    features: ['Itinéraire jour par jour personnalisé', 'Carnet de route PDF complet', '1h de brief en visio pour cerner tes envies', 'Liens directs hébergements & restaurants'],
    popular: false,
  },
  {
    zone: 'plan_2',
    name: 'Complète',
    price: '450€',
    desc: 'Le plus complet — on s\'occupe de tout',
    features: ['Tout l\'Essentiel', 'Réservations hébergements incluses', 'Accès au carnet d\'adresses privé Heldonica', 'Suivi WhatsApp pendant ton voyage'],
    popular: true,
  },
  {
    zone: 'plan_3',
    name: 'Sur-Mesure',
    price: 'Sur devis',
    desc: 'Voyages complexes, 2+ semaines, destinations multiples',
    features: ['Tout la Complète', 'Itinéraires multi-destinations', 'Événements spéciaux (lune de miel, anniversaire)', 'Conciergerie dédiée 24/7'],
    popular: false,
  },
]

const FORM_DESTINATIONS = [
  'Madère', 'Monténégro', 'Roumanie', 'Lisbonne', 'Île-de-France',
  'Colombie', 'Normandie', 'Suisse', 'Sardaigne',
  'Sicile', 'Naples', 'Malte', 'Corse',
]

export default function TravelPlanningPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    firstName: '', email: '', destination: '', travelers: 'En duo / couple (Recommandé)', duration: '', budget: '', startDate: '', notes: '',
  })
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formError, setFormError] = useState('')
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])

  // Fetch testimonials from API
  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch('/api/cms/testimonials');
        if (res.ok) {
          const data = await res.json();
          if (data.testimonials && Array.isArray(data.testimonials)) {
            setTestimonials(data.testimonials);
          }
        }
      } catch {
        // Use fallback on error
      }
    }
    fetchTestimonials();
  }, []);

  // Convert testimonials to display format
  const testimonialsData = testimonials.length > 0
    ? testimonials.slice(0, 3).map((t, i) => ({
        zone: `testimonial_${i + 1}`,
        text: t.quote,
        author: t.name,
        dest: t.destination || t.location || 'Destination',
      }))
    : TESTIMONIALS_DATA_FALLBACK;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus('loading')
    setFormError('')
    try {
      const res = await fetch('/api/demandes-travel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prenom: formData.firstName,
          email: formData.email,
          destination: formData.destination,
          travelers: formData.travelers,
          duree: formData.duration,
          budget: formData.budget,
          date_depart: formData.startDate || null,
          message: formData.notes,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'travel_planning_form_submit', { destination: formData.destination })
      }
      setFormStatus('success')
    } catch (err: any) {
      setFormStatus('error')
      setFormError(err.message || 'Une erreur est survenue')
    }
  }

  return (
    <InlineEditProvider page="travel-planning">
      <Script id="service-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'Travel Planning sur mesure Heldonica',
          provider: { '@type': 'Organization', name: 'Heldonica', url: SITE_URL },
          description: 'Conception de voyages slow travel sur mesure pour couples',
          offers: [
            { '@type': 'Offer', name: 'Formule Essentielle', price: '250', priceCurrency: 'EUR' },
            { '@type': 'Offer', name: 'Formule Complète', price: '450', priceCurrency: 'EUR' },
          ],
        }),
      }} />
      <Script id="faq-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQS.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }),
      }} />

      <Header />
      <Breadcrumb />
      <main>
        {/* Hero */}
        <section className="relative min-h-[75vh] flex items-center overflow-hidden bg-stone-900">
          <EditableZone page="travel-planning" zone="hero_image_url" type="image"
            fallback="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1920&h=1080&fit=crop"
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="relative container py-20">
            <EditableZone page="travel-planning" zone="hero_badge" fallback="Slow travel vécu en duo · Hors sentiers · Île-de-France"
              className="text-xs uppercase tracking-[0.2em] text-teal mb-4 font-semibold block"
            />
            <EditableZone page="travel-planning" zone="hero_title" fallback="Ton voyage en couple, conçu sur mesure"
              className="text-4xl md:text-6xl font-serif text-white max-w-2xl mb-5 leading-tight block"
            />
            <EditableZone page="travel-planning" zone="hero_text" fallback="On s'occupe de tout — tu n'as qu'à vivre l'aventure."
              className="text-white/80 max-w-xl text-lg leading-relaxed mb-8 block"
            />
            <a href="#formulaire" className="inline-flex items-center gap-2 rounded-full bg-eucalyptus px-7 py-3.5 text-sm font-semibold text-white hover:bg-eucalyptus/90 transition-all shadow-lg">
              <EditableZone page="travel-planning" zone="hero_cta" fallback="Démarrer ma demande" />
            </a>
          </div>
        </section>

        {/* Promesse — 3 colonnes */}
        <section className="bg-white py-20">
          <div className="container max-w-5xl">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { zone: 'promise_1', emoji: '🗺️', fallbackTitle: 'Itinéraire sur mesure', fallbackText: 'Chaque jour pensé pour toi — rythme slow, pépites dénichées sur le terrain.' },
                { zone: 'promise_2', emoji: '🏡', fallbackTitle: 'Hébergements triés', fallbackText: 'Boutique-hôtels, masseries, riads — uniquement ce qu\'on referait demain.' },
                { zone: 'promise_3', emoji: '📞', fallbackTitle: 'Suivi humain', fallbackText: 'Un interlocuteur unique du devis au retour. On reste disponibles.' },
              ].map((p) => (
                <div key={p.zone} className="text-center">
                  <div className="w-14 h-14 rounded-2xl bg-teal/10 flex items-center justify-center mx-auto mb-4 text-2xl">{p.emoji}</div>
                  <EditableZone page="travel-planning" zone={`${p.zone}_title`} fallback={p.fallbackTitle}
                    className="font-semibold text-mahogany mb-2 block"
                  />
                  <EditableZone page="travel-planning" zone={`${p.zone}_text`} type="textarea" fallback={p.fallbackText}
                    className="text-sm text-charcoal/60 leading-relaxed block"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comment ça marche — 4 étapes */}
        <section className="bg-cloud-dancer py-20">
          <div className="container max-w-4xl">
            <EditableZone page="travel-planning" zone="steps_title" fallback="Comment ça marche"
              className="text-3xl font-serif text-mahogany text-center mb-12 block"
            />
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { zone: 'step_1', step: '1', fallbackTitle: 'Tu remplis le formulaire', fallbackText: '5 minutes pour nous dire tes envies, tes contraintes et ton budget.' },
                { zone: 'step_2', step: '2', fallbackTitle: 'Proposition sous 48h', fallbackText: 'On analyse, on conçoit et on t\'envoie une proposition détaillée.' },
                { zone: 'step_3', step: '3', fallbackTitle: "On affine ensemble", fallbackText: "Allers-retours jusqu'à la perfection — ton voyage, pas le nôtre." },
                { zone: 'step_4', step: '4', fallbackTitle: "Tu pars l'esprit libre", fallbackText: 'Carnet de route, réservations, contacts — tout est prêt.' },
              ].map((etape) => (
                <div key={etape.zone} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-eucalyptus text-white flex items-center justify-center mx-auto mb-4 text-lg font-bold">{etape.step}</div>
                  <EditableZone page="travel-planning" zone={`${etape.zone}_title`} fallback={etape.fallbackTitle}
                    className="font-semibold text-mahogany mb-2 block"
                  />
                  <EditableZone page="travel-planning" zone={`${etape.zone}_text`} type="textarea" fallback={etape.fallbackText}
                    className="text-sm text-charcoal/60 block"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tarifs */}
        <section className="bg-white py-20">
          <div className="container max-w-5xl">
            <EditableZone page="travel-planning" zone="pricing_title" fallback="Tarifs transparents"
              className="text-3xl font-serif text-mahogany text-center mb-4 block"
            />
            <EditableZone page="travel-planning" zone="pricing_subtitle" fallback="Des formules claires, sans surprise. Le devis est gratuit et sans engagement."
              className="text-charcoal/60 text-sm text-center mb-10 max-w-lg mx-auto block"
            />
            <div className="grid md:grid-cols-3 gap-6">
              {PRICING_PLANS.map((plan) => (
                <div key={plan.zone} className={`rounded-2xl border-2 p-6 flex flex-col ${plan.popular ? 'border-eucalyptus bg-eucalyptus/5 shadow-lg scale-105' : 'border-stone-200 bg-white'}`}>
                  {plan.popular && <EditableZone page="travel-planning" zone={`${plan.zone}_badge`} fallback="Le plus populaire"
                    className="text-[10px] font-bold text-eucalyptus uppercase tracking-widest mb-2 block"
                  />}
                  <h3 className="text-xl font-serif font-bold text-mahogany mb-1">
                    <EditableZone page="travel-planning" zone={`${plan.zone}_name`} fallback={plan.name} className="inline" />
                  </h3>
                  <EditableZone page="travel-planning" zone={`${plan.zone}_price`} fallback={plan.price}
                    className="text-3xl font-bold text-eucalyptus mb-3 block"
                  />
                  <EditableZone page="travel-planning" zone={`${plan.zone}_desc`} fallback={plan.desc}
                    className="text-sm text-charcoal/60 mb-6 block"
                  />
                  <ul className="space-y-2 mb-8 flex-1">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="text-sm text-charcoal/70 flex items-start gap-2 before:content-['✓'] before:text-eucalyptus before:font-bold">
                        <EditableZone page="travel-planning" zone={`${plan.zone}_feature_${fi + 1}`} fallback={f} className="inline" />
                      </li>
                    ))}
                  </ul>
                  <a href="#formulaire" className={`block text-center rounded-full py-3 text-sm font-semibold transition-all ${plan.popular ? 'bg-eucalyptus text-white hover:bg-eucalyptus/90' : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'}`}>
                    <EditableZone page="travel-planning" zone={`${plan.zone}_cta`} fallback={plan.name === 'Sur-Mesure' ? 'Demander un devis' : 'Choisir cette formule'} className="inline" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="bg-cloud-dancer py-20">
          <div className="container max-w-5xl">
            <EditableZone page="travel-planning" zone="testimonials_title" fallback="Ils ont voyagé avec nous"
              className="text-3xl font-serif text-mahogany text-center mb-10 block"
            />
            <div className="grid md:grid-cols-3 gap-6">
              {testimonialsData.map((t) => (
                <div key={t.zone} className="bg-white rounded-xl border border-stone-200 p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-sm">★</span>)}
                  </div>
                  <EditableZone page="travel-planning" zone={`${t.zone}_text`} type="textarea" fallback={t.text}
                    className="text-sm text-charcoal/70 leading-relaxed mb-4 italic block"
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-eucalyptus/10 flex items-center justify-center text-eucalyptus font-semibold text-sm">{t.author[0]}</div>
                    <div>
                      <EditableZone page="travel-planning" zone={`${t.zone}_author`} fallback={t.author}
                        className="text-sm font-semibold text-mahogany block"
                      />
                      <EditableZone page="travel-planning" zone={`${t.zone}_dest`} fallback={t.dest}
                        className="text-xs text-charcoal/40 block"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Formulaire */}
        <section id="formulaire" className="bg-white py-20 scroll-mt-20">
          <div className="container max-w-2xl">
            <EditableZone page="travel-planning" zone="form_title" fallback="Prêt(e) à partir autrement ?"
              className="text-3xl font-serif text-mahogany text-center mb-2 block"
            />
            <EditableZone page="travel-planning" zone="form_text" fallback="Réponds à ces quelques questions — on te fait une proposition sous 48h."
              className="text-charcoal/60 text-sm text-center mb-8 block"
            />

            {formStatus === 'success' ? (
              <div className="rounded-2xl bg-eucalyptus/5 border border-eucalyptus/20 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-eucalyptus/10 flex items-center justify-center mx-auto mb-4 text-3xl">✉️</div>
                <EditableZone page="travel-planning" zone="success_title" fallback="Merci ! On a reçu ta demande."
                  className="text-xl font-serif text-mahogany mb-2 block"
                />
                <EditableZone page="travel-planning" zone="success_text" fallback="On te répond sous 48h ouvrées maximum. Prépare-toi à rêver — on s'occupe du reste."
                  className="text-sm text-charcoal/60 block"
                />
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-1.5">Ton prénom</label>
                    <input type="text" name="firstName" value={formData.firstName} onChange={handleFormChange} required
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-1.5">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleFormChange} required
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-1.5">Destination souhaitée</label>
                    <select name="destination" value={formData.destination} onChange={handleFormChange} required
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus bg-white">
                      <option value="">Sélectionne une destination</option>
                      {FORM_DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                      <option value="autre">Autre (hors liste)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-1.5">Nombre de voyageurs</label>
                    <select name="travelers" value={formData.travelers} onChange={handleFormChange} required
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus bg-white">
                      <option value="En duo / couple (Recommandé)">En duo / couple (Recommandé)</option>
                      <option value="Seul(e)">Seul(e)</option>
                      <option value="En famille">En famille</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-1.5">Durée envisagée</label>
                    <select name="duration" value={formData.duration} onChange={handleFormChange} required
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus bg-white">
                      <option value="">Sélectionne une durée</option>
                      <option value="1 semaine">1 semaine</option>
                      <option value="2 semaines">2 semaines</option>
                      <option value="+2 semaines">+2 semaines</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-1.5">Budget estimé</label>
                    <select name="budget" value={formData.budget} onChange={handleFormChange} required
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus bg-white">
                      <option value="">Sélectionne un budget</option>
                      <option value="<1000€">&lt;1000€</option>
                      <option value="1000-2000€">1000-2000€</option>
                      <option value="2000-3500€">2000-3500€</option>
                      <option value="+3500€">+3500€</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-1.5">Date de départ souhaitée</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-1.5">Ce qui te tient à cœur</label>
                  <textarea name="notes" value={formData.notes} onChange={handleFormChange} rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus resize-none"
                    placeholder="Rythme, centres d'intérêt, contraintes, rêves… tout ce qui te passe par la tête." />
                </div>

                {/* Honeypot */}
                <div className="hidden" aria-hidden="true">
                  <input type="text" name="website_url" tabIndex={-1} autoComplete="off" />
                </div>

                {formStatus === 'error' && <p className="text-red-500 text-sm">{formError}</p>}

                <button type="submit" disabled={formStatus === 'loading'}
                  className="w-full py-3.5 bg-eucalyptus text-white rounded-xl text-sm font-semibold hover:bg-eucalyptus/90 disabled:opacity-50 transition-all">
                  {formStatus === 'loading' ? 'Envoi en cours…' : 'Envoyer ma demande'}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-cloud-dancer py-20">
          <div className="container max-w-3xl">
            <EditableZone page="travel-planning" zone="faq_title" fallback="Questions fréquentes"
              className="text-3xl font-serif text-mahogany text-center mb-8 block"
            />
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={faq.zone} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex justify-between items-center p-5 text-left font-semibold text-mahogany hover:bg-stone-50 transition-colors">
                    <EditableZone page="travel-planning" zone={`${faq.zone}_q`} fallback={faq.q} className="inline" />
                    <span className={`text-eucalyptus text-xl transition-transform ${faqOpen === i ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {faqOpen === i && (
                    <EditableZone page="travel-planning" zone={`${faq.zone}_a`} type="textarea" fallback={faq.a}
                      className="px-5 pb-5 text-sm text-charcoal/70 leading-relaxed block"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-mahogany text-white py-20">
          <div className="container text-center max-w-2xl">
            <EditableZone page="travel-planning" zone="cta_title" fallback="Envie de partir autrement ?"
              className="text-3xl md:text-4xl font-serif mb-4 block"
            />
            <EditableZone page="travel-planning" zone="cta_text" type="textarea" fallback="Un voyage pensé pour toi, pas un itinéraire générique. Remplis le formulaire et on te prépare quelque chose d'unique."
              className="text-white/70 mb-8 block"
            />
            <a href="#formulaire" className="inline-flex px-7 py-3 rounded-xl bg-eucalyptus text-white font-semibold hover:bg-eucalyptus/90 transition-colors">
              <EditableZone page="travel-planning" zone="cta_button" fallback="Démarrer ma demande →" />
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
