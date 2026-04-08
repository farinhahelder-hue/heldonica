import { getPostBySlug, getAllSlugs, getRelatedPosts, formatDate } from '@/lib/blog-supabase';
import type { BlogPost } from '@/lib/blog-supabase';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import NewsletterForm from '@/components/NewsletterForm';

export const revalidate = 60;

const SITE_URL = 'https://heldonica.fr';
const DEFAULT_OG = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200';

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

// Calcule le temps de lecture depuis le contenu (200 mots/min)
function calcReadTime(content: string | null): number {
  if (!content) return 0;
  const words = content.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Génère le JSON-LD BlogPosting + BreadcrumbList schema.org
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

// Palette de fonds par catégorie quand pas d'image
const HERO_FALLBACK: Record<string, string> = {
  'Carnets Voyage': 'bg-gradient-to-br from-teal-900 via-stone-800 to-emerald-900',
  'Découvertes Locales': 'bg-gradient-to-br from-amber-900 via-orange-900 to-stone-800',
  'Guides Pratiques': 'bg-gradient-to-br from-slate-900 via-stone-800 to-zinc-900',
};

// Boutons de partage social (client component inline)
function ShareButtons({ title, url }: { title: string; url: string }) {
  const encoded = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs text-stone-400 uppercase tracking-wider font-medium">Partager</span>

      {/* Pinterest */}
      <a
        href={`https://pinterest.com/pin/create/button/?url=${encoded}&description=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur Pinterest"
        className="inline-flex items-center gap-1.5 bg-[#E60023] hover:bg-[#c0001d] text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/>
        </svg>
        Pinterest
      </a>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Partager sur WhatsApp"
        className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1ebe5a] text-white text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
        </svg>
        WhatsApp
      </a>

      {/* Copier le lien */}
      <button
        onClick={() => {
          navigator.clipboard.writeText(url).then(() => {
            const btn = document.getElementById('copy-link-btn');
            if (btn) {
              btn.textContent = '✓ Copié !';
              setTimeout(() => { if (btn) btn.textContent = '🔗 Copier le lien'; }, 2000);
            }
          });
        }}
        id="copy-link-btn"
        aria-label="Copier le lien de l'article"
        className="inline-flex items-center gap-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
      >
        🔗 Copier le lien
      </button>
    </div>
  );
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug, post.category, 3);
  const heroImage = post.featured_image ?? null;
  const fallbackBg = HERO_FALLBACK[post.category ?? ''] ?? 'bg-gradient-to-br from-stone-900 to-amber-900';
  const readTime = calcReadTime(post.content);
  const { articleLd, breadcrumbLd } = buildJsonLds(post, readTime);
  const canonicalUrl = `${SITE_URL}/blog/${post.slug}`;

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

          {post.content ? (
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
              dangerouslySetInnerHTML={{ __html: post.content }}
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
