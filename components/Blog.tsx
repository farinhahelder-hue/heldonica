import Link from 'next/link'
import { blogPosts } from '@/lib/wordpress-data'

const CATEGORY_COLOR: Record<string, string> = {
  Travel: 'bg-emerald-100 text-emerald-800',
  'Food & Lifestyle': 'bg-amber-100 text-amber-800',
  'Expertise Hoteliere': 'bg-sky-100 text-sky-800',
  'Expertise Hôtelière': 'bg-sky-100 text-sky-800',
}

const PLACEHOLDER_BG: Record<string, string> = {
  Travel: 'bg-gradient-to-br from-[#006D77] to-[#4ECDC4]',
  'Food & Lifestyle': 'bg-gradient-to-br from-[#4ECDC4] to-[#006D77]',
  'Expertise Hoteliere': 'bg-gradient-to-br from-[#006D77] to-[#6B2D1F]',
  'Expertise Hôtelière': 'bg-gradient-to-br from-[#006D77] to-[#6B2D1F]',
}

export default function Blog() {
  const articles = blogPosts.slice(0, 3)

  return (
    <section className="bg-white section-spacing">
      <div className="container">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-mahogany mb-4 text-center">
          Nos Carnets de Route
        </h2>
        <p className="text-center text-gray-600 mb-16 text-lg">
          Histoires authentiques et conseils d&apos;experts
        </p>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-cloud-dancer rounded-2xl border border-stone-200 hover:shadow-lg transition-all duration-300 group overflow-hidden hover:-translate-y-1"
            >
              <div className="relative h-48 w-full overflow-hidden">
                {article.image ? (
                  <img
                    src={article.image}
                    alt={article.title}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`w-full h-full flex flex-col items-center justify-center gap-2 ${
                      PLACEHOLDER_BG[article.category] ?? 'bg-gradient-to-br from-[#006D77] to-[#4ECDC4]'
                    }`}
                  >
                    <img
                      src="/images/badges-heldonica.svg"
                      alt="Fallback visuel Heldonica"
                      width={220}
                      height={140}
                      className="w-32 h-auto"
                      loading="lazy"
                    />
                    <span className="text-xs text-white/90 font-semibold tracking-[0.14em] uppercase">
                      Pepite verifiee
                    </span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                      CATEGORY_COLOR[article.category] ?? 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {article.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-serif font-bold text-mahogany mb-2 group-hover:text-eucalyptus transition-colors leading-snug line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-stone-500 mb-4 text-sm leading-relaxed line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <span className="text-xs text-stone-400">{article.date}</span>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="text-eucalyptus font-semibold hover:text-teal transition text-sm group-hover:translate-x-1 inline-block"
                  >
                    Lire l&apos;article -&gt;
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/blog"
            className="inline-block px-8 py-3 border-2 border-eucalyptus text-eucalyptus rounded-full hover:bg-eucalyptus/5 transition font-medium"
          >
            Voir tous les carnets -&gt;
          </Link>
        </div>
      </div>
    </section>
  )
}
