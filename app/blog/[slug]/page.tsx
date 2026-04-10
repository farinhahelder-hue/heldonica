import { getPostBySlug, getAllSlugs, getRelatedPosts, formatDate } from '@/lib/blog-supabase';
import type { BlogPost } from '@/lib/blog-supabase';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsletterForm from '@/components/NewsletterForm';
import ShareButtons from '@/components/ShareButtons';
import { sanitizeHtml } from '@/lib/sanitize-html';

export const revalidate = 60;

const SITE_URL = 'https://heldonica.fr';
const DEFAULT_OG = `${SITE_URL}/og-default.jpg`;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Article introuvable | Heldonica' };

  const ogImage = post.featured_image ?? DEFAULT_OG;
  const canonical = `${SITE_URL}/blog/${post.slug}`;
  const description = post.excerpt ?? `Découvrez cet article de slow travel signé Heldonica.`;

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
  };
}

function calcReadTime(content: string | null): number {
  if (!content) return 0;
  const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
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
  };

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
  };

  return { articleLd, breadcrumbLd };
}

const HERO_FALLBACK: Record<string, string> = {
  'Carnets Voyage': 'bg-gradient-to-br from-teal-900 via-stone-800 to-emerald-900',
  'Découvertes Locales': 'bg-gradient-to-br from-amber-900 via-orange-900 to-stone-800',
  'Guides Pratiques': 'bg-gradient-to-br from-slate-900 via-stone-800 to-zinc-900',
};

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug, post.category, 3);
  const heroImage = post.featured_image ?? null;
  const fallbackBg = HERO_FALLBACK[post.category ?? ''] ?? 'bg-gradient-to-br from-stone-900 to-amber-900';
  const readTime = calcReadTime(post.content);
  const { articleLd, breadcrumbLd } = buildJsonLds(post, readTime);
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;
  const safeContent = sanitizeHtml(post.content);

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

        {/* ── HERO */}
        <div className={`relative h-[55vh] md:h-[65vh] w-full overflow-hidden ${!heroImage ? fallbackBg : 'bg-stone-900'}`}>
          {heroImage && (
            <img
              src={heroImage}
              alt={post.title}
              width={1920}
              height={1080}
              className="absolute inset-0 w-full h-full object-cover opacity-75"
            />
          )}
          {!heroImage && (
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'radial-gradient(circle at 25% 35%, white 1px, transparent 1px), radial-gradient(circle at 75% 65%, white 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-5 transition-colors"
              >
                ← Retour au blog
              </Link>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {post.category && (
                  <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {post.category}
                  </span>
                )}
                {post.tags?.slice(0, 2).map((t) => (
                  <span key={t} className="bg-white/15 text-white/80 text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">{t}</span>
                ))}
              </div>
              <h1 className="text-3xl md:text-5xl font-serif font-bold text-white leading-tight mb-4">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/65 text-sm">
                <span>✦ {post.author ?? 'Heldonica'}</span>
                <span>·</span>
                <span>{formatDate(post.published_at)}</span>
                {readTime > 0 && (
                  <><span>·</span><span>{readTime} min de lecture</span></>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENU */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          {post.excerpt && (
            <p className="text-xl text-stone-600 leading-relaxed mb-10 font-light italic border-l-4 border-amber-400 pl-5 py-2">
              {post.excerpt}
            </p>
          )}

          {safeContent ? (
            <div
              className="prose prose-lg max-w-none
                prose-headings:font-serif prose-headings:font-bold prose-headings:text-stone-900
                prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                prose-p:text-stone-700 prose-p:leading-relaxed prose-p:mb-5
                prose-a:text-amber-700 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-2xl prose-img:shadow-lg prose-img:mx-auto prose-img:my-8
                prose-strong:text-stone-900 prose-strong:font-semibold
                prose-blockquote:border-l-4 prose-blockquote:border-amber-400 prose-blockquote:bg-amber-50 prose-blockquote:px-6 prose-blockquote:py-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:text-stone-700
                prose-ul:space-y-2 prose-li:text-stone-700
                prose-hr:border-stone-200"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />
          ) : (
            <div className="py-16 text-center">
              <p className="text-5xl mb-4">✍️</p>
              <p className="text-stone-400 text-lg">Le contenu de cet article arrive bientôt.</p>
            </div>
          )}

          {/* ── PARTAGE SOCIAL */}
          <div className="mt-10 pt-8 border-t border-stone-100">
            <ShareButtons title={post.title} url={canonicalUrl} />
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-8 pt-6 border-t border-stone-100">
              <p className="text-xs text-stone-400 uppercase tracking-wider mb-3">Tags</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-stone-100 hover:bg-amber-100 text-stone-600 text-xs px-3 py-1.5 rounded-full transition-colors cursor-default"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-stone-100 flex justify-between items-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-semibold text-sm transition-colors"
            >
              ← Tous les articles
            </Link>
          </div>
        </div>

        {/* ── ARTICLES SIMILAIRES */}
        {related.length > 0 && (
          <section className="bg-stone-50 py-16">
            <div className="max-w-6xl mx-auto px-4">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-700 mb-2">✦ À lire aussi</p>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-8">Dans la même catégorie</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((p: BlogPost) => (
                  <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
                      {p.featured_image ? (
                        <img
                          src={p.featured_image}
                          alt={p.title}
                          width={400}
                          height={176}
                          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className={`w-full h-44 flex items-center justify-center ${HERO_FALLBACK[p.category ?? ''] ?? 'bg-stone-200'}`}>
                          <span className="text-white/40 text-4xl font-serif">H</span>
                        </div>
                      )}
                      <div className="p-4">
                        <span className="text-xs text-amber-700 font-semibold">{p.category}</span>
                        <h3 className="font-semibold text-stone-900 mt-1 line-clamp-2 group-hover:text-amber-700 transition-colors text-sm">
                          {p.title}
                        </h3>
                        <p className="text-xs text-stone-400 mt-2">
                          {formatDate(p.published_at)}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── NEWSLETTER */}
        <NewsletterForm variant="blog" />

      </main>
      <Footer />
    </>
  );
}
