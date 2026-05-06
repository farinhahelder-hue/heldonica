import { getDestinationBySlug, getAllDestinationSlugs, blogPosts } from '@/lib/wordpress-data'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import EnhancedRichContent from '@/components/EnhancedRichContent'
import { sanitizeHtml } from '@/lib/sanitize-html'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Props {
  params: { slug: string }
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
  description: 'Badi flottantes, brasseries artisanales et vieille ville dense. Zurich se révèle quand on ralentit assez pour la laisser venir.',
  heroImage: 'https://heldonica.fr/wp-content/uploads/2025/08/zurich-panorama-2-1024x679.jpg',
  region: 'Suisse',
  duration: '3 à 4 jours',
  budget: 'Élevé mais rattrapable à pied',
  bestSeason: 'Juin à septembre',
  verdict: 'Une ville plus sensuelle que sa réputation.',
  intro: 'On y est venus avec des idées toutes faites. Elles ont sauté dès la première baignade dans la Limmat.',
}

const suisseMeta: DestinationMeta = {
  description: 'Montagnes, lacs, trains impeccables et détours qui demandent du temps. La Suisse devient juste quand on cesse de la résumer à son prix.',
  heroImage: 'https://heldonica.fr/wp-content/uploads/2025/08/PXL_20250712_190916811.RAW-01.COVER-EDIT-1024x771.jpg',
  region: 'Europe',
  duration: '7 à 12 jours',
  budget: 'Moyen à élevé',
  bestSeason: 'Juillet à septembre',
  verdict: 'Une destination lente, si on la laisse respirer.',
  intro: 'On y revient pour les crêtes, puis on reste pour tout ce qu’on n’avait pas prévu entre deux trajets.',
}

const roumanieMeta: DestinationMeta = {
  description: 'Timişoara, Delta du Danube, Carpates : la Roumanie donne beaucoup à celles et ceux qui acceptent de lui laisser de l’espace.',
  heroImage: 'https://heldonica.fr/wp-content/uploads/2025/09/timisoara-ville-3-1024x683.jpg',
  region: 'Europe',
  duration: '8 à 14 jours',
  budget: 'Accessible',
  bestSeason: 'Mai, juin, septembre',
  verdict: 'Le genre de pays qui déplace ton regard.',
  intro: 'On pensait partir vers une destination discrète. On a trouvé un terrain immense, vivant, parfois brut, souvent bouleversant.',
}

const madereMeta: DestinationMeta = {
  description: 'Forêts humides, levadas, falaises, pain chaud et retours successifs. Madère ne se livre pas en une seule fois.',
  heroImage: 'https://heldonica.fr/wp-content/uploads/2026/03/madere-foret-1024x683.jpg',
  region: 'Portugal',
  duration: '7 à 10 jours',
  budget: 'Moyen',
  bestSeason: 'Octobre à mai',
  verdict: 'L’île qu’on a mis des années à comprendre.',
  intro: 'Chaque retour nous fait corriger quelque chose : un itinéraire trop tendu, un village quitté trop vite, une lumière manquée la veille.',
}

const parisMeta: DestinationMeta = {
  description: 'Paris et l’Île-de-France se lisent mieux quand on sort des grandes phrases. Un canal, une friche, une rue, et le rythme change.',
  heroImage: 'https://heldonica.fr/wp-content/uploads/2025/09/paris-petite-ceinture-2-683x1024.jpg',
  region: 'France',
  duration: '2 à 5 jours',
  budget: 'Variable',
  bestSeason: 'Toute l’année',
  verdict: 'La preuve qu’on peut ralentir sans partir loin.',
  intro: 'Le slow travel commence parfois à une station de métro de chez soi. C’est peut-être pour ça qu’on y tient autant.',
}

const normandieMeta: DestinationMeta = {
  description: 'Étretat, Honfleur, Deauville : la Normandie côtière demande moins de cases à cocher et plus de temps entre deux marées.',
  heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600',
  region: 'France',
  duration: '3 à 5 jours',
  budget: 'Modulable',
  bestSeason: 'Mai à septembre',
  verdict: 'La côte marche mieux quand on accepte ses détours.',
  intro: 'Ici, le bon rythme vient souvent du vent, de l’heure de la marée et d’une table trouvée plus tard que prévu.',
}

const bretagneMeta: DestinationMeta = {
  description: 'Sentiers côtiers, crêperies, lumière changeante et Saint-Malo comme point d’appui. La Bretagne gagne à être laissée tranquille.',
  heroImage: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600',
  region: 'France',
  duration: '4 à 7 jours',
  budget: 'Modulable',
  bestSeason: 'Mai à septembre',
  verdict: 'Une destination qui se donne mieux à pied qu’en programme serré.',
  intro: 'On y va pour la côte, puis on reste pour ce que la météo déplace dans une même journée.',
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
  normandie: normandieMeta,
  'normandie-heldonica': normandieMeta,
  bretagne: bretagneMeta,
  'bretagne-heldonica-slow': bretagneMeta,
}

export async function generateStaticParams() {
  return getAllDestinationSlugs()
}

export async function generateMetadata({ params }: Props) {
  const page = getDestinationBySlug(params.slug)
  const meta = DEST_META[params.slug]
  const title = page?.title || params.slug
  const description = meta?.description || `Découvre ${title} avec Heldonica, depuis le terrain et sans vernis inutile.`

  return {
    title: `${title} | Heldonica`,
    description,
    openGraph: {
      title: `${title} | Heldonica`,
      description,
      siteName: 'Heldonica',
      locale: 'fr_FR',
      type: 'article',
      images: meta?.heroImage ? [{ url: meta.heroImage, width: 1024, height: 683, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Heldonica`,
      description,
      creator: '@heldonica',
      images: meta?.heroImage ? [meta.heroImage] : [],
    },
  }
}

export default function DestinationPage({ params }: Props) {
  const page = getDestinationBySlug(params.slug)
  if (!page) notFound()

  const meta = DEST_META[params.slug]
  const heroImage = page.image || meta?.heroImage || ''
  const safeContent = sanitizeHtml(page.content)

  const titleWords = page.title.toLowerCase().split(/\s+/).filter((word) => word.length > 3)
  const related = blogPosts
    .filter((post) => {
      const haystack = `${post.title} ${post.categories.join(' ')} ${post.tags.join(' ')}`.toLowerCase()
      return titleWords.some((word) => haystack.includes(word))
    })
    .slice(0, 6)

  const facts = meta
    ? [
        { label: 'Durée idéale', value: meta.duration },
        { label: 'Budget indicatif', value: meta.budget },
        { label: 'Meilleure saison', value: meta.bestSeason },
        { label: 'Notre verdict', value: meta.verdict },
      ]
    : []

  return (
    <>
      <Header />
      <main className="min-h-screen bg-cloud-dancer">

        {/* Hero */}
        <div className="relative min-h-[60vh] flex items-end overflow-hidden bg-stone-900 md:min-h-[70vh]">
          {heroImage && (
            <img
              src={heroImage}
              alt={page.title}
              className="absolute inset-0 h-full w-full object-cover opacity-65"
              loading="eager"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
          <div className="relative container py-14 md:py-20">
            <Link
              href="/destinations"
              className="mb-5 inline-flex items-center gap-2 text-sm text-white/65 hover:text-white transition-colors"
            >
              ← Retour aux destinations
            </Link>
            {meta?.region && (
              <p className="text-xs uppercase tracking-[0.2em] text-teal font-semibold mb-4">
                {meta.region}
              </p>
            )}
            <h1 className="text-4xl md:text-6xl font-serif text-white max-w-4xl mb-5 leading-tight">
              {page.title}
            </h1>
            {meta?.description && (
              <p className="text-white/80 max-w-2xl text-lg leading-relaxed">{meta.description}</p>
            )}
          </div>
        </div>

        {/* Facts */}
        {facts.length > 0 && (
          <section className="bg-white border-b border-stone-200">
            <div className="container grid md:grid-cols-4 gap-4 py-8">
              {facts.map((fact) => (
                <div key={fact.label} className="rounded-2xl border border-stone-200 bg-cloud-dancer/60 p-5">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-eucalyptus font-semibold mb-2">{fact.label}</p>
                  <p className="text-sm leading-relaxed text-charcoal">{fact.value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contenu principal */}
        <section className="section-spacing">
          <div className="container max-w-4xl">
            {meta?.intro && (
              <div className="mb-10 rounded-2xl border border-eucalyptus/20 bg-eucalyptus/5 px-6 py-6 md:px-8">
                <p className="text-lg font-light leading-relaxed text-charcoal">{meta.intro}</p>
              </div>
            )}

            {safeContent ? (
              <EnhancedRichContent
                html={safeContent}
                className="prose prose-lg max-w-none
                  prose-headings:font-serif prose-headings:font-light prose-headings:text-mahogany
                  prose-h2:mt-12 prose-h2:mb-5 prose-h2:text-3xl
                  prose-p:mb-6 prose-p:text-charcoal/80 prose-p:leading-8
                  prose-a:text-eucalyptus prose-a:no-underline hover:prose-a:underline
                  prose-img:mx-auto prose-img:my-10 prose-img:rounded-2xl prose-img:shadow-lg
                  prose-strong:text-charcoal prose-strong:font-semibold
                  prose-ul:space-y-3 prose-li:text-charcoal/80
                  prose-ol:space-y-3 prose-li:marker:text-eucalyptus"
              />
            ) : (
              <div className="rounded-2xl border border-stone-200 bg-white px-6 py-12 text-center">
                <p className="text-base leading-relaxed text-charcoal/60">
                  Cette destination est en cours de réécriture. On remet le terrain au centre et on revient vite.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Articles liés */}
        {related.length > 0 && (
          <section className="bg-white section-spacing">
            <div className="container">
              <p className="text-xs uppercase tracking-[0.2em] text-eucalyptus font-semibold mb-2">À lire aussi</p>
              <h2 className="text-3xl font-serif text-mahogany mb-3">Carnets autour de {page.title}</h2>
              <p className="text-charcoal/70 text-sm leading-relaxed mb-8 max-w-2xl">
                Les articles qui prolongent la destination avec ce qu’on a vu, raté, retenu et vraiment traversé.
              </p>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((post) => (
                  <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                    <article className="rounded-2xl border border-stone-200 overflow-hidden bg-cloud-dancer/40 shadow-sm hover:shadow-md transition-all duration-200 group-hover:-translate-y-1">
                      {post.image ? (
                        <img
                          src={post.image}
                          alt={post.title}
                          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          width={400}
                          height={176}
                        />
                      ) : (
                        <div className="flex h-44 items-center justify-center bg-stone-100 text-sm text-charcoal/50">
                          Carnet Heldonica
                        </div>
                      )}
                      <div className="p-5">
                        <span className="text-xs font-semibold text-eucalyptus uppercase tracking-[0.12em]">{post.category}</span>
                        <h3 className="mt-2 text-base font-semibold text-charcoal leading-snug group-hover:text-mahogany transition-colors">
                          {post.title}
                        </h3>
                        <p className="mt-3 text-xs text-charcoal/40">{post.date} · {post.readTime} min</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Planning */}
        <section className="bg-mahogany text-white section-spacing">
          <div className="container text-center max-w-3xl">
            <p className="text-sm uppercase tracking-[0.16em] text-teal mb-3">Voyage sur mesure</p>
            <h2 className="text-3xl md:text-4xl font-serif mb-4">
              Tu veux cette destination, mais à ton rythme ?
            </h2>
            <p className="text-white/80 mb-8">
              On reprend la destination à partir de ce que tu peux vraiment vivre : temps, budget, énergie, envies. Et on construit la suite avec toi.
            </p>
            <Link
              href={`/travel-planning-form?destination=${params.slug}`}
              className="inline-flex px-7 py-3 rounded-full bg-teal text-charcoal font-semibold hover:bg-teal/90 transition-colors"
            >
              Démarrer ma demande →
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  )
}
