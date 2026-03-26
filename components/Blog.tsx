import Link from 'next/link'
import Image from 'next/image'
import { blogPosts } from '@/lib/wordpress-data'

export default function Blog() {
  // Afficher les 3 articles les plus récents
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
            <article key={article.id} className="bg-cloud-dancer rounded-lg border border-gray-200 hover:shadow-lg transition group overflow-hidden">
              {/* Image de couverture */}
              {article.featuredImage ? (
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={article.featuredImage}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-48 bg-gradient-to-br from-eucalyptus/10 to-teal/10 flex items-center justify-center">
                  <span className="text-4xl">
                    {article.category === 'Travel' ? '✈️' : article.category === 'Food & Lifestyle' ? '🍽️' : '🏨'}
                  </span>
                </div>
              )}
              <div className="p-6">
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                    article.category === 'Travel'
                      ? 'bg-eucalyptus/10 text-eucalyptus'
                      : article.category === 'Food & Lifestyle'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-teal/10 text-teal'
                  }`}>
                    {article.category}
                  </span>
                </div>
                <h3 className="text-xl font-serif font-bold text-mahogany mb-3 group-hover:text-eucalyptus transition leading-tight">
                  {article.title}
                </h3>
                <p className="text-gray-700 mb-4 text-sm line-clamp-3">{article.excerpt}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{article.date}</span>
                  <Link href={`/blog/${article.slug}`} className="text-eucalyptus font-semibold hover:text-teal transition text-sm">
                    Lire →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="text-center">
          <Link href="/blog" className="inline-block px-8 py-3 border-2 border-eucalyptus text-eucalyptus rounded-lg hover:bg-eucalyptus/5 transition">
            Voir tous les articles
          </Link>
        </div>
      </div>
    </section>
  )
}
