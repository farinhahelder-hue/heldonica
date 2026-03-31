import { getPostBySlug, getAllBlogSlugs, getRelatedPosts } from "@/lib/wordpress-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import NewsletterForm from "@/components/NewsletterForm";

interface Props {
  params: { slug: string };
}

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Article introuvable | Heldonica" };
  return {
    title: `${post.title} | Heldonica`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.image ? [{ url: post.image }] : [],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug, post.category, 3);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-[55vh] md:h-[65vh] w-full overflow-hidden bg-stone-900">
        {post.image && (
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-4 transition-colors"
            >
              ← Blog
            </Link>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                {post.category}
              </span>
              {post.categories.slice(0, 2).map((c) => (
                <span key={c} className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                  {c}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-3">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-white/70 text-sm">
              <span>{post.date}</span>
              <span>•</span>
              <span>{post.readTime} min de lecture</span>
            </div>
          </div>
        </div>
      </div>

      {/* Article */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {post.excerpt && (
          <p className="text-xl text-gray-600 leading-relaxed mb-10 font-light italic border-l-4 border-amber-400 pl-5 py-2">
            {post.excerpt}
          </p>
        )}

        <div
          className="prose prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-gray-900
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-xl prose-img:shadow-lg prose-img:mx-auto
            prose-strong:text-gray-900
            prose-ul:text-gray-700 prose-ol:text-gray-700
            prose-blockquote:border-amber-400 prose-blockquote:text-gray-600"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Newsletter inline dans l'article */}
        <NewsletterForm variant="article" />

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 pt-8 border-t border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">Tags</p>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-100 hover:bg-amber-100 text-gray-600 text-xs px-3 py-1.5 rounded-full transition-colors cursor-default"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Navigation retour */}
        <div className="mt-10 pt-8 border-t border-gray-100 flex justify-between items-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold text-sm transition-colors"
          >
            ← Retour au blog
          </Link>
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-gray-500 hover:text-amber-600 text-sm transition-colors"
          >
            Destinations →
          </Link>
        </div>
      </div>

      {/* Articles similaires */}
      {related.length > 0 && (
        <section className="bg-stone-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Dans la même catégorie
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {p.image ? (
                      <img
                        src={p.image}
                        alt={p.title}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-44 bg-amber-50 flex items-center justify-center text-4xl opacity-40">
                        ✈️
                      </div>
                    )}
                    <div className="p-4">
                      <span className="text-xs text-amber-600 font-semibold">{p.category}</span>
                      <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-amber-600 transition-colors">
                        {p.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-2">{p.date} · {p.readTime} min</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter bas de page */}
      <NewsletterForm variant="blog" />
    </main>
  );
}
