import Image from 'next/image'
import Script from 'next/script'
import { getDestinationBySlug, blogPosts } from '@/lib/wordpress-data'
import { supabase } from '@/lib/supabase-client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRelatedArticles } from '@/lib/related-articles'
import EnhancedRichContent from '@/components/EnhancedRichContent'
import { sanitizeHtml } from '@/lib/sanitize-html'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Breadcrumb from '@/components/Breadcrumb'
import ComingSoonDestination from '@/components/ComingSoonDestination'
import GuideDownloadButton from '@/components/GuideDownloadButton'
import type { Metadata } from 'next'
import { SITE_URL, DEFAULT_OG_IMAGE, DEFAULT_TITLE, DEFAULT_DESCRIPTION } from '@/lib/seo'

interface Props {
  params: Promise<{ slug: string }>
}

type DestinationMeta = {
  description: string
  heroImage: string
  region: string
  duration: string
  budget: string
  bestSeason: string
  verdict: string
  intro: string
}

const zurichMeta: DestinationMeta = {
  description:
    'Badi flottantes, brasseries artisanales et vieille ville dense. Zurich se révèle quand on ralentit assez pour la laisser venir.',
  heroImage: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1400&q=80',
  region: 'Suisse',
  duration: '3 à 4 jours',
  budget: 'Élevé mais rattrapable à pied',
  bestSeason: 'Juin à septembre',
  verdict: 'Une ville plus sensuelle que sa réputation.',
  intro:
    'On y est venus avec des idées toutes faites. Elles ont sauté dès la première baignade dans la Limmat.',
}

const suisseMeta: DestinationMeta = {
  description:
    'Montagnes, lacs, trains impeccables et détours qui demandent du temps. La Suisse devient juste quand on cesse de la résumer à son prix.',
  heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1400&q=80',
  region: 'Europe',
  duration: '7 à 12 jours',
  budget: 'Moyen à élevé',
  bestSeason: 'Juillet à septembre',
  verdict: 'Une destination lente, si on la laisse respirer.',
  intro:
    'On y revient pour les crêtes, puis on reste pour tout ce qu&apos;on n&apos;avait pas prévu entre deux trajets.',
}

const roumanieMeta: DestinationMeta = {
  description:
    'Timișoara, Delta du Danube, Carpates : la Roumanie donne beaucoup à celles et ceux qui acceptent de lui laisser de l&apos;espace.',
  heroImage: 'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?w=1400&q=80',
  region: 'Europe',
  duration: '8 à 14 jours',
  budget: 'Accessible',
  bestSeason: 'Mai, juin, septembre',
  verdict: 'Le genre de pays qui déplace ton regard.',
  intro:
    'On pensait partir vers une destination discrète. On a trouvé un terrain immense, vivant, parfois brut, souvent bouleversant.',
}

const madereMeta: DestinationMeta = {
  description:
    'Forêts humides, levadas, falaises, pain chaud et retours successifs. Madère ne se livre pas en une seule fois.',
  heroImage: 'https://images.unsplash.com/photo-1569959220744-ff553533f492?w=1400&q=80',
  region: 'Portugal',
  duration: '7 à 10 jours',
  budget: 'Moyen',
  bestSeason: 'Octobre à mai',
  verdict: 'L&apos;île qu&apos;on a mis des années à comprendre.',
  intro:
    'Chaque retour nous fait corriger quelque chose : un itinéraire trop tendu, un village quitté trop vite, une lumière manquée la veille.',
}

const parisMeta: DestinationMeta = {
  description:
    'Paris et l&apos;Île-de-France se lisent mieux quand on sort des grandes phrases. Un canal, une friche, une rue, et le rythme change.',
  heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1400&q=80',
  region: 'France',
  duration: '2 à 5 jours',
  budget: 'Variable',
  bestSeason: 'Toute l&apos;année',
  verdict: 'La preuve qu&apos;on peut ralentir sans partir loin.',
  intro:
    'Le slow travel commence parfois à une station de métro de chez soi. C&apos;est peut-être pour ça qu&apos;on y tient autant.',
}

const normandieMeta: DestinationMeta = {
  description:
    'Étretat, Honfleur, Deauville : la Normandie côtière demande moins de cases à cocher et plus de temps entre deux marées.',
  heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
  region: 'France',
  duration: '3 à 5 jours',
  budget: 'Modulable',
  bestSeason: 'Mai à septembre',
  verdict: 'La côte marche mieux quand on accepte ses détours.',
  intro:
    'Ici, le bon rythme vient souvent du vent, de l&apos;heure de la marée et d&apos;une table trouvée plus tard que prévu.',
}

const bretagneMeta: DestinationMeta = {
  description:
    'Sentiers côtiers, crêperies, lumière changeante et Saint-Malo comme point d&apos;appui. La Bretagne gagne à être laissée tranquille.',
  heroImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1400&q=80',
  region: 'France',
  duration: '4 à 7 jours',
  budget: 'Modulable',
  bestSeason: 'Mai à septembre',
  verdict: 'Une destination qui se donne mieux à pied qu&apos;en programme serré.',
  intro:
    'On y va pour la côte, puis on reste pour ce que la météo déplace dans une même journée.',
}

const DEST_META: Record<string, DestinationMeta> = {
  zurich: zurichMeta,
  suisse: suisseMeta,
  'suisse-heldonica': suisseMeta,
  roumanie: roumanieMeta,
  'roumanie-heldonica-slow': roumanieMeta,
  madere: madereMeta,
  'madere-heldonica': madereMeta,
  paris: parisMeta,
  'ile-de-france-heldonica': parisMeta,
  'normandie-heldonica': normandieMeta,
  'bretagne-heldonica-slow': bretagneMeta,
}

const GPS_COORDINATES: Record<string, { lat: number; lon: number }> = {
  zurich: { lat: 47.3769, lon: 8.5417 },
  suisse: { lat: 46.8182, lon: 8.2275 },
  roumanie: { lat: 45.9432, lon: 24.9668 },
  madere: { lat: 32.7607, lon: -16.9592 },
  paris: { lat: 48.8566, lon: 2.3522 },
  normandie: { lat: 49.1828, lon: -0.3707 },
  bretagne: { lat: 48.2020, lon: -2.9326 },
  sicile: { lat: 37.5990, lon: 14.0154 },
  sardaigne: { lat: 40.1209, lon: 9.0129 },
  montenegro: { lat: 42.7087, lon: 19.3744 },
  colombie: { lat: 4.5709, lon: -74.2973 },
  lisbonne: { lat: 38.7223, lon: -9.1393 },
}

export const revalidate = 3600

async function getDestinationStatus(slug: string): Promise<{
  status: string | null
  title: string
  country: string
  flag_emoji?: string
  teaser?: string
  hero_unsplash_url?: string
  featured_image?: string
  travel_style?: string
  best_season?: string
  avg_budget_couple_week?: number
} | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase
      .from('destinations_public')
      .select('status, title, country, flag_emoji, teaser, hero_unsplash_url, featured_image, travel_style, best_season, avg_budget_couple_week')
      .eq('slug', slug)
      .single()
    if (error || !data) return null
    return data as any
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug

  const destStatus = await getDestinationStatus(slug)
  if (destStatus && destStatus.status === 'coming_soon') {
    return {
      title: `${destStatus.title} — bientôt sur Heldonica`,
      description: destStatus.teaser || `${destStatus.title} — notre guide arrive bientôt. Sois notifié en avant-première.`,
      robots: { index: false, follow: false },
      alternates: { canonical: `${SITE_URL}/destinations/${slug}` },
      openGraph: {
        title: `${destStatus.title} — bientôt sur Heldonica`,
        description: destStatus.teaser || '',
        url: `${SITE_URL}/destinations/${slug}`,
        images: [{ url: destStatus.hero_unsplash_url || destStatus.featured_image || DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
        locale: 'fr_FR', type: 'website',
      },
    }
  }

  const page = getDestinationBySlug(slug)
  const meta = DEST_META[slug]

  if (!page) return {
    title: 'Destination introuvable | Heldonica',
    description: DEFAULT_DESCRIPTION,
    openGraph: {
      title: 'Destination introuvable | Heldonica',
      description: DEFAULT_DESCRIPTION,
      images: [{ url: DEFAULT_OG_IMAGE }],
      url: `${SITE_URL}/destinations`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Destination introuvable | Heldonica',
      description: DEFAULT_DESCRIPTION,
      images: [DEFAULT_OG_IMAGE],
    }
  }

  const titleText = page.title || slug || 'Destination'
  const title = `${titleText} | Heldonica`
  const description = meta?.description || `Découvre ${titleText} avec Heldonica, depuis le terrain et sans vernis inutile.` || DEFAULT_DESCRIPTION
  const ogImage = meta?.heroImage || page.image || DEFAULT_OG_IMAGE
  const canonical = `${SITE_URL}/destinations/${slug}`

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: 'Heldonica',
      type: 'website',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: titleText,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export default async function DestinationPage({ params }: Props) {
  const slug = (await params).slug

  const destStatus = await getDestinationStatus(slug)
  if (destStatus && destStatus.status === 'coming_soon') {
    return (
      <ComingSoonDestination
        slug={slug}
        title={destStatus.title || slug}
        country={destStatus.country || ''}
        flag_emoji={destStatus.flag_emoji}
        teaser={destStatus.teaser}
        hero_unsplash_url={destStatus.hero_unsplash_url}
        featured_image={destStatus.featured_image}
        travel_style={destStatus.travel_style}
        best_season={destStatus.best_season}
        avg_budget_couple_week={destStatus.avg_budget_couple_week}
      />
    )
  }

  const page = getDestinationBySlug(slug)
  if (!page) notFound()

  const meta = DEST_META[slug]
  const heroImage = page.image || meta?.heroImage || ''
  const safeContent = sanitizeHtml(page.content)

  const titleWords = page.title.toLowerCase().split(/\s+/).filter((word) => word.length > 3)
  // Convert DestinationPage to a format that getRelatedArticles can use to match tags/category
  const destinationAsArticle: any = {
    slug: page.slug,
    title: page.title,
    category: meta?.region,
    tags: titleWords, // Treat title words as tags for matching
    destination: page.slug
  }

  const related = getRelatedArticles(destinationAsArticle, blogPosts ?? [], 3)

  const facts = meta
    ? [
        { label: 'Durée idéale', value: meta.duration },
        { label: 'Budget indicatif', value: meta.budget },
        { label: 'Meilleure saison', value: meta.bestSeason },
        { label: 'Notre verdict', value: meta.verdict },
      ]
    : []

  const coords = GPS_COORDINATES[slug] || null
  const destinationLd: any = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: page.title,
    description: meta?.description || '',
    touristType: 'Slow Travel / Couple',
  }
  if (coords) {
    destinationLd.geo = {
      '@type': 'GeoCoordinates',
      latitude: coords.lat,
      longitude: coords.lon,
    }
  }

  return (
    <>
      <Script
        id="destination-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(destinationLd) }}
      />
      <Header />
      <Breadcrumb />
      <main className="min-h-screen bg-[#f7f5f1]">
        <div className="relative h-[56vh] w-full overflow-hidden bg-stone-900 md:h-[70vh]">
          {heroImage && (
            <Image
              src={heroImage}
              alt={page.title}
              fill
              className="object-cover opacity-75"
              priority
              sizes="100vw"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="mx-auto max-w-5xl">
              <Link
                href="/destinations"
                className="mb-4 inline-flex items-center gap-2 text-sm text-white/65 transition-colors duration-200 hover:text-white"
              >
                ← Retour aux destinations
              </Link>
              {meta?.region && (
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-teal">
                  {meta.region}
                </p>
              )}
              <h1 className="text-4xl font-serif font-light leading-tight text-white md:text-6xl">
                {page.title}
              </h1>
              {meta?.description && (
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/75">{meta.description}</p>
              )}
            </div>
          </div>
        </div>

        {facts.length > 0 && (
          <section className="border-y border-stone-200 bg-white/90 backdrop-blur-sm">
            <div className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-4">
              {facts.map((fact) => (
                <div key={fact.label} className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{fact.label}</p>
                  <p className="text-sm leading-relaxed text-stone-700">{fact.value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="py-16 md:py-20">
          <div className="mx-auto max-w-5xl px-4">
            {meta?.intro && (
              <div className="mb-10 rounded-[2rem] border border-eucalyptus/20 bg-eucalyptus/5 px-6 py-6 md:px-8">
                <p className="text-lg font-light leading-relaxed text-stone-800">{meta.intro}</p>
              </div>
            )}

            {safeContent ? (
              <EnhancedRichContent
                html={safeContent}
                className="prose prose-lg max-w-none
                  prose-headings:font-serif prose-headings:font-light prose-headings:text-stone-900
                  prose-h2:mt-12 prose-h2:mb-5 prose-h2:text-3xl
                  prose-p:mb-6 prose-p:text-stone-700 prose-p:leading-8
                  prose-a:text-eucalyptus prose-a:no-underline hover:prose-a:underline
                  prose-img:mx-auto prose-img:my-10 prose-img:rounded-[1.75rem] prose-img:shadow-lg
                  prose-strong:text-stone-900 prose-strong:font-semibold
                  prose-ul:space-y-3 prose-li:text-stone-700
                  prose-ol:space-y-3 prose-ol:text-stone-700
                  prose-li:marker:text-eucalyptus"
              />
            ) : (
              <div className="rounded-[2rem] border border-stone-200 bg-white px-6 py-12 text-center shadow-sm">
                <p className="text-base leading-relaxed text-stone-500">
                  Cette destination est en cours de réécriture. On remet le terrain au centre et on revient vite.
                </p>
              </div>
            )}
          </div>
        </section>

        {related.length > 0 && (
          <section className="bg-white py-16">
            <div className="mx-auto max-w-6xl px-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-eucalyptus">
                À lire aussi
              </p>
              <h2 className="mb-3 text-3xl font-serif font-light text-stone-900">
                Carnets autour de {page.title}
              </h2>
              <p className="mb-8 max-w-2xl text-sm leading-relaxed text-stone-600">
                Les articles qui prolongent la destination avec ce qu&apos;on a vu, raté, retenu et vraiment traversé.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {related.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group block transition-all duration-200">
                    <article className="overflow-hidden rounded-[1.5rem] border border-stone-100 bg-stone-50 shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md flex flex-col">
                      <div className="relative h-44 shrink-0">
                        {post.image ? (
                          <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-stone-200 text-sm text-stone-500">
                            Carnet Heldonica
                          </div>
                        )}
                      </div>
                      <div className="p-5 flex-1">
                        <span className="text-xs font-semibold text-eucalyptus">{post.category}</span>
                        <h3 className="mt-2 text-base font-semibold leading-snug text-stone-900 transition-colors duration-200 group-hover:text-eucalyptus">
                          {post.title}
                        </h3>
                        <p className="mt-3 text-xs text-stone-500">{post.date} · {post.readTime} min</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-cloud-dancer px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-3 text-2xl font-serif text-mahogany">
              Télécharge le guide {page.title} en PDF
            </h2>
            <p className="mb-6 text-sm text-charcoal/60">
              Itinéraires, budget, meilleure saison, adresses — tout dans un guide prêt à emporter.
            </p>
            <GuideDownloadButton slug={page.slug} title={page.title} />
          </div>
        </section>

        <section className="px-4 py-20">
          <div className="mx-auto max-w-3xl rounded-[2rem] bg-stone-950 px-6 py-12 text-center text-white md:px-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-teal">Planifier</p>
            <h2 className="mb-4 text-3xl font-serif font-light leading-tight md:text-4xl">
              Tu veux cette destination, mais à ton rythme ?
            </h2>
            <p className="mx-auto mb-8 max-w-2xl text-sm leading-relaxed text-white/75 md:text-base">
              On reprend la destination à partir de ce que tu peux vraiment vivre : temps, budget, énergie, envies, frottements. Et on construit la suite avec toi.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/travel-planning-form"
                className="rounded-full bg-eucalyptus px-7 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-eucalyptus/90 shadow-md"
              >
                Nous écrire →
              </Link>
              <Link
                href="/travel-planning"
                className="text-sm font-semibold text-teal transition-colors duration-200 hover:text-white"
              >
                Voir notre approche →
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
