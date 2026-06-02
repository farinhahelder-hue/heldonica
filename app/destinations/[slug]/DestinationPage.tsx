import Image from 'next/image'
import type { Metadata } from 'next'
import Link from 'next/link'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import SlowTravelQuiz from '@/components/SlowTravelQuiz'
import RelatedArticles from '@/components/RelatedArticles'
import { supabase } from '@/lib/supabase-client'
import { notFound } from 'next/navigation'
import { BlogPost } from '@/lib/blog-supabase'

const DESTINATION_IMAGES: Record<string, string> = {
  'sicile': 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1400&q=85',
  'lisbonne': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1400&q=85',
  'montenegro': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400&q=85',
  'suisse': 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1400&q=85',
  'zurich': 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1400&q=85',
  'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1400&q=85',
  'roumanie': 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=1400&q=85',
}

const DESTINATION_CONTENT: Record<string, any> = {
  'sicile': {
    title: 'Sicile',
    subtitle: 'la botte qu\'on prend par ses secrets',
    description: 'Entre Agrigente et Raguse, entre Modica et Caltagirone, il y a une Sicile que les guides ne mentionnent pas. Celle des villages de pierre qui n\'ont pas encore cédé au tourisme de masse, des tables de campagne où le vin coule à flots, des couchers de soleil sur la Méditerranée qui durent plus longtemps que prévu.',
    verdict: 'La Sicile ne se donne pas à ceux qui passent. Elle attend ceux qui restent.',
    duration: '7-10 jours',
    season: 'Avril à juin · Septembre à octobre',
    budget: '900-1400€ / duo / 7 jours',
    profile: 'Couple curieux, amateur de culture et de cuisine',
    tips: [
      'Visiter la Vallée des Temples à Agrigente à 7h du matin',
      'Manger chez Teresa à Modica — sa arancini est légendaire',
      'Prendre le ferry pour Stromboli et voir l\'éruption nocturne',
      'Rester 3 nuits minimum à Raguse pour voir deux couchers de soleil différents',
    ],
  },
  'lisbonne': {
    title: 'Lisbonne',
    subtitle: 'vue par ceux qui y vivent',
    description: 'Alfama le matin, avant les croisières. LX Factory à 8h, quand les artisans ouvrent leurs ateliers. Le ferry pour Cacilhas, face à Lisbonne qui se révèle en reflet sur le Tage. Lisbonne n\'est pas difficile à aimer — elle est difficile à connaître vraiment.',
    verdict: 'Lisbonne est meilleure quand tu la prends pour elle-même, pas pour ce qu\'elle montre.',
    duration: '3-5 jours',
    season: 'Toute l\'année · Mai et septembre idéaux',
    budget: '400-700€ / duo / 4 jours',
    profile: 'City breaker, amateur d\'architecture et de fado',
    tips: [
      'Monter au Miradouro da Senhora do Monte pour le coucher du soleil',
      'Prendre le tram 28 à 7h du matin — avant la foule',
      'Manger des pastéis de nata à Antónia ici, pas ailleurs',
      'Traverser le Tage pour voir Lisbonne depuis Cacilhas',
    ],
  },
  'montenegro': {
    title: 'Monténégro',
    subtitle: 'les Balkans par leur côté lumineux',
    description: 'Podgorica comme base, souvent ignorée des touristes. Kotor avant l\'arrivée des cars de croisières. Le fjord de Boka, qu\'on prend par la mer et pas par la route. Les Balkans ne sont pas ce qu\'on croit — ils sont plus lumineux, plus accueillants, plus goûteux.',
    verdict: 'Un pays qui n\'a pas encore appris à vendre ce qu\'il est. C\'est ce qui le rend précieux.',
    duration: '5-7 jours',
    season: 'Juin à septembre',
    budget: '600-1000€ / duo / 7 jours',
    profile: 'Couple en quête d\'authenticité, amateur de mer et de montagne',
    tips: [
      'Passer 2 jours à Podgorica — la ville la plus、绿色 du monde selon certains',
      'Visiter Kotor tôt le matin ou tard le soir pour éviter les cars de croisières',
      'Louer un bateau dans la baie de Boka pour voir les villages depuis la mer',
      'Monter au Parc National du Lovćen pour une vue panoramique',
    ],
  },
  'suisse': {
    title: 'Suisse',
    subtitle: 'les Alpes par leurs crêtes et leurs bains',
    description: 'Le funiculaire le plus raide du monde vers Stoos. Les crêtes à 2000m qu\'on traverse en été avec des fleurs jusqu\'aux genoux. Les bains du Lötschental, où l\'on reste une heure de plus que prévu. La Suisse révèle ses meilleurs côtés à ceux qui descendent des sentiers balisés.',
    verdict: 'La Suisse ne demande pas qu\'on la visite — elle demande qu\'on la découvre.',
    duration: '5-7 jours',
    season: 'Juin à septembre · Décembre pour les sports d\'hiver',
    budget: '1200-2000€ / duo / 7 jours',
    profile: 'Randonneur, amateur de montagne et de villages alpin',
    tips: [
      'Prendre le funiculaire Schwyz-Stoos — 110% de pente',
      'Rester une nuit dans un chalet d\'alpage entre Stoos et Klein Mythen',
      'Visiter les bains de Vals — architecture sensationnelle',
      'Marcher jusqu\'au sommet du Moléson pour voir la Riviera vaudoise',
    ],
  },
  'zurich': {
    title: 'Zurich',
    subtitle: 'la Suisse financière et ses villages cachés',
    description: 'Zurich n\'est pas ce qu\'on croit. Elle est plus verte, plus calme, plus simple. Le quartier de Langstrasse, les bords de la Limmat au coucher du soleil, la Kämbel qui surplombe la vieille ville. Et à 30 minutes, des villages qui n\'ont pas changé depuis des siècles.',
    verdict: 'Zurich est meilleure en dehors des sentiers battus financiers.',
    duration: '3-5 jours',
    season: 'Avril à octobre',
    budget: '800-1400€ / duo / 4 jours',
    profile: 'Amateur de culture, de design et de nature',
    tips: [
      'Visiter le Kunsthaus — l\'un des plus beaux musées d\'Europe',
      'Manger au Volkshaus — design Bauhaus, cuisine locale',
      'Prendre le train pour Stein am Rhein — le plus beau village de Suisse',
      'Longer la Limmat au coucher du soleil depuis le Niederdorf',
    ],
  },
  'paris': {
    title: 'Paris',
    subtitle: 'la ville qu\'on croit connaître',
    description: 'Paris a deux visages. Celui des cartes postales, qu\'on connaît tous. Et celui que la ville garde pour ses initiés — ses friches industrielles reconverties en jardins secrets, ses passages couverts endormis, ses villages dans la ville. Même en bas de chez toi, il reste des rues qui n\'ont pas fini de se révéler.',
    verdict: 'Paris est meilleur quand on arrête d\'essayer d\'en faire trop.',
    duration: '3-5 jours',
    season: 'Toute l\'année',
    budget: 'Modulable',
    profile: 'Amateur de culture, de flânerie et de bonne chère',
    tips: [
      'Explorer la Petite Ceinture — l\'ancienne ligne de chemin de fer transformée en coulée verte',
      'Monter au Miradouro (équivalent) du Sacré-Cœur à l\'aube',
      'Manger au mercado local du quartier, pas dans les restaurants touristiques',
      'Prendre le temps de s\'asseoir dans un café sans commander autre chose qu\'un café',
    ],
  },
  'roumanie': {
    title: 'Roumanie',
    subtitle: 'la Transylvanie qu\'on ne trouve pas dans les guides',
    description: 'Entre Brasov et Sibiu, entre les Carpates et les collines de Maramureș, il y a une Roumanie que les circuits ne visitent pas. Celle des villages où le temps s\'arrête, des châteaux qui n\'ont pas encore été pris par le tourisme, des forêts où les ours sont encore plus nombreux que les touristes.',
    verdict: 'La Roumanie ne se visite pas — elle se découvre.',
    duration: '7-14 jours',
    season: 'Mai à septembre · Avril pour Maramureș',
    budget: '600-1200€ / duo / 10 jours',
    profile: 'Couple en quête d\'authenticité, amateur d\'histoire et de nature',
    tips: [
      'Visiter le village de Saschiz — classé UNESCO et presque désert',
      'Prendre le train à vapeur Mocănița dans la vallée de la Vaser',
      'Dormir dans un manor transylvanien restauré — expérience unique',
      'Rester 3 jours à Sighișoara pour voir la ville sans les cars de touristes',
    ],
  },
}

type Props = {
  params: { slug: string }
}

// Fetch related articles for a destination
async function getRelatedArticlesForDestination(slug: string): Promise<BlogPost[]> {
  if (!supabase) return []
  
  try {
    const { data, error } = await supabase
      .from('cms_blog_posts')
      .select('*')
      .eq('published', true)
      .order('published_at', { ascending: false })
      .limit(50)
    
    if (error || !data) return []
    
    // Match articles by destination keyword
    const patterns: Record<string, string[]> = {
      'roumanie': ['Roumanie', 'Maramure', 'Timisoara', 'Transylvanie', 'Sibiu', 'Brasov'],
      'madere': ['Madère', 'Madeira', 'Funchal'],
      'paris': ['Paris'],
      'zurich': ['Zurich'],
      'sicile': ['Sicile', 'Sicilia', 'Agrigente'],
      'lisbonne': ['Lisbonne', 'Lisboa'],
      'montenegro': ['Monténégro', 'Podgorica', 'Kotor'],
      'suisse': ['Suisse', 'Stoos', 'Alpes'],
    }
    
    const keywords = patterns[slug] || []
    if (keywords.length === 0) return []
    
    return data.filter(post => {
      const searchText = `${post.title} ${post.excerpt || ''} ${post.destination || ''}`.toLowerCase()
      return keywords.some(kw => searchText.includes(kw.toLowerCase()))
    }).slice(0, 3)
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const content = DESTINATION_CONTENT[params.slug]
  const image = DESTINATION_IMAGES[params.slug]
  if (!content) return { title: 'Destination non trouvée' }

  return {
    title: `${content.title} slow travel | Guide Heldonica`,
    description: `${content.subtitle}. ${content.verdict}`.slice(0, 155),
    alternates: {
      canonical: `https://www.heldonica.fr/destinations/${params.slug}`,
    },
    openGraph: {
      title: `${content.title} slow travel | Guide Heldonica`,
      description: content.description.slice(0, 160),
      url: `https://www.heldonica.fr/destinations/${params.slug}`,
      images: [
        {
          url: image || '',
          width: 1200,
          height: 630,
          alt: `${content.title} - Slow travel Heldonica`,
        },
      ],
      locale: 'fr_FR',
      type: 'article',
    },
  }
}

export default async function DestinationPage({ params }: Props) {
  const slug = params.slug
  const content = DESTINATION_CONTENT[slug]
  const image = DESTINATION_IMAGES[slug]

  if (!content) {
    notFound()
  }

  // Fetch related articles
  const relatedArticles = await getRelatedArticlesForDestination(slug)

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TravelAction",
            "name": `${content.title} slow travel`,
            "description": content.description,
            "location": {
              "@type": "Place",
              "name": content.title,
              "address": {
                "@type": "PostalAddress",
                "addressCountry": content.title
              }
            },
            "provider": {
              "@type": "Organization",
              "name": "Heldonica",
              "url": "https://www.heldonica.fr"
            }
          })
        }}
      />
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[60vh] flex items-end overflow-hidden bg-stone-900">
          <Image
            src={image}
            alt={`${content.title} - Slow travel`}
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="relative container py-14 md:py-20 max-w-4xl">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300 mb-4 font-semibold">
              Destination testée
            </p>
            <h1 className="text-4xl md:text-6xl font-serif text-white mb-4">
              {content.title}, <em className="text-amber-300">{content.subtitle}</em>
            </h1>
            <p className="text-white/85 max-w-2xl text-lg leading-relaxed">
              {content.description.slice(0, 200)}...
            </p>
          </div>
        </section>

        {/* Info cards */}
        <section className="bg-white py-12">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">Durée idéale</p>
                <p className="text-charcoal font-medium">{content.duration}</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">Meilleure saison</p>
                <p className="text-charcoal font-medium">{content.season}</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">Budget indicatif</p>
                <p className="text-charcoal font-medium">{content.budget}</p>
              </div>
              <div className="rounded-xl border border-stone-200 bg-stone-50 p-5">
                <p className="text-xs uppercase tracking-[0.14em] text-eucalyptus font-semibold mb-2">Profil</p>
                <p className="text-charcoal font-medium text-sm">{content.profile}</p>
              </div>
            </div>
          </div>
        </section>

        {/* On y est allés */}
        <section className="bg-white py-16">
          <div className="container max-w-4xl">
            <h2 className="text-3xl font-serif text-mahogany mb-6">On y est allés</h2>
            <p className="text-charcoal/80 leading-relaxed text-lg mb-8">
              {content.description}
            </p>
          </div>
        </section>

        {/* Nos tips */}
        <section className="bg-cloud-dancer py-16">
          <div className="container max-w-4xl">
            <h2 className="text-2xl font-serif text-mahogany mb-6">Ce qu&apos;on te recommande</h2>
            <ul className="space-y-4">
              {content.tips.map((tip: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-eucalyptus/20 text-eucalyptus flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <p className="text-charcoal/80">{tip}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Verdict */}
        <section className="bg-stone-900 py-16">
          <div className="container max-w-3xl text-center">
            <p className="text-xs uppercase tracking-[0.2em] text-amber-300 mb-4 font-semibold">Notre verdict</p>
            <blockquote className="text-2xl md:text-3xl font-serif text-white leading-relaxed italic mb-6">
              &ldquo;{content.verdict}&rdquo;
            </blockquote>
            <p className="text-stone-400 text-sm">— Heldonica, testés sur place</p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-mahogany py-16 text-white">
          <div className="container max-w-2xl text-center">
            <h2 className="text-2xl md:text-3xl font-serif mb-4">
              Tu veux un voyage adapté à ton rythme ?
            </h2>
            <p className="text-white/80 mb-8">
              On transforme tes contraintes en itinéraire sur mesure, avec adresses testées.
            </p>
            <Link
              href={`/travel-planning-form?destination=${slug}`}
              className="inline-flex px-8 py-4 rounded-lg bg-amber-800 text-white font-semibold hover:bg-amber-700 transition-colors"
            >
              Planifier ce voyage avec Heldonica →
            </Link>
          </div>
        </section>

        {/* Quiz */}
        <section className="bg-cloud-dancer py-16">
          <div className="container max-w-4xl">
            <SlowTravelQuiz />
          </div>
        </section>

        {/* Related Articles */}
        <RelatedArticles articles={relatedArticles} destinationTitle={content.title} />
      </main>
      <Footer />
    </>
  )
}