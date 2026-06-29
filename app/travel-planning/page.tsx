'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import NewsletterForm from '@/components/NewsletterForm'

const SITE_URL = 'https://heldonica.fr'

const faqs = [
  { q: 'Dans combien de temps reçoit-on la proposition ?', a: 'Sous 48h ouvrées maximum. On analyse ta demande en détail avant de te répondre avec une proposition concrète.' },
  { q: 'La destination doit-elle être dans votre liste ?', a: 'Non — on peut aussi travailler sur une destination hors liste si elle correspond à nos valeurs slow travel. On fait des recherches approfondies pour chaque nouvelle destination.' },
  { q: 'Peut-on modifier l\'itinéraire après validation ?', a: 'Oui, jusqu\'à 2 allers-retours inclus dans la formule. On ajuste jusqu\'à ce que le planning soit parfait pour vous.' },
  { q: 'Travaillez-vous avec des agences partenaires ?', a: 'Non. On conçoit nous-mêmes, sans commission cachée. Chaque adresse est testée ou recommandée par quelqu\'un en qui on a confiance.' },
  { q: 'Est-ce adapté aux voyages en famille ?', a: 'On se spécialise dans les voyages en couple. Pour les familles, on peut orienter vers des ressources adaptées — mais notre cœur de métier reste le slow travel à deux.' },
]

const testimonials = [
  { text: 'On voulait du vrai, pas du touristique. Heldonica nous a trouvé une quinta qu\'on n\'aurait jamais découverte seuls.', author: 'Sophie & Marc', dest: 'Madère' },
  { text: 'L\'itinéraire était tellement bien pensé qu\'on n\'a pas eu à réfléchir une seule fois. Juste à profiter.', author: 'Julie & Alex', dest: 'Monténégro' },
  { text: 'On est partis 10 jours en Roumanie sans savoir par où commencer. Le carnet Heldonica a été notre meilleur investissement voyage.', author: 'Camille & Thomas', dest: 'Roumanie' },
]

const PRICING_PLANS = [
  {
    name: 'Essentielle',
    price: '250€',
    desc: 'Pour ceux qui veulent l\'itinéraire clé en main',
    features: [
      'Itinéraire jour par jour personnalisé',
      'Carnet de route PDF complet',
      '1h de brief en visio pour cerner vos envies',
      'Liens directs hébergements & restaurants',
    ],
    popular: false,
  },
  {
    name: 'Complète',
    price: '450€',
    desc: 'Le plus complet — on s\'occupe de tout',
    features: [
      'Tout l\'Essentiel',
      'Réservations hébergements incluses',
      'Accès au carnet d\'adresses privé Heldonica',
      'Suivi WhatsApp pendant le voyage',
    ],
    popular: true,
  },
  {
    name: 'Sur-Mesure',
    price: 'Sur devis',
    desc: 'Voyages complexes, 2+ semaines, destinations multiples',
    features: [
      'Tout la Complète',
      'Itinéraires multi-destinations',
      'Événements spéciaux (lune de miel, anniversaire)',
      'Conciergerie dédiée 24/7',
    ],
    popular: false,
  },
]

const FORM_DESTINATIONS = [
  'Madère', 'Monténégro', 'Roumanie', 'Lisbonne', 'Paris',
  'Colombie', 'Portugal', 'Normandie', 'Suisse', 'Sardaigne',
  'Sicile', 'Naples', 'Malte', 'Corse',
]

export default function TravelPlanningPage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    firstName: '', email: '', destination: '', duration: '', budget: '', startDate: '', notes: '',
  })
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [formError, setFormError] = useState('')

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormStatus('loading')
    setFormError('')
    try {
      const res = await fetch('/api/travel-planning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          email: formData.email,
          destination: formData.destination,
          duration: formData.duration,
          budget: formData.budget,
          startDate: formData.startDate,
          notes: formData.notes,
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
    <>
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
          mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        }),
      }} />

      <Header />
      <Breadcrumb />
      <main>
        {/* Hero */}
        <section className="relative min-h-[75vh] flex items-center overflow-hidden bg-stone-900">
          <Image src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=1080&fit=crop" alt="Voyage sur mesure en couple" fill className="object-cover opacity-50" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
          <div className="relative container py-20">
            <p className="text-xs uppercase tracking-[0.2em] text-teal mb-4 font-semibold">Voyage sur mesure</p>
            <h1 className="text-4xl md:text-6xl font-serif text-white max-w-2xl mb-5 leading-tight">
              Ton voyage en couple, conçu sur mesure
            </h1>
            <p className="text-white/80 max-w-xl text-lg leading-relaxed mb-8">
              On s&apos;occupe de tout — tu n&apos;as qu&apos;à vivre l&apos;aventure.
            </p>
            <a href="#formulaire" className="inline-flex items-center gap-2 rounded-full bg-eucalyptus px-7 py-3.5 text-sm font-semibold text-white hover:bg-eucalyptus/90 transition-all shadow-lg">
              Démarrer ma demande
            </a>
          </div>
        </section>

        {/* Promesse — 3 colonnes */}
        <section className="bg-white py-20">
          <div className="container max-w-5xl">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-teal/10 flex items-center justify-center mx-auto mb-4 text-2xl">🗺️</div>
                <h3 className="font-semibold text-mahogany mb-2">Itinéraire sur mesure</h3>
                <p className="text-sm text-charcoal/60 leading-relaxed">Chaque jour pensé pour vous deux — rythme slow, pépites dénichées sur le terrain.</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-teal/10 flex items-center justify-center mx-auto mb-4 text-2xl">🏡</div>
                <h3 className="font-semibold text-mahogany mb-2">Hébergements triés</h3>
                <p className="text-sm text-charcoal/60 leading-relaxed">Boutique-hôtels, masseries, riads — uniquement ce qu&apos;on referait demain.</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-teal/10 flex items-center justify-center mx-auto mb-4 text-2xl">📞</div>
                <h3 className="font-semibold text-mahogany mb-2">Suivi humain</h3>
                <p className="text-sm text-charcoal/60 leading-relaxed">Un interlocuteur unique du devis au retour. On reste disponibles.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Comment ça marche — 4 étapes */}
        <section className="bg-cloud-dancer py-20">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-serif text-mahogany text-center mb-12">Comment ça marche</h2>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Tu remplis le formulaire', desc: '5 minutes pour nous dire vos envies, contraintes et budget.' },
                { step: '2', title: 'Proposition sous 48h', desc: 'On analyse, on conçoit et on vous envoie une proposition détaillée.' },
                { step: '3', title: 'On affine ensemble', desc: 'Allers-retours jusqu\'à la perfection — votre voyage, pas le nôtre.' },
                { step: '4', title: 'Tu pars l\'esprit libre', desc: 'Carnet de route, réservations, contacts — tout est prêt.' },
              ].map((etape) => (
                <div key={etape.step} className="text-center">
                  <div className="w-12 h-12 rounded-full bg-eucalyptus text-white flex items-center justify-center mx-auto mb-4 text-lg font-bold">{etape.step}</div>
                  <h3 className="font-semibold text-mahogany mb-2">{etape.title}</h3>
                  <p className="text-sm text-charcoal/60">{etape.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tarifs */}
        <section className="bg-white py-20">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-serif text-mahogany text-center mb-4">Tarifs transparents</h2>
            <p className="text-charcoal/60 text-sm text-center mb-10 max-w-lg mx-auto">Des formules claires, sans surprise. Le devis est gratuit et sans engagement.</p>
            <div className="grid md:grid-cols-3 gap-6">
              {PRICING_PLANS.map((plan) => (
                <div key={plan.name} className={`rounded-2xl border-2 p-6 flex flex-col ${plan.popular ? 'border-eucalyptus bg-eucalyptus/5 shadow-lg scale-105' : 'border-stone-200 bg-white'}`}>
                  {plan.popular && <span className="text-[10px] font-bold text-eucalyptus uppercase tracking-widest mb-2">Le plus populaire</span>}
                  <h3 className="text-xl font-serif font-bold text-mahogany mb-1">{plan.name}</h3>
                  <p className="text-3xl font-bold text-eucalyptus mb-3">{plan.price}</p>
                  <p className="text-sm text-charcoal/60 mb-6">{plan.desc}</p>
                  <ul className="space-y-2 mb-8 flex-1">
                    {plan.features.map((f) => <li key={f} className="text-sm text-charcoal/70 flex items-start gap-2 before:content-['✓'] before:text-eucalyptus before:font-bold"> {f}</li>)}
                  </ul>
                  <a href="#formulaire" className={`block text-center rounded-full py-3 text-sm font-semibold transition-all ${plan.popular ? 'bg-eucalyptus text-white hover:bg-eucalyptus/90' : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'}`}>
                    {plan.name === 'Sur-Mesure' ? 'Demander un devis' : 'Choisir cette formule'}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Témoignages */}
        <section className="bg-cloud-dancer py-20">
          <div className="container max-w-5xl">
            <h2 className="text-3xl font-serif text-mahogany text-center mb-10">Ils ont voyagé avec nous</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {testimonials.map((t) => (
                <div key={t.author} className="bg-white rounded-xl border border-stone-200 p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => <span key={i} className="text-amber-400 text-sm">★</span>)}
                  </div>
                  <p className="text-sm text-charcoal/70 leading-relaxed mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-eucalyptus/10 flex items-center justify-center text-eucalyptus font-semibold text-sm">{t.author[0]}</div>
                    <div>
                      <p className="text-sm font-semibold text-mahogany">{t.author}</p>
                      <p className="text-xs text-charcoal/40">{t.dest}</p>
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
            <h2 className="text-3xl font-serif text-mahogany text-center mb-2">Prêts à partir autrement ?</h2>
            <p className="text-charcoal/60 text-sm text-center mb-8">Réponds à ces quelques questions — on te fait une proposition sous 48h.</p>

            {formStatus === 'success' ? (
              <div className="rounded-2xl bg-eucalyptus/5 border border-eucalyptus/20 p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-eucalyptus/10 flex items-center justify-center mx-auto mb-4 text-3xl">✉️</div>
                <h3 className="text-xl font-serif text-mahogany mb-2">Merci ! On a reçu ta demande.</h3>
                <p className="text-sm text-charcoal/60">On te répond sous 48h ouvrées maximum. Prépare-toi à rêver — on s’occupe du reste.</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-1.5">Prénom(s)</label>
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
                      <option value="autre">Autre (hors liste)</option>
                      {FORM_DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
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
                </div>

                <div className="grid md:grid-cols-2 gap-5">
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
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-1.5">Date de départ souhaitée</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleFormChange}
                      className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-1.5">Ce qui vous tient à cœur</label>
                  <textarea name="notes" value={formData.notes} onChange={handleFormChange} rows={4}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus resize-none"
                    placeholder="Rythme, centres d’intérêt, contraintes, rêves… tout ce qui vous passe par la tête." />
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
            <h2 className="text-3xl font-serif text-mahogany text-center mb-8">Questions fréquentes</h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-xl border border-stone-200 overflow-hidden">
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)} className="w-full flex justify-between items-center p-5 text-left font-semibold text-mahogany hover:bg-stone-50 transition-colors">
                    {faq.q}
                    <span className={`text-eucalyptus text-xl transition-transform ${faqOpen === i ? 'rotate-45' : ''}`}>+</span>
                  </button>
                  {faqOpen === i && <p className="px-5 pb-5 text-sm text-charcoal/70 leading-relaxed">{faq.a}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA final */}
        <section className="bg-mahogany text-white py-20">
          <div className="container text-center max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Prêt(e) à partir autrement ?</h2>
            <p className="text-white/70 mb-8">Un voyage pensé pour vous, pas un itinéraire générique. Remplissez le formulaire et on vous prépare quelque chose d&apos;unique.</p>
            <a href="#formulaire" className="inline-flex px-7 py-3 rounded-lg bg-teal text-charcoal font-semibold hover:bg-teal/90 transition-colors">Démarrer ma demande →</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
