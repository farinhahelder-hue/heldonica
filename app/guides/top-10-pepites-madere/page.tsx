import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import NewsletterPopup from '@/components/NewsletterPopup'
import GuideDownloadForm from '@/components/GuideDownloadForm'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { createServiceClient } from '@/lib/supabase'

// ─── Métadonnées SEO dynamiques (depuis site_settings si dispo) ──────────────
export const metadata: Metadata = {
  title: 'Guide Top 10 Pépites Madère | Heldonica',
  description:
    "Télécharge notre guide des 10 meilleures adresses testées à Madère. Restaurants, sentiers, spots photo — tout ce qu'on a aimé et qu'on te recommande.",
  keywords: [
    'guide Madère',
    'pépites Madère',
    'adresses Madère',
    'restaurants Madère',
    'sentiers Madère',
    'slow travel Madère',
    'Heldonica',
  ],
  alternates: {
    canonical: 'https://www.heldonica.fr/guides/top-10-pepites-madere',
  },
  openGraph: {
    title: 'Guide Top 10 Pépites Madère | Heldonica',
    description: "10 meilleures adresses testées à Madère. Télécharge gratuitement le guide.",
    images: [
      {
        url: '/og-default.jpg',
        width: 1200,
        height: 630,
        alt: 'Guide Top 10 Pépites Madère',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
}

// ─── Données statiques de fallback (si Supabase indisponible) ─────────────────
const PEPITES_FALLBACK = [
  {
    rank: 1,
    title: 'Restaurant Quinta do Fogo',
    type: 'Restaurant',
    description: "Le meilleur poisson grillé de l'île, avec vue sur les vignobles. Le propietario sait tout sur chaque plat.",
    secret: "Demande le vin de Madère de la maison — ils le servent en carafe et c'est une tuerie.",
    image_url: null,
  },
  {
    rank: 2,
    title: 'Levada dos Tornos',
    type: 'Randonnée',
    description: 'La plus belle levada, entre forêt luxuriante et panoramas vertigineux. 12 km, sans difficulté.',
    secret: 'Commence tôt le matin pour avoir les selfies sans personne.',
    image_url: null,
  },
  {
    rank: 3,
    title: 'Porto Moniz Natural Pools',
    type: 'Nature',
    description: "Piscines volcaniques naturelles, turquoise, à couper le souffle. Moins connu que les autres spots.",
    secret: "Va au coucher du soleil — les couleurs sont irréelles et il n'y a presque personne.",
    image_url: null,
  },
  {
    rank: 4,
    title: 'Café do Pirata',
    type: 'Café',
    description: 'Le meilleur café de Funchal, caché dans une ruelle. Torréfaction locale, pastries maison.',
    secret: "Prends le cortado — c'est leur spécialité et il n'est pas sur la carte.",
    image_url: null,
  },
  {
    rank: 5,
    title: 'Miradouro Pico do Arieiro',
    type: 'Vue',
    description: "Le troisième plus haut sommet de Madère. On y arrive par une route sinueuse, mais la vue...",
    secret: "Parcours le tunnel jusqu'au Pico Ruivo si tu es chaud — c'est là-haut que tout se passe.",
    image_url: null,
  },
  {
    rank: 6,
    title: 'Fábrica de Arte',
    type: 'Art & Culture',
    description: "Galerie d'art improvisée dans une ancienne usine. Expositions rotate, ambiance unique.",
    secret: "Il y a un café caché derrière la galerie — c'est là que les locaux vont.",
    image_url: null,
  },
  {
    rank: 7,
    title: 'Praia de Seixal',
    type: 'Plage',
    description: 'La seule plage de sable noir de Madère. Sauvage, tranquille, perdue.',
    secret: "Il y a un bar juste au-dessus de la plage — les bières sont froides et la vue est identique.",
    image_url: null,
  },
  {
    rank: 8,
    title: 'Monte Palace Tropical Garden',
    type: 'Jardin',
    description: "Les jardins les plus fous de Madère. Des milliers d'espèces, des cascades, des cygnes.",
    secret: "Le lever du soleil depuis le belvédère est un moment qu'on n'oublie pas.",
    image_url: null,
  },
  {
    rank: 9,
    title: 'Wine Bar do Funchal',
    type: 'Bar à vin',
    description: 'Sélection de vins de Madère (les vrais, les doux) avec des amuse-bouches qui vont avec.',
    secret: 'Le propriétaire fait des dégustations privées pour ceux qui demandent gentiment.',
    image_url: null,
  },
  {
    rank: 10,
    title: 'Anfiteatro do Faial',
    type: 'Vue',
    description: "Un point de vue inconnu des touristes, face à la baie de Funchal. On y va pour le coucher du soleil.",
    secret: "Il y a un petit marché artisanal le dimanche matin — on y trouve des choses impossibles à trouver ailleurs.",
    image_url: null,
  },
]

// ─── Fetch Supabase avec fallback ─────────────────────────────────────────────
async function getGuideItems() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_guide_items')
      .select('rank, title, type, description, secret, image_url')
      .eq('guide_slug', 'top-10-pepites-madere')
      .eq('is_active', true)
      .order('rank', { ascending: true })

    if (error || !data || data.length === 0) {
      return PEPITES_FALLBACK
    }
    return data
  } catch {
    return PEPITES_FALLBACK
  }
}

// ─── Fetch image hero depuis CMS zones ────────────────────────────────────────
async function getHeroImage() {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('cms_editable_zones')
      .select('value')
      .eq('page', 'top-10-pepites-madere')
      .eq('zone_key', 'hero_bg_image')
      .eq('is_active', true)
      .maybeSingle()
    return data?.value || 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=70'
  } catch {
    return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=70'
  }
}

export default async function Top10PepitesMaderePage() {
  const [pepites, heroImage] = await Promise.all([
    getGuideItems(),
    getHeroImage(),
  ])

  return (
    <InlineEditProvider page="top-10-pepites-madere">
      <Header />
      <main className="min-h-screen bg-cloud-dancer">
        <section className="relative bg-stone-950 text-white py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="relative max-w-4xl mx-auto px-6 text-center">
            <span className="inline-block px-4 py-1.5 bg-amber-500/20 text-amber-400 text-xs font-semibold rounded-full uppercase tracking-wider mb-6">
              <EditableZone page="top-10-pepites-madere" zone="hero_badge" fallback="Guide gratuit" />
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold leading-tight mb-6">
              <EditableZone page="top-10-pepites-madere" zone="hero_title_line1" fallback="Top 10 Pépites" className="inline" />
              <br />
              <span className="text-amber-400">
                <EditableZone page="top-10-pepites-madere" zone="hero_title_line2" fallback="à Madère" className="inline" />
              </span>
            </h1>
            <EditableZone page="top-10-pepites-madere" zone="hero_text" type="textarea"
              fallback="Ce qu'on a testé, aimé, et qu'on te recommande sans hésiter. Restaurants, sentiers, vues, spots photo — tout ce qu'on aurait aimé savoir avant d'y aller."
              className="text-stone-300 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-8 block"
            />

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 md:p-8 border border-white/10 max-w-md mx-auto">
              <EditableZone page="top-10-pepites-madere" zone="hero_download_label" fallback="📥 Télécharge gratuitement"
                className="text-amber-400 font-semibold mb-3 block"
              />
              <GuideDownloadForm variant="hero" />
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-6 text-center">
              <EditableZone page="top-10-pepites-madere" zone="intro_title" fallback="On a passé 3 semaines à Madère.\nVoici ce qu'on en a retiré."
                className="inline"
              />
            </h2>
            <EditableZone page="top-10-pepites-madere" zone="intro_text" type="textarea"
              fallback="Madère, c'est l'inverse du tourisme de masse. C'est des routes qui serpentent dans des forêts luxuriantes, des villages où le temps s'est arrêté, des restaurants où le propriétaire te raconte l'histoire de chaque plat.\n\nOn a testé, on s'est perdus, on a trouvé des trucs incroyables. Et maintenant, on te les partage. Gratuitement."
              className="text-stone-600 leading-relaxed text-lg block"
            />
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 mb-10 text-center">
              <EditableZone page="top-10-pepites-madere" zone="list_title" fallback="Les 10 pépites 👇" />
            </h2>

            <div className="space-y-6">
              {pepites.map((pep) => (
                <div
                  key={pep.rank}
                  className="bg-white rounded-2xl p-6 md:p-8 border border-stone-100 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-5">
                    {pep.image_url ? (
                      <img
                        src={pep.image_url}
                        alt={pep.title}
                        className="flex-shrink-0 w-20 h-20 rounded-xl object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex-shrink-0 w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center text-2xl font-bold text-amber-800">
                        {pep.rank}
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-semibold text-eucalyptus uppercase tracking-wider">{pep.type}</span>
                        {pep.image_url && (
                          <span className="text-xs font-bold text-amber-800 bg-amber-100 rounded-full px-2 py-0.5">#{pep.rank}</span>
                        )}
                      </div>
                      <h3 className="text-xl font-serif font-bold text-stone-900 mb-2">{pep.title}</h3>
                      <p className="text-stone-600 leading-relaxed mb-4">{pep.description}</p>
                      {pep.secret && (
                        <div className="bg-amber-50 rounded-xl p-4 border-l-4 border-amber-400">
                          <p className="text-sm">
                            <span className="font-semibold text-amber-800">🔒 Le secret :</span>{' '}
                            <span className="text-stone-700">{pep.secret}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20 bg-stone-950 text-white">
          <div className="max-w-2xl mx-auto px-6 text-center">
            <EditableZone page="top-10-pepites-madere" zone="cta_title" fallback="Tu pars à Madère ?"
              className="text-2xl md:text-3xl font-serif font-bold mb-4 block"
            />
            <EditableZone page="top-10-pepites-madere" zone="cta_text" fallback="Le guide complet avec toutes les adresses, les maps, et les tips pour éviter les pièges à éviter. Gratuit."
              className="text-stone-400 leading-relaxed mb-8 block"
            />
            <GuideDownloadForm variant="inline" />
            <EditableZone page="top-10-pepites-madere" zone="cta_footnote" fallback="10 pages, PDF, sans engagement."
              className="text-stone-500 text-sm mt-4 block"
            />
          </div>
        </section>

        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <h2 className="text-2xl font-serif font-bold text-stone-900 mb-8 text-center">
              <EditableZone page="top-10-pepites-madere" zone="related_title" fallback="Continue à explorer" />
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Link
                href="/destinations/madere"
                className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:shadow-md transition-shadow group"
              >
                <span className="text-2xl mb-4 block">🌍</span>
                <h3 className="text-lg font-semibold text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  <EditableZone page="top-10-pepites-madere" zone="related_1_title" fallback="Guide complet Madère" />
                </h3>
                <EditableZone page="top-10-pepites-madere" zone="related_1_desc" fallback="Tout ce qu'il faut savoir pour préparer ton voyage."
                  className="text-sm text-stone-500 block"
                />
              </Link>
              <Link
                href="/blog"
                className="bg-stone-50 rounded-2xl p-6 border border-stone-100 hover:shadow-md transition-shadow group"
              >
                <span className="text-2xl mb-4 block">📖</span>
                <h3 className="text-lg font-semibold text-stone-900 mb-2 group-hover:text-eucalyptus transition-colors">
                  <EditableZone page="top-10-pepites-madere" zone="related_2_title" fallback="Carnets de voyage" />
                </h3>
                <EditableZone page="top-10-pepites-madere" zone="related_2_desc" fallback="Nos récits depuis le terrain, destinations réelles."
                  className="text-sm text-stone-500 block"
                />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <NewsletterPopup />
    </InlineEditProvider>
  )
}
