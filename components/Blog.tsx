import Link from 'next/link'

export default function Blog() {
  const articles = [
    {
      id: 1,
      title: '5 destinations slow travel pour couples',
      excerpt: 'Découvrez nos meilleures adresses pour des voyages authentiques et écoresponsables.',
      date: '24 Mar 2026',
      category: 'Travel',
    },
    {
      id: 2,
      title: 'Optimiser son RevPAR en 2026',
      excerpt: 'Stratégies éprouvées pour augmenter vos revenus hôteliers sans surcharger vos clients.',
      date: '20 Mar 2026',
      category: 'Consulting',
    },
    {
      id: 3,
      title: 'Le slow travel, c\'est quoi vraiment ?',
      excerpt: 'Au-delà du concept : comment voyager lentement change votre perspective.',
      date: '15 Mar 2026',
      category: 'Travel',
    },
  ]

  return (
    <section className="bg-white section-spacing">
      <div className="container">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-mahogany mb-4 text-center">
          Nos Carnets de Route
        </h2>
        <p className="text-center text-gray-600 mb-16 text-lg">
          Histoires authentiques et conseils d'experts
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {articles.map((article) => (
            <article key={article.id} className="bg-cloud-dancer p-6 rounded-lg border border-gray-200 hover:shadow-lg transition">
              <div className="mb-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  article.category === 'Travel' 
                    ? 'bg-eucalyptus/10 text-eucalyptus' 
                    : 'bg-teal/10 text-teal'
                }`}>
                  {article.category}
                </span>
              </div>
              <h3 className="text-xl font-serif font-bold text-mahogany mb-3">{article.title}</h3>
              <p className="text-gray-700 mb-4 text-sm">{article.excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{article.date}</span>
                <Link href={`/blog/${article.id}`} className="text-eucalyptus font-semibold hover:text-teal transition">
                  Lire →
                </Link>
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
