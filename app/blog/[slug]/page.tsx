import { getPostBySlug, getAllSlugs, getAllPosts, formatDate } from '@/lib/blog-supabase'
import type { BlogPost } from '@/lib/blog-supabase'
import type { Metadata } from 'next'
import { createServiceClient } from '@/lib/supabase'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getRelatedArticles } from '@/lib/related-articles'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterForm from '@/components/NewsletterForm'
import ShareButtons from '@/components/ShareButtons'
import EnhancedRichContent from '@/components/EnhancedRichContent'
import { sanitizeHtml } from '@/lib/sanitize-html'
import Image from 'next/image'
import ReadingProgress from '@/components/ReadingProgress'
import CtaTravelPlanning from '@/components/CtaTravelPlanning'
import HeldonicaFAQ from '@/components/HeldonicaFAQ'
import HeldonicaVerdict from '@/components/HeldonicaVerdict'
import { getReadingTime, formatReadingTime } from '@/lib/readingTime'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import { getPageZones } from '@/lib/cms-zones'
import DynamicArticleMap from '@/components/DynamicArticleMap'
import { verifyPreviewToken } from '@/lib/preview-token'
import { getPageLayout } from '@/lib/layout-helpers'

const SITE_URL = 'https://www.heldonica.fr'

// TODO: Remplacer ce fallback de marque par des visuels définitifs issus des prompts image validés
// Concernés : tous les articles sans featured_image dans la DB (cf. plan de correction)
// Prompts associés : 13 prompts prêts dans le plan de correction (madere-foret, zurich-limmat, stoos-ridge, etc.)
const HERO_FALLBACK_DEFAULT: Record<string, string> = {
  'Carnets Voyage': '/og-default.jpg',
  'Découvertes Locales': '/og-default.jpg',
  'Guides Pratiques': '/og-default.jpg',
  'Travel': '/og-default.jpg',
  'Food & Lifestyle': '/og-default.jpg',
}

const DEFAULT_HERO = '/og-default.jpg'

async function getHeroFallback(): Promise<Record<string, string>> {
  try {
    const { createServiceClient } = await import('@/lib/supabase')
    const supabase = createServiceClient()
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'hero_fallback_images')
      .single()
    if (data?.value) {
      const parsed = JSON.parse(data.value)
      if (typeof parsed === 'object' && parsed !== null) {
        return { ...HERO_FALLBACK_DEFAULT, ...parsed }
      }
    }
  } catch {}
  return HERO_FALLBACK_DEFAULT
}

/** Build a fallback OG image URL via /api/og when no real image exists */
function ogFallbackUrl(title: string, description: string | null): string {
  const desc = (description || '').length > 160 ? description!.substring(0, 157) + '...' : (description || '')
  return `${SITE_URL}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(desc)}&type=article`
}

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ preview_token?: string }>
}

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return (slugs ?? []).map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = (await params).slug
  const post = await getPostBySlug(slug)

  if (!post) return { title: 'Article introuvable | Heldonica' }

  const seoTitle = post.seo_title || post.title
  const pageTitle = `${seoTitle} | Heldonica`

  const rawDesc = post.seo_description || post.excerpt || ''
  const description = rawDesc.length > 160
    ? rawDesc.substring(0, 157) + '...'
    : rawDesc

  const ogImageUrl = post.og_image || post.featured_image || ogFallbackUrl(post.title, rawDesc)
  const canonical = `${SITE_URL}/blog/${slug}`
  const publishedTime = post.published_at || undefined
  const modifiedTime = post.updated_at || post.published_at || undefined
  const authorName = post.author || 'Heldonica'
  const imageAlt = post.alt_text || post.title

  // Handle tags - can be array (from CMS) or string
  const tagsArray = Array.isArray(post.tags) ? post.tags : (post.tags ? String(post.tags).split(',').map((t: string) => t.trim()).filter(Boolean) : [])

  return {
    title: pageTitle,
    description,
    keywords: tagsArray,
    alternates: { canonical },
    openGraph: {
      title: pageTitle,
      description,
      url: canonical,
      siteName: 'Heldonica',
      locale: 'fr_FR',
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: [authorName],
      tags: tagsArray,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description,
      images: [ogImageUrl],
      creator: '@heldonica',
    },
  }
}

function buildJsonLds(post: BlogPost, readTime: number) {
  const ldImage = post.og_image || post.featured_image || ogFallbackUrl(post.title, post.seo_description || post.excerpt || '')
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo_title || post.title,
        description: post.seo_description || post.excerpt || '',
    image: [ldImage],
    datePublished: post.published_at ?? '',
    dateModified: post.updated_at ?? post.published_at ?? '',
    author: {
      '@type': 'Person',
      name: post.author || 'Heldonica',
      url: SITE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Heldonica',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    url: `${SITE_URL}/blog/${post.slug}`,
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    keywords: post.tags?.join(', ') ?? '',
    articleSection: post.category ?? '',
    timeRequired: readTime > 0 ? `PT${readTime}M` : undefined,
    inLanguage: 'fr-FR',
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Carnets de voyage', item: `${SITE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title }
    ]
  }

  const travelCategories = ['Travel', 'Guides Pratiques', 'Carnets Voyage', 'Decouvertes Locales']
  const isTravelArticle = post.category && travelCategories.includes(post.category)
  const travelLd = isTravelArticle
    ? {
        '@context': 'https://schema.org',
        '@type': 'TravelArticle' as const,
        headline: post.seo_title || post.title,
        description: post.seo_description || post.excerpt || '',
        image: [],
        datePublished: post.published_at ?? '',
        dateModified: post.updated_at ?? post.published_at ?? '',
        author: { '@type': 'Person', name: post.author || 'Heldonica', url: SITE_URL },
        publisher: { '@type': 'Organization', name: 'Heldonica', url: SITE_URL },
        url: `${SITE_URL}/blog/${post.slug}`,
        mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
        touristType: 'Couple slow travel',
        aboutPlace: { '@type': 'Place', name: post.destination || post.category || '' },
        suitableForCategory: 'Slow travel, ecotourisme, voyage en couple',
        inLanguage: 'fr-FR',
      }
    : null

  return { articleLd, breadcrumbLd, travelLd }
}

export default async function BlogPostPage({ params, searchParams }: Props) {
  const slug = (await params).slug
  const { preview_token } = await searchParams

  let post = await getPostBySlug(slug)

  if (!post && preview_token) {
    const verified = await verifyPreviewToken(preview_token)
    if (verified && verified.slug === slug) {
      const supabaseAdmin = createServiceClient()
      const { data } = await supabaseAdmin
        .from('cms_blog_posts')
        .select('*')
        .eq('slug', slug)
        .single()
      if (data) post = data as any
    }
  }

  if (!post) notFound()

  let showMap = false
  try {
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
    if (hasServiceKey) {
      const supabaseAdmin = createServiceClient()
      const { data: mapMeta } = await supabaseAdmin
        .from('cms_blog_posts')
        .select('show_map')
        .eq('slug', slug)
        .single()
      showMap = mapMeta?.show_map === true
    }
  } catch (err) {
    console.warn("Could not query show_map from admin schema, defaulting to false:", err)
  }

  const [allPosts, heroFallback, blogZones] = await Promise.all([
    getAllPosts(),
    getHeroFallback(),
    getPageZones('blog')
  ])
  const relatedResult = getRelatedArticles(post, allPosts, 3)
  const related = relatedResult ?? []
  const heroImage = (post.featured_image && post.featured_image.trim().length > 0)
    ? post.featured_image
    : (heroFallback[post.category ?? ''] ?? DEFAULT_HERO)
  const readTime = getReadingTime(post.content)
  const { articleLd, breadcrumbLd, travelLd } = buildJsonLds(post, readTime)
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`
  const safeContent = sanitizeHtml(post.content)

  const layoutConfig = await getPageLayout('article')
  const activeBlocks = layoutConfig.filter(b => b.active).map(b => b.id)

  const BlockHero = () => (
    <div className={`relative h-[56vh] w-full overflow-hidden md:h-[68vh] bg-stone-900`}>
      <Image
        src={heroImage}
        alt={post.alt_text || post.title}
        fill
        className="object-cover opacity-75"
        loading="eager"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/blog"
            className="mb-5 inline-flex items-center gap-2 text-sm text-white/65 transition-colors duration-200 hover:text-white"
          >
            ← Retour aux carnets
          </Link>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {post.category && (
              <span className="rounded-full bg-teal px-3 py-1 text-xs font-bold text-white">
                {post.category}
              </span>
            )}
            {post.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/15 px-2.5 py-1 text-xs text-white/80 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <h1 className="mb-4 text-3xl font-serif font-light leading-tight text-white md:text-5xl">
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/65">
            <span>{post.author || 'Heldonica'}</span>
            <span>•</span>
            <span>{formatDate(post.published_at)}</span>
            {readTime > 0 && (
              <>
                <span>•</span>
                <span>{readTime} min de lecture</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  const BlockContent = () => (
    <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
      {post.excerpt && (
        <div className="mb-10 rounded-[2rem] border border-eucalyptus/20 bg-eucalyptus/5 px-6 py-6 md:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-mahogany">Ouverture</p>
          <p className="text-xl font-light leading-relaxed text-stone-800">{post.excerpt}</p>
        </div>
      )}

      {safeContent ? (
        <EnhancedRichContent
          html={safeContent}
          className="prose prose-lg max-w-none
            prose-headings:font-serif prose-headings:font-light prose-headings:text-stone-900
            prose-h2:mt-12 prose-h2:mb-5 prose-h2:text-3xl
            prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-2xl
            prose-p:mb-6 prose-p:text-stone-700 prose-p:leading-8
            prose-a:text-mahogany prose-a:no-underline hover:prose-a:underline
            prose-img:mx-auto prose-img:my-10 prose-img:rounded-[1.75rem] prose-img:shadow-lg
            prose-strong:text-stone-900 prose-strong:font-semibold
            prose-blockquote:rounded-r-2xl prose-blockquote:border-l-4 prose-blockquote:border-teal prose-blockquote:bg-eucalyptus/5 prose-blockquote:px-6 prose-blockquote:py-4
            prose-ul:space-y-3 prose-li:text-stone-700
            prose-hr:border-stone-200"
        />
      ) : (
        <div className="rounded-[2rem] border border-stone-200 bg-stone-50 px-6 py-12 text-center">
          <p className="text-lg leading-relaxed text-stone-500">
            Le récit n&apos;est pas encore publié en entier.
          </p>
        </div>
      )}
    </div>
  )

  const BlockMap = () => (
    showMap ? (
      <div className="mx-auto max-w-3xl px-4 pb-8">
        <DynamicArticleMap slug={slug} />
      </div>
    ) : null
  )

  const BlockVoiceNotes = () => (
    post.voice_notes ? (
      <div className="mx-auto max-w-3xl px-4 pb-8">
        <aside className="rounded-[2rem] border border-stone-200 bg-stone-50 px-6 py-6 md:px-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Détail terrain</p>
          <p className="text-base leading-relaxed text-stone-700">{post.voice_notes}</p>
        </aside>
      </div>
    ) : null
  )

  const BlockTags = () => (
    <div className="mx-auto max-w-3xl px-4 pb-16">
      <div className="border-t border-stone-100 pt-8">
        <ShareButtons title={post.title} url={canonicalUrl} />
      </div>

      {post.tags && post.tags.length > 0 && (
        <div className="mt-8 border-t border-stone-100 pt-6">
          <p className="mb-3 text-xs uppercase tracking-[0.18em] text-stone-500">Tags</p>
          <div className="flex flex-wrap gap-2">
            {post.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-stone-100 px-3 py-1.5 text-xs text-stone-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 border-t border-stone-100 pt-6">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm font-semibold text-mahogany transition-colors duration-200 hover:text-mahogany"
        >
          ← Retour aux carnets
        </Link>
      </div>
    </div>
  )

  const BlockRelated = () => (
    related.length > 0 ? (
      <section className="bg-stone-50 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-mahogany">
            <EditableZone page="blog" zone="related_kicker" fallback="Continuer" />
          </p>
          <h2 className="mb-3 text-3xl font-serif font-light text-stone-900">
            <EditableZone page="blog" zone="related_title" fallback="Dans la même veine" />
          </h2>
          <p className="mb-8 max-w-2xl text-sm leading-relaxed text-stone-600">
            <EditableZone
              page="blog"
              zone="related_intro"
              type="textarea"
              fallback="D'autres récits qui avancent au même rythme : un moment précis, un lieu, un détail qui reste."
            />
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {related.map((relatedPost: BlogPost) => {
              const relatedImage = relatedPost.og_image || relatedPost.featured_image || heroFallback[relatedPost.category ?? ''] || DEFAULT_HERO
              return (
                <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className="group block transition-all duration-200">
                  <article className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md">
                    <div className="relative h-44 overflow-hidden">
                      <Image
                        src={relatedImage}
                        alt={relatedPost.alt_text || relatedPost.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </div>
                    <div className="p-5">
                      {relatedPost.category && (
                        <span className="text-xs font-semibold text-mahogany">{relatedPost.category}</span>
                      )}
                      <h3 className="mt-2 text-base font-semibold leading-snug text-stone-900 transition-colors duration-200 group-hover:text-mahogany">
                        {relatedPost.title}
                      </h3>
                      {relatedPost.excerpt && (
                        <p className="mt-3 line-clamp-2 text-sm text-stone-500">
                          {relatedPost.excerpt}
                        </p>
                      )}
                      <div className="mt-4 flex items-center gap-2 text-xs text-stone-400">
                        <span>{formatDate(relatedPost.published_at)}</span>
                        <span>•</span>
                        <span>{getReadingTime(relatedPost.content || '')} min</span>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        </div>
      </section>
    ) : null
  )

  const blockComponents: Record<string, React.FC> = {
    hero: BlockHero,
    content: BlockContent,
    map: BlockMap,
    voice_notes: BlockVoiceNotes,
    tags: BlockTags,
    related_articles: BlockRelated,
  }

  return (
    <InlineEditProvider page="blog" initialZones={blogZones}>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {travelLd && (
        <Script
          id="travel-article-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(travelLd) }}
        />
      )}

      <Header />
      <ReadingProgress />
      <main className="min-h-screen bg-white pb-12">
        {activeBlocks.map(blockId => {
          const Component = blockComponents[blockId]
          return Component ? <Component key={blockId} /> : null
        })}
        <NewsletterForm variant="blog" />
        {post.category === 'Guides Pratiques' && post.faq_content && (
          <HeldonicaFAQ
            items={(post.faq_content as Array<{question: string; answer: string}>) || []}
          />
        )}

        <CtaTravelPlanning />
      </main>
      <Footer />
    </InlineEditProvider>
  )
}
