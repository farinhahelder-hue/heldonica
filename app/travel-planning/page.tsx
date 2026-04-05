'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import Link from 'next/link'

const faqs = [
  {
    q: 'Combien coûte le Travel Planning ?',
    a: 'Chaque projet est unique. On démarre par un échange gratuit pour comprendre vos envies. Le tarif est établi selon la complexité de l\'itinéraire, la durée et le niveau de personnalisation souhaité. Comptez en moyenne entre 150€ et 350€ pour un voyage de 7 à 14 jours.'
  },
  {
    q: 'Dans combien de temps recevons-nous notre carnet de route ?',
    a: 'En général sous 7 à 10 jours après votre validation du brief. Pour les projets urgents (départ dans moins de 3 semaines), contactez-nous directement — on fait de notre mieux.'
  },
  {
    q: 'Peut-on voyager hors des destinations que vous avez visitées ?',
    a: 'Oui. On travaille avec un réseau de contacts locaux et on fait des recherches approfondies pour chaque nouvelle destination. La différence : on ne vous envoie que ce qu\'on est prêts à recommander à nos proches.'
  },
  {
    q: 'Est-ce qu\'on fait les réservations à votre place ?',
    a: 'On peut vous fournir les liens, contacts et conseils pour chaque réservation. Pour un accompagnement complet (réservations incluses), c\'est possible sur devis — précisez-le lors de votre demande.'
  },
  {
    q: 'Vous proposez quoi exactement comme livrable ?',
    a: 'Un carnet de voyage PDF complet : programme jour par jour, carte interactive, hébergements sélectionnés, restaurants, transports, conseils pratiques et contacts locaux. Tout est réuni en un seul document pensé pour vous.'
  },
]

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      {faqs.map((item, i) => (
        <div key={i} className="border border-stone-200 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpen(open === i ? null : i)}
            className="w-full flex items-center justify-between px-6 py-4 text-left font-semibold text-stone-900 text-sm hover:bg-stone-50 transition"
          >
            <span>{item.q}</span>
            <svg className={`w-4 h-4 shrink-0 ml-4 transition-transform ${open === i ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
          </button>
          {open === i && (
            <div className="px-6 pb-5 text-stone-600 text-sm leading-relaxed border-t border-stone-100">
              <p className="pt-4">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function TravelPlanning() {
  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:none; } }
        .fade-up { animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-up-1 { opacity:0; animation: fadeUp 0.7s 0.1s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-up-2 { opacity:0; animation: fadeUp 0.7s 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-up-3 { opacity:0; animation: fadeUp 0.7s 0.4s cubic-bezier(0.16,1,0.3,1) forwards; }
        .fade-up-4 { opacity:0; animation: fadeUp 0.7s 0.55s cubic-bezier(0.16,1,0.3,1) forwards; }
        .service-card { transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease; }
        .service-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.09); }
        .step-line::before { content:''; position:absolute; left:19px; top:44px; bottom:-20px; width:1px; background: linear-gradient(to bottom, #92400e40, transparent); }
      `}</style>

      <Header />
      <Breadcrumb />
      <main>

        {/* ── HERO ── */}
        <section className="relative overflow-hidden bg-stone-950">
          <img
            src="https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1600&q=85"
            alt="Couple voyageant, vue panoramique"
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            width="1600" height="900"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/60 via-transparent to-stone-950" />
          <div className="relative max-w-4xl mx-auto px-6 md:px-10 py-28 md:py-40 text-center">
            <p className="fade-up-1 text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-5">
              Slow Travel · Sur mesure · En couple
            </p>
            <h1 className="fade-up-2 text-4xl md:text-6xl lg:text-7xl font-serif font-light text-white leading-[1.1] mb-6">
              On a voyagé dans des dizaines de pays.<br />
              <em className="text-amber-300">Maintenant on fait voyager les autres.</em>
            </h1>
            <p className="fade-up-3 text-base md:text-xl text-stone-300 max-w-2xl mx-auto leading-relaxed mb-10">
              Pas des itinéraires copiés sur des blogs. Des voyages construits comme on aurait voulu qu&apos;on nous guide — lents, sensoriels, mémorables.
            </p>
            <div className="fade-up-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/travel-planning-form"
                className="px-8 py-4 bg-amber-800 hover:bg-amber-700 text-white rounded font-semibold text-sm tracking-wide transition shadow-lg">
                Faire ma demande gratuite
              </Link>
              <p className="text-stone-400 text-xs">Sans engagement · Réponse sous 48h</p>
            </div>
            {/* Urgency badge */}
            <div className="mt-8 inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-white/80 text-xs font-medium">3 créneaux disponibles en avril 2026</span>
            </div>
          </div>
        </section>

        {/* ── DOULEUR / DÉSIR ── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pain */}
              <div className="bg-stone-50 rounded-2xl p-8 border border-stone-200">
                <p className="text-stone-500 text-xs font-bold tracking-[0.15em] uppercase mb-5">Sans Travel Planning</p>
                <ul className="space-y-4">
                  {[
                    'Des heures à lire des avis contradictoires sur TripAdvisor',
                    'Un itinéraire trop chargé qui finit en marathon touristique',
                    'Des restaurants décevants choisis au hasard',
                    'L\'angoisse de « passer à côté » des vrais spots',
                    'Un voyage qui ressemble à tous les autres',
                  ].map((txt) => (
                    <li key={txt} className="flex gap-3 items-start text-stone-600 text-sm">
                      <span className="text-stone-300 mt-0.5 shrink-0">✕</span> {txt}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Desire */}
              <div className="bg-amber-50 rounded-2xl p-8 border border-amber-200">
                <p className="text-amber-800 text-xs font-bold tracking-[0.15em] uppercase mb-5">Avec Heldonica</p>
                <ul className="space-y-4">
                  {[
                    'Un itinéraire pensé pour votre rythme de couple',
                    'Des pépites que personne d\'autre ne connaît encore',
                    'Chaque adresse testée et approuvée sur le terrain',
                    'La liberté de partir l\'esprit totalement libre',
                    'Un voyage dont vous parlerez pendant des années',
                  ].map((txt) => (
                    <li key={txt} className="flex gap-3 items-start text-stone-800 text-sm">
                      <span className="text-amber-600 mt-0.5 shrink-0 font-bold">✓</span> {txt}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROCESS TIMELINE ── */}
        <section className="py-20 md:py-28 bg-stone-50">
          <div className="max-w-4xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-3">Comment ça marche</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-14">De votre rêve à votre départ</h2>
            <div className="space-y-10">
              {[
                { num: '01', title: 'Tu remplis le formulaire', desc: 'Destination rêvée, durée, budget, style de voyage — 5 minutes suffisent. Pas besoin d\'avoir tout planifié.', badge: 'Gratuit' },
                { num: '02', title: 'On échange ensemble', desc: 'Un appel ou échange écrit pour affiner ta vision. On pose les vraies questions pour comprendre ce qui te fait vibrer.', badge: 'Humain' },
                { num: '03', title: 'On construit ton voyage', desc: 'Recherches, sélection rigoureuse, carnet de route PDF complet. Chaque adresse est vérifiée avant d\'y figurer.', badge: '7–10 jours' },
                { num: '04', title: 'Tu pars l\'esprit libre', desc: 'Tout est prêt. Carte, hôtels, restaurants, transports, conseils pratiques. Il ne reste plus qu\'à vivre l\'aventure.', badge: 'Clé en main' },
              ].map((step, i) => (
                <div key={i} className="relative flex gap-6 items-start step-line last:before:hidden">
                  <div className="w-10 h-10 rounded-full bg-amber-800 text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                    {step.num}
                  </div>
                  <div className="pb-8">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-stone-900">{step.title}</h3>
                      <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">{step.badge}</span>
                    </div>
                    <p className="text-stone-600 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CE QU'ON CRÉE ── */}
        <section className="py-20 md:py-28 bg-white">
          <div className="max-w-6xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-3">Le service</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-12">Ce qu&apos;on crée pour toi</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  num: '01',
                  title: 'Itinéraire 100 % sur mesure',
                  desc: 'On part de tes envies, ton rythme, ta durée. Chaque journée est pensée pour que tu vives un vrai voyage — pas une liste de cases à cocher.',
                  accent: 'from-amber-50 to-stone-50',
                },
                {
                  num: '02',
                  title: 'Hébergements éco & authentiques',
                  desc: "Maisons d'hôtes locales, écolodges, petits hôtels indépendants testés sur le terrain. Zéro chaîne, 100 % immersion.",
                  accent: 'from-teal-50 to-stone-50',
                },
                {
                  num: '03',
                  title: 'Pensé pour les couples',
                  desc: 'Ni tout-inclus, ni programme chargé. Des moments à deux, des pépites dénichées, une évasion qui vous ressemble.',
                  accent: 'from-amber-50 to-stone-50',
                },
                {
                  num: '04',
                  title: 'Logistique clé en main',
                  desc: "Transports, réservations, carnet de route PDF, contacts locaux. Tu n'as plus qu'à partir.",
                  accent: 'from-teal-50 to-stone-50',
                },
                {
                  num: '05',
                  title: 'Voyage éco-responsable',
                  desc: 'On intègre dès la conception des choix bas-carbone, des acteurs locaux et des pratiques respectueuses des territoires.',
                  accent: 'from-amber-50 to-stone-50',
                },
                {
                  num: '06',
                  title: 'Suivi personnalisé',
                  desc: 'Un échange humain à chaque étape. On répond à tes questions avant, pendant et après le voyage.',
                  accent: 'from-teal-50 to-stone-50',
                },
              ].map((s, i) => (
                <div key={i} className={`service-card bg-gradient-to-br ${s.accent} rounded-xl p-6 border border-stone-100`}>
                  <span className="text-xs font-bold tracking-[0.2em] text-amber-700 uppercase mb-3 block">{s.num}</span>
                  <h3 className="font-semibold text-stone-900 mb-2 text-base">{s.title}</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TÉMOIGNAGES ── */}
        <section className="py-20 md:py-24 bg-stone-950 text-white">
          <div className="max-w-5xl mx-auto px-6 md:px-10">
            <p className="text-amber-400 text-xs font-bold tracking-[0.2em] uppercase mb-3">Témoignages</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-12">Ce qu&apos;ils en disent</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { quote: "On cherchait un voyage loin des circuits classiques. Heldonica nous a trouvé des pépites qu'on n'aurait jamais découvertes seuls. Chaque jour était une surprise.", name: 'Marie & Théo', dest: 'Madère · 10 jours' },
                { quote: "L'itinéraire collait parfaitement à notre rythme — pas trop chargé, pas ennuyeux. Les adresses restau étaient toutes excellentes. On recommande les yeux fermés.", name: 'Sophie & Lucas', dest: 'Colombie · 14 jours' },
                { quote: "Pour nos 10 ans d'anniversaire, on voulait quelque chose d'unique. Heldonica a imaginé un voyage qu'on n'aurait jamais pu organiser aussi bien tout seuls.", name: 'Claire & Antoine', dest: 'Tanzanie · 12 jours' },
              ].map((t, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col gap-4">
                  <p className="text-stone-300 text-sm leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-auto">
                    <p className="text-white font-semibold text-sm">{t.name}</p>
                    <p className="text-amber-400 text-xs">{t.dest}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 md:py-24 bg-white">
          <div className="max-w-3xl mx-auto px-6 md:px-10">
            <p className="text-amber-800 text-xs font-bold tracking-[0.2em] uppercase mb-3">Questions fréquentes</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light text-stone-900 mb-10">On répond à tes doutes</h2>
            <FAQ />
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-24 md:py-32 bg-amber-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=60)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative max-w-2xl mx-auto px-6 text-center">
            <p className="text-amber-200 text-xs font-bold tracking-[0.2em] uppercase mb-4">Prêts pour l&apos;aventure ?</p>
            <h2 className="text-4xl md:text-5xl font-serif font-light mb-6">
              Dis-nous où tu rêves d&apos;aller.<br />
              <em>On s&apos;occupe du reste.</em>
            </h2>
            <p className="text-amber-200 leading-relaxed mb-10">
              Un échange gratuit, sans engagement. On prend le temps de comprendre votre projet avant de proposer quoi que ce soit.
            </p>
            <Link href="/travel-planning-form"
              className="inline-block px-10 py-4 bg-white text-amber-900 font-bold rounded shadow-xl hover:bg-amber-50 transition text-sm tracking-wide">
              Faire ma demande gratuite →
            </Link>
            <p className="mt-4 text-amber-300/70 text-xs">Sans engagement · Réponse sous 48h · 100 % humain</p>
          </div>
        </section>

      </main>

      {/* ── CTA MOBILE STICKY ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-amber-900 border-t border-amber-800 px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="text-white text-xs font-bold">Travel Planning sur mesure</p>
          <p className="text-amber-300 text-xs">3 créneaux disponibles en avril</p>
        </div>
        <Link href="/travel-planning-form"
          className="px-4 py-2 bg-white text-amber-900 rounded font-bold text-xs whitespace-nowrap shadow">
          Demande gratuite
        </Link>
      </div>

      <Footer />
    </>
  )
}
