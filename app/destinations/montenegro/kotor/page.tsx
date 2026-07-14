import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Script from 'next/script'

const faqKotorSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Quel est le meilleur moment pour visiter Kotor ?", "acceptedAnswer": { "@type": "Answer", "text": "Tôt le matin (7h-9h) pour avoir la vieille ville avant l'arrivée des croisiéristes. Mai-juin et septembre-octobre offrent le meilleur équilibre température/affluence." }},
    { "@type": "Question", "name": "Combien de temps rester à Kotor ?", "acceptedAnswer": { "@type": "Answer", "text": "2 à 3 jours suffisent pour découvrir la vieille ville, les remparts et une excursion dans les bouches de Kotor. Prévoyez 4-5 jours si vous voulez explorer Lovćen ou le Durmitor." }},
    { "@type": "Question", "name": "Les remparts de Kotor sont-ils difficiles ?", "acceptedAnswer": { "@type": "Answer", "text": "Oui — 1350 marches pour rejoindre la forteresse de San Giovanni. C'est éprouvant mais la vue sur la baie en vaut la peine. Partez tôt pour éviter la chaleur." }}
  ]
}

export const metadata: Metadata = {
  title: 'Kotor avant les croisiéristes — guide slow travel | Heldonica',
  description: 'Notre guide pour découvrir Kotor à son meilleur : lever du soleil sur la baie, remparts vides et vieille ville avant 9h. Conseils terrain pour un slow travel réussi.',
  alternates: {
    canonical: 'https://heldonica.fr/destinations/montenegro/kotor',
  },
  openGraph: {
    title: 'Kotor avant les croisiéristes | Heldonica',
    description: 'Le secret de Kotor : partir à 7h. Notre guide slow travel pour une ville vide.',
    url: 'https://heldonica.fr/destinations/montenegro/kotor',
    siteName: 'Heldonica',
    locale: 'fr_FR',
    type: 'article',
  },
}

const navLinks = [
  { label: 'Destinations', href: '/destinations' },
  { label: 'Monténégro', href: '/destinations/montenegro' },
]

export default function KotorPage() {
  return (
    <>
      <Script id="kotor-faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqKotorSchema) }} />
      <Header />
      <main className="min-h-screen bg-stone-50">
        {/* Hero */}
        <section className="relative bg-gradient-to-b from-stone-900 via-stone-800 to-stone-700 py-20 md:py-28">
          <div className="absolute inset-0 opacity-30">
            <img 
              src="https://images.unsplash.com/photo-1555990538-1e4e1c0f4d8e?w=1920&h=1080&fit=crop" 
              alt="Baie de Kotor au lever du soleil" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="relative max-w-4xl mx-auto px-4">
            <span className="inline-block text-teal text-sm font-medium mb-4 tracking-wide">
              Monténégro · Bouches de Kotor
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white mb-6 leading-tight">
              Kotor avant les croisiéristes
            </h1>
            <p className="text-xl text-stone-200 max-w-2xl leading-relaxed mb-8">
              Le secret de Kotor, c'est l'heure. À 7h du matin, la vieille ville est à vous. 
              Les ruelles pavées, la lumière sur la baie, le silence avant l'invasion. 
              Voici comment on l'a vécue — et comment tu peux la vivre aussi.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#decouvrir" className="inline-flex items-center gap-2 bg-eucalyptus text-white px-6 py-3 rounded-full font-semibold hover:bg-eucalyptus/90 transition-colors">
                Découvrir notre approche
              </a>
              <Link href="/destinations/montenegro" className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-full font-semibold hover:bg-white/20 transition-colors">
                Retour au Monténégro
              </Link>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <nav className="bg-white border-b border-stone-200">
          <div className="max-w-4xl mx-auto px-4 py-3 flex gap-3 text-sm items-center">
            {navLinks.map((link, i) => (
              <span key={link.href} className="flex items-center gap-3">
                {i > 0 && <span className="text-stone-300">/</span>}
                <Link href={link.href} className="text-stone-500 hover:text-eucalyptus transition-colors">
                  {link.label}
                </Link>
              </span>
            ))}
            <span className="flex items-center gap-3">
              <span className="text-stone-300">/</span>
              <span className="text-mahogany font-medium">Kotor</span>
            </span>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          
          {/* Intro terrain */}
          <section id="decouvrir" className="mb-16">
            <h2 className="text-3xl font-serif text-mahogany mb-6">
              La baie de Kotor au lever du soleil
            </h2>
            <p className="text-lg text-stone-700 leading-relaxed mb-4">
              <strong>6h30.</strong> On a quitté notre hébergement dans la vieille ville avant l'aube. 
              Les premières lueurs sont apparues à l'horizon, rougissant les peaks calcaires. 
              La baie était mate, sans un pli. Quelques pêcheurs préparaient leurs bateaux.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed mb-4">
              C'est à ce moment précis que Kotor révèle ce qu'il est vraiment : une ville magnifique 
              coincée entre montagne et mer, qui mérite mieux que les groupes de croisiéristes 
              qui la envahissent à partir de 10h.
            </p>
            <p className="text-lg text-stone-700 leading-relaxed">
              <strong>Notre conseil terrain :</strong> Levez-vous à 7h.Faites les remparts avant 9h. 
              Ensuite, allez nager dans une crique de la baie ou prenez le bateau pour Perast.
            </p>
          </section>

          {/* Pourquoi早起 */}
          <section className="mb-16 bg-gradient-to-b from-white to-stone-50 -mx-4 px-4 py-12 rounded-2xl">
            <h2 className="text-3xl font-serif text-mahogany mb-6">
              Pourquoi découvrir Kotor tôt le matin
            </h2>
            <p className="text-lg text-stone-700 leading-relaxed mb-8">
              Kotor subit le syndrome des destinations méditerranéennes : 
              magnifiques hors saison, invivables en juillet-août. 
              Mais même hors saison, les croisiéristes débarquent chaque matin.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
                <h3 className="font-serif text-lg text-mahogany mb-3">Une vieille ville vide</h3>
                <p className="text-stone-600">
                  Avant 9h, les ruelles pavées sont à vous. Les portes colorées, les chats endormis, 
                  l'odeur du café qui sort des fenêtres — c'est le Kotor authentique.
                </p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
                <h3 className="font-serif text-lg text-mahogany mb-3">Des remparts tranquilles</h3>
                <p className="text-stone-600">
                  1350 marches avec vue sur la baie — difficile de profiter si vous montez 
                  derrière 200 passagers de cruise. À 7h, vous serez seuls ou quasi.
                </p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
                <h3 className="font-serif text-lg text-mahogany mb-3">La lumière du matin</h3>
                <p className="text-stone-600">
                  Le soleil levant sur les falaises de la baie est un spectacle. 
                  C'est le moment pour les photos — sans filtres, sans monde.
                </p>
              </div>
              <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm">
                <h3 className="font-serif text-lg text-mahogany mb-3">Les criques accessibles</h3>
                <p className="text-stone-600">
                  Les petites plages autour de Kotor sont vides le matin. 
                  Bajova Quay, Stoliv — vous aurez le choix.
                </p>
              </div>
            </div>
          </section>

          {/* Notre façon de vivre */}
          <section className="mb-16">
            <h2 className="text-3xl font-serif text-mahogany mb-6">
              Comment on organise une journée type à Kotor
            </h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-eucalyptus/10 rounded-full flex items-center justify-center">
                  <span className="text-eucalyptus font-bold">7h</span>
                </div>
                <div>
                  <h3 className="font-semibold text-mahogany mb-2">Lever du soleil sur la baie</h3>
                  <p className="text-stone-600">
                    Promenade le long de la marina, puis remontée vers les remparts. 
                    Si vous montez, préparez de l'eau — les marches sont raides.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-eucalyptus/10 rounded-full flex items-center justify-center">
                  <span className="text-eucalyptus font-bold">9h</span>
                </div>
                <div>
                  <h3 className="font-semibold text-mahogany mb-2">Petit-déjeuner dans la vieille ville</h3>
                  <p className="text-stone-600">
                    Premier café, dernier calme. Profitez-en pour flâner dans les ruelles 
                    avant que les boutiques ouvrent.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-eucalyptus/10 rounded-full flex items-center justify-center">
                  <span className="text-eucalyptus font-bold">10h</span>
                </div>
                <div>
                  <h3 className="font-semibold text-mahogany mb-2">Direction le port pour l'excursion</h3>
                  <p className="text-stone-600">
                    Les bateaux partent du vieux port. Destination : les bouches de Kotor, 
                    Perast, et l'île de Notre-Dame-du-Rocher. 
                    <strong className="text-mahogany"> Astuce : négociez directement avec les pêcheurs sur le port.</strong>
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-16 h-16 bg-eucalyptus/10 rounded-full flex items-center justify-center">
                  <span className="text-eucalyptus font-bold">15h</span>
                </div>
                <div>
                  <h3 className="font-semibold text-mahogany mb-2">Pause plage ou balade douce</h3>
                  <p className="text-stone-600">
                    L'après-midi, Kotor est envahi. C'est le moment pour une crique au bord de la baie 
                    ou une expédition vers la réserve naturelle de Lustica.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Infos pratiques */}
          <section className="mb-16 bg-white rounded-2xl p-8 border border-stone-200">
            <h2 className="text-3xl font-serif text-mahogany mb-6">
              Infos pratiques pour Kotor
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-mahogany mb-4">Quand y aller</h3>
                <ul className="space-y-2 text-stone-600">
                  <li><strong className="text-eucalyptus">Mai-juin :</strong> Températures agréables, peu de croisiéristes</li>
                  <li><strong className="text-eucalyptus">Septembre-octobre :</strong> Mer chaude, touristes en baisse</li>
                  <li><strong className="text-red-500">Juillet-août :</strong> À éviter si vous cherchez le calme</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-mahogany mb-4">Combien de temps</h3>
                <ul className="space-y-2 text-stone-600">
                  <li><strong className="text-eucalyptus">2-3 jours :</strong> Vieille ville, remparts, Perast</li>
                  <li><strong className="text-eucalyptus">4-5 jours :</strong> Ajout de Lovćen ou Budva</li>
                  <li><strong className="text-eucalyptus">1 semaine+ :</strong> Durée complète pour le Monténégro</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-mahogany mb-4">Budget couple / jour</h3>
                <ul className="space-y-2 text-stone-600">
                  <li><strong className="text-eucalyptus">Entrée remparts :</strong> ~15€/pers</li>
                  <li><strong className="text-eucalyptus">Excursion bateau :</strong> ~40-60€/pers</li>
                  <li><strong className="text-eucalyptus">Repas :</strong> ~20-30€/pers</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-mahogany mb-4">Pour qui</h3>
                <ul className="space-y-2 text-stone-600">
                  <li><strong className="text-eucalyptus">Couples :</strong> Idéal pour un week-end romantique</li>
                  <li><strong className="text-eucalyptus">Amis :</strong> Authentique, pas trop tourist</li>
                  <li><strong className="text-eucalyptus">Familles :</strong> Facile avec enfants (pas de grosses marches)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-16">
            <h2 className="text-3xl font-serif text-mahogany mb-6">
              Questions fréquentes sur Kotor
            </h2>
            <div className="space-y-4">
              <details className="bg-white rounded-xl border border-stone-200 p-6 group">
                <summary className="font-semibold text-mahogany cursor-pointer list-none flex justify-between items-center">
                  Quel est le meilleur moment pour visiter Kotor ?
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="text-stone-600 mt-4 pt-4 border-t border-stone-100">
                  Tôt le matin (7h-9h) pour avoir la vieille ville avant l'arrivée des croisiéristes. 
                  Mai-juin et septembre-octobre offrent le meilleur équilibre température/affluence.
                </p>
              </details>
              <details className="bg-white rounded-xl border border-stone-200 p-6 group">
                <summary className="font-semibold text-mahogany cursor-pointer list-none flex justify-between items-center">
                  Combien de temps rester à Kotor ?
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="text-stone-600 mt-4 pt-4 border-t border-stone-100">
                  2 à 3 jours suffisent pour découvrir la vieille ville, les remparts et une excursion 
                  dans les bouches de Kotor. Prévoyez 4-5 jours si vous voulez explorer Lovćen ou Budva.
                </p>
              </details>
              <details className="bg-white rounded-xl border border-stone-200 p-6 group">
                <summary className="font-semibold text-mahogany cursor-pointer list-none flex justify-between items-center">
                  Les remparts de Kotor sont-ils difficiles ?
                  <span className="text-eucalyptus group-open:rotate-180 transition-transform">↓</span>
                </summary>
                <p className="text-stone-600 mt-4 pt-4 border-t border-stone-100">
                  Oui — 1350 marches pour rejoindre la forteresse de San Giovanni. C'est éprouvant 
                  mais la vue sur la baie en vaut la peine. Partez tôt pour éviter la chaleur.
                </p>
              </details>
            </div>
          </section>

          {/* Verdict */}
          <section className="mb-16 bg-mahogany text-white rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl font-serif mb-6">
              Notre verdict sur Kotor
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-teal mb-3">Pour qui</h3>
                <p className="text-stone-200">
                  Couples qui cherchent une destination romantique avec de vrais beaux paysages. 
                  Amateurs d'histoire (vieille ville UNESCO) et de nature (baie, montagnes).
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-teal mb-3">Ce qu'on adore</h3>
                <ul className="text-stone-200 space-y-1">
                  <li>✓ La baie au lever du soleil</li>
                  <li>✓ Les ruelles pavées avant 9h</li>
                  <li>✓ L'excursion en bateau vers Perast</li>
                  <li>✓ Le rapport qualité-prix</li>
                </ul>
              </div>
              <div className="md:col-span-2">
                <h3 className="font-semibold text-teal mb-3">Ce qu'on évite</h3>
                <p className="text-stone-200">
                  Les croisiéristes. Juillet-août si vous cherchez du slow travel. 
                  Les restaurants hors de la vieille ville — moins authentiques, plus chers.
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xl italic border-t border-stone-600 pt-6">
                  "Kotor se découvre à l'aube. Le reste de la journée, partez en bateau."
                </p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="mb-16 text-center">
            <div className="inline-block bg-gradient-to-r from-eucalyptus/10 to-teal/10 rounded-2xl p-8 md:p-12">
              <h2 className="text-2xl font-serif text-mahogany mb-4">
               Envie d'explorer le Monténégro sur mesure ?
              </h2>
              <p className="text-stone-600 mb-6 max-w-lg mx-auto">
                On peut concevoir ton itinéraire Monténégro avec nos adresses testées terrain — 
                de Kotor à Durmitor, sans compromis.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/travel-planning" className="inline-flex items-center gap-2 bg-eucalyptus text-white px-8 py-4 rounded-full font-semibold hover:bg-eucalyptus/90 transition-colors">
                  Découvrir Travel Planning →
                </Link>
                <Link href="/destinations/montenegro" className="inline-flex items-center gap-2 bg-white text-mahogany px-8 py-4 rounded-full font-semibold hover:bg-stone-100 transition-colors border border-stone-200">
                  Retour au Monténégro
                </Link>
              </div>
            </div>
          </section>

          {/* Liens vers autres destinations */}
          <section className="border-t border-stone-200 pt-12">
            <h3 className="text-sm uppercase tracking-wider text-stone-500 mb-6">Autres destinations Heldonica</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link href="/destinations/madere" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus hover:shadow-md transition-all">
                <span className="text-2xl mr-2">🇵🇹</span>
                <span className="text-mahogany font-medium">Madère</span>
              </Link>
              <Link href="/destinations/roumanie" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus hover:shadow-md transition-all">
                <span className="text-2xl mr-2">🇷🇴</span>
                <span className="text-mahogany font-medium">Roumanie</span>
              </Link>
              <Link href="/destinations" className="p-4 bg-white rounded-xl border border-stone-200 hover:border-eucalyptus hover:shadow-md transition-all">
                <span className="text-2xl mr-2">🗺️</span>
                <span className="text-mahogany font-medium">Toutes</span>
              </Link>
            </div>
          </section>

        </div>
      </main>
      <Footer />
    </>
  )
}
