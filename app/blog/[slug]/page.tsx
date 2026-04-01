import { getPostBySlug, getAllSlugs, getRelatedPosts, formatDate } from '@/lib/blog-supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import NewsletterForm from '@/components/NewsletterForm';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const revalidate = 60;

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) return { title: 'Article introuvable | Heldonica' };
  return {
    title: `${post.title} | Heldonica`,
    description: post.excerpt ?? '',
    openGraph: {
      title: post.title,
      description: post.excerpt ?? '',
      images: post.image_url
        ? [{ url: post.image_url }]
        : [{ url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200' }],
    },
  };
}

// Palette de fonds par catégorie quand pas d'image
const HERO_FALLBACK: Record<string, string> = {
  'Travel': 'bg-gradient-to-br from-teal-900 via-stone-800 to-emerald-900',
  'Food & Lifestyle': 'bg-gradient-to-br from-amber-900 via-orange-900 to-stone-800',
  'Expertise Hôtelière': 'bg-gradient-to-br from-slate-900 via-stone-800 to-zinc-900',
};

// Unsplash images par destination pour compenser les images manquantes
const DESTINATION_IMAGES: Record<string, string> = {
  'Madère': 'https://images.unsplash.com/photo-1555117343-8b28e6f14895?w=1400',
  'Zurich': 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?w=1400',
  'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1400',
  'Timișoara': 'https://images.unsplash.com/photo-1561336313-0bd5e0b27ec8?w=1400',
  'Suisse': 'https://images.unsplash.com/photo-1502786129236-63f2598fd7b9?w=1400',
  'Normandie': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1400',
};

function getHeroImage(post: { image_url: string | null; destination: string | null }): string | null {
  if (post.image_url) return post.image_url;
  if (post.destination && DESTINATION_IMAGES[post.destination]) {
    return DESTINATION_IMAGES[post.destination];
  }
  return null;
}

// Nettoie les URL d'images embarquées qui pointent vers l'ancien hébergement Ionos
function fixContentImages(html: string | null): string {
  if (!html) return '';
  // Remplace les src d'images Ionos/WordPress par un attribut data pour ne pas casser le layout
  return html
    .replace(
      /src="https?:\/\/(?:heldonica\.fr|www\.heldonica\.fr)\/wp-content\/uploads\/[^"]+"/g,
      'src="" class="wp-image-broken" style="display:none"'
    )
    // Supprime les balises figure/img vides issues du remplacement
    .replace(/<figure[^>]*>\s*<img[^>]*class="wp-image-broken"[^>]*>\s*<\/figure>/g, '');
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post.slug, post.category, 3);
  const heroImage = getHeroImage(post);
  const fallbackBg = HERO_FALLBACK[post.category ?? ''] ?? 'bg-gradient-to-br from-stone-900 to-amber-900';
  const cleanContent = fixContentImages(post.content);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">
        {/* ── HERO ───────────────────────────────────────── */}
        <div className={`relative h-[55vh] md:h-[65vh] w-full overflow-hidden ${!heroImage ? fallbackBg : 'bg-stone-900'}`}>
          {heroImage && (
            <img
              src={heroImage}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover opacity-75"
            />
          )}
          {/* Motif texture subtil pour les héros sans image */}
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
                {post.destination && (
                  <span className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                    📍 {post.destination}
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
                <span>✦ Heldonica</span>
                <span>·</span>
                <span>{formatDate(post.published_at)}</span>
                {post.read_time && (
                  <><span>·</span><span>{post.read_time} min de lecture</span></>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENU ────────────────────────────────────── */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          {post.excerpt && (
            <p className="text-xl text-stone-600 leading-relaxed mb-10 font-light italic border-l-4 border-amber-400 pl-5 py-2">
              {post.excerpt}
            </p>
          )}

          {cleanContent ? (
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
              dangerouslySetInnerHTML={{ __html: cleanContent }}
            />
          ) : (
            <div className="py-16 text-center">
              <p className="text-5xl mb-4">✍️</p>
              <p className="text-stone-400 text-lg">Le contenu de cet article arrive bientôt.</p>
            </div>
          )}

          <div className="mt-12">
            <NewsletterForm variant="article" />
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-stone-100">
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

          <div className="mt-10 pt-8 border-t border-stone-100 flex justify-between items-center">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-semibold text-sm transition-colors"
            >
              ← Tous les articles
            </Link>
            <Link
              href="/destinations"
              className="inline-flex items-center gap-2 text-stone-500 hover:text-amber-700 text-sm transition-colors"
            >
              Explorer les destinations →
            </Link>
          </div>
        </div>

        {/* ── ARTICLES SIMILAIRES ────────────────────────── */}
        {related.length > 0 && (
          <section className="bg-stone-50 py-16">
            <div className="max-w-6xl mx-auto px-4">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-700 mb-2">✦ À lire aussi</p>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-8">Dans la même catégorie</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {related.map((p) => {
                  const img = getHeroImage(p);
                  return (
                    <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
                      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300">
                        {img ? (
                          <img
                            src={img}
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
                            {formatDate(p.published_at)}{p.read_time ? ` · ${p.read_time} min` : ''}
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        <NewsletterForm variant="blog" />
      </main>
      <Footer />
    </>
  );
}
