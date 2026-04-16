import { getPostBySlug, getAllSlugs, getRelatedPosts, formatDate } from '@/lib/blog-supabase'
import type { BlogPost } from '@/lib/blog-supabase'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import NewsletterForm from '@/components/NewsletterForm'
import ShareButtons from '@/components/ShareButtons'
import EnhancedRichContent from '@/components/EnhancedRichContent'
import { sanitizeHtml } from '@/lib/sanitize-html'

export const revalidate = 60

const SITE_URL = 'https://heldonica.fr'
const DEFAULT_OG = `${SITE_URL}/og-default.jpg`

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs()
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug)
  if (!post) return { title: 'Article introuvable | Heldonica' }

  const ogImage = post.featured_image ?? DEFAULT_OG
  const canonical = `${SITE_URL}/blog/${post.slug}`
  const description = post.excerpt ?? 'Un carnet Heldonica écrit depuis le terrain.'

  return {
    title: `${post.title} | Heldonica`,
    description,
    alternates: { canonical },
    authors: post.author ? [{ name: post.author }] : [{ name: 'Heldonica' }],
    openGraph: {
      title: post.title,
      description,
      url: canonical,
      siteName: 'Heldonica',
      type: 'article',
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at ?? undefined,
      authors: post.author ? [post.author] : ['Heldonica'],
      tags: post.tags ?? undefined,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [ogImage],
    },
  }
}

function calcReadTime(content: string | null): number {
  if (!content) return 0
  const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

function buildJsonLds(post: BlogPost, readTime: number) {
  const articleLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt ?? '',
    image: post.featured_image ? [post.featured_image] : [DEFAULT_OG],
    datePublished: post.published_at ?? '',
    dateModified: post.updated_at ?? post.published_at ?? '',
    author: {
      '@type': 'Person',
      name: post.author ?? 'Heldonica',
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
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Accueil',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${SITE_URL}/blog`,
      },
      ...(post.category
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: post.category,
              item: `${SITE_URL}/blog?categorie=${encodeURIComponent(post.category)}`,
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: post.title,
              item: `${SITE_URL}/blog/${post.slug}`,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: post.title,
              item: `${SITE_URL}/blog/${post.slug}`,
            },
          ]),
    ],
  }

  return { articleLd, breadcrumbLd }
}

const HERO_FALLBACK: Record<string, string> = {
  'Carnets Voyage': 'bg-gradient-to-br from-teal-900 via-stone-800 to-emerald-900',
  'Découvertes Locales': 'bg-gradient-to-br from-amber-900 via-orange-900 to-stone-800',
  'Guides Pratiques': 'bg-gradient-to-br from-slate-900 via-stone-800 to-zinc-900',
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug)
  if (!post) notFound()

  const related = await getRelatedPosts(post.slug, post.category, 3)
  const heroImage = post.featured_image ?? null
  const fallbackBg = HERO_FALLBACK[post.category ?? ''] ?? 'bg-gradient-to-br from-stone-900 to-amber-900'
  const readTime = calcReadTime(post.content)
  const { articleLd, breadcrumbLd } = buildJsonLds(post, readTime)
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`
  const safeContent = sanitizeHtml(post.content)

  return (
    <>
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

      <Header />
      <main className="min-h-screen bg-white">
        <div className={`relative h-[56vh] w-full overflow-hidden md:h-[68vh] ${!heroImage ? fallbackBg : 'bg-stone-900'}`}>
          {heroImage && (
            <img
              src={heroImage}
              alt={post.title}
              width={1920}
              height={1080}
              className="absolute inset-0 h-full w-full object-cover opacity-75"
            />
          )}
          {!heroImage && (
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 25% 35%, white 1px, transparent 1px), radial-gradient(circle at 75% 65%, white 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          )}
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
                  <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
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
                <span>{post.author ?? 'Heldonica'}</span>
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

        <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
          {post.excerpt && (
            <div className="mb-10 rounded-[2rem] border border-amber-200 bg-amber-50 px-6 py-6 md:px-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-amber-800">Ouverture</p>
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
                prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline
                prose-img:mx-auto prose-img:my-10 prose-img:rounded-[1.75rem] prose-img:shadow-lg
                prose-strong:text-stone-900 prose-strong:font-semibold
                prose-blockquote:rounded-r-2xl prose-blockquote:border-l-4 prose-blockquote:border-amber-400 prose-blockquote:bg-amber-50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:not-italic prose-blockquote:text-stone-700
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

          {post.voice_notes && (
            <aside className="mt-10 rounded-[2rem] border border-stone-200 bg-stone-50 px-6 py-6 md:px-8">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Détail terrain</p>
              <p className="text-base leading-relaxed text-stone-700">{post.voice_notes}</p>
            </aside>
          )}

          <div className="mt-10 border-t border-stone-100 pt-8">
            <ShareButtons title={post.title} url={canonicalUrl} />
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 border-t border-stone-100 pt-6">
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-stone-400">Tags</p>
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
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 transition-colors duration-200 hover:text-amber-800"
            >
              ← Retour aux carnets
            </Link>
          </div>
        </div>

        {related.length > 0 && (
          <section className="bg-stone-50 py-16">
            <div className="mx-auto max-w-6xl px-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">Continuer</p>
              <h2 className="mb-3 text-3xl font-serif font-light text-stone-900">Dans la même veine</h2>
              <p className="mb-8 max-w-2xl text-sm leading-relaxed text-stone-600">
                D&apos;autres récits qui avancent au même rythme : un moment précis, un lieu, un détail qui reste.
              </p>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {related.map((relatedPost: BlogPost) => (
                  <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`} className="group block transition-all duration-200">
                    <article className="overflow-hidden rounded-[1.5rem] bg-white shadow-sm transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md">
                      {relatedPost.featured_image ? (
                        <img
                          src={relatedPost.featured_image}
                          alt={relatedPost.title}
                          width={400}
                          height={176}
                          className="h-44 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className={`flex h-44 items-center justify-center ${HERO_FALLBACK[relatedPost.category ?? ''] ?? 'bg-stone-200'}`}>
                          <span className="font-serif text-4xl text-white/40">H</span>
                        </div>
                      )}
                      <div className="p-5">
                        {relatedPost.category && (
                          <span className="text-xs font-semibold text-amber-700">{relatedPost.category}</span>
                        )}
                        <h3 className="mt-2 text-base font-semibold leading-snug text-stone-900 transition-colors duration-200 group-hover:text-amber-700">
                          {relatedPost.title}
                        </h3>
                        <p className="mt-3 text-xs text-stone-400">{formatDate(relatedPost.published_at)}</p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <NewsletterForm variant="blog" />
      </main>
      <Footer />
    </>
  )
}
