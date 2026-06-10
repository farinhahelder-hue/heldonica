import Image from 'next/image'
import Link from 'next/link'
import { blogPosts } from '@/lib/wordpress-data'

const CATEGORY_COLOR: Record<string, string> = {
  Travel: 'bg-eucalyptus/10 text-eucalyptus',
  'Food & Lifestyle': 'bg-eucalyptus/10 text-eucalyptus',
  'Expertise Hoteliere': 'bg-mahogany/10 text-mahogany',
  'Expertise Hôtelière': 'bg-mahogany/10 text-mahogany',
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
        <h2 className="text-3xl md:text-5xl font-serif font-bold text-mahogany mb-3 text-center">
          Nos Carnets de Route
        </h2>
        <p className="text-center text-gray-600 mb-8 md:mb-16 text-sm md:text-base">
          Histoires authentiques et conseils d&apos;experts
        </p>
        
        {/* Grille responsive - 1 colonne mobile, 2 tablette, 3 desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 md:mb-12">
          {articles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-stone-100 hover:shadow-lg hover:border-stone-200 transition-all duration-300 group overflow-hidden hover:-translate-y-1"
            >
              {/* Image responsive */}
              <Link href={`/blog/${article.slug}`} className="block">
                <div className="relative h-44 sm:h-48 w-full overflow-hidden">
                  {article.image ? (
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex flex-col items-center justify-center gap-2 ${
                        PLACEHOLDER_BG[article.category] ?? 'bg-gradient-to-br from-[#006D77] to-[#4ECDC4]'
                      }`}
                    >
                      <Image
                        src="/images/badges-heldonica.svg"
                        alt="Fallback visuel Heldonica"
                        width={80}
                        height={50}
                        className="w-16 sm:w-20 h-auto opacity-90"
                        loading="lazy"
                      />
                      <span className="text-xs text-white/90 font-semibold tracking-[0.14em] uppercase">
                        Heldonica
                      </span>
                    </div>
                  )}
                  <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3">
                    <span
                      className={`inline-block px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold ${
                        CATEGORY_COLOR[article.category] ?? 'bg-white/90 text-charcoal/70'
                      }`}
                    >
                      {article.category}
                    </span>
                  </div>
                </div>
              </Link>
              
              {/* Contenu */}
              <div className="p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-serif font-bold text-mahogany mb-2 group-hover:text-eucalyptus transition-colors leading-snug line-clamp-2">
                  <Link href={`/blog/${article.slug}`} className="hover:text-eucalyptus transition-colors">
                    {article.title}
                  </Link>
                </h3>
                <p className="text-charcoal/60 mb-3 sm:mb-4 text-xs sm:text-sm leading-relaxed line-clamp-2 sm:line-clamp-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                  <span className="text-[10px] sm:text-xs text-charcoal/40">{article.date}</span>
                  <Link
                    href={`/blog/${article.slug}`}
                    className="text-eucalyptus font-semibold hover:text-teal transition text-xs sm:text-sm group-hover:translate-x-1 inline-block"
                  >
                    Lire →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        {/* CTA centré */}
        <div className="text-center">
          <Link
            href="/blog"
            className="inline-block px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-eucalyptus text-eucalyptus rounded-full hover:bg-eucalyptus/5 transition font-medium text-sm sm:text-base"
          >
            Voir tous les carnets →
          </Link>
        </div>
      </div>
    </section>
  )
}
