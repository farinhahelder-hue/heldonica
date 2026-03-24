import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function Blog() {
  const articles = [
    { id: 1, title: '5 destinations slow travel', excerpt: 'Découvrez nos meilleures adresses.', date: '24 Mar 2026', category: 'Travel' },
    { id: 2, title: 'Optimiser son RevPAR', excerpt: 'Stratégies pour augmenter vos revenus.', date: '20 Mar 2026', category: 'Consulting' },
    { id: 3, title: 'Le slow travel', excerpt: 'Comment voyager lentement change votre perspective.', date: '15 Mar 2026', category: 'Travel' },
    { id: 4, title: 'SEO local pour hôtels', excerpt: 'Dominer les résultats locaux.', date: '10 Mar 2026', category: 'Consulting' },
    { id: 5, title: 'Hospitalité authentique', excerpt: 'Créer une expérience mémorable.', date: '5 Mar 2026', category: 'Consulting' },
    { id: 6, title: 'Voyage responsable', excerpt: 'Guide complet du slow travel éco.', date: '1 Mar 2026', category: 'Travel' },
  ]

  return (
    <>
      <Header />
      <main>
        <section className="bg-gradient-to-br from-cloud-dancer to-white py-20 md:py-32">
          <div className="container">
            <h1 className="text-5xl md:text-6xl font-serif font-bold text-mahogany mb-6">Blog Heldonica</h1>
            <p className="text-xl text-charcoal">
              Histoires, conseils et expertise en slow travel et consulting hôtelier.
            </p>
          </div>
        </section>

        <section className="bg-white section-spacing">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <article key={article.id} className="bg-cloud-dancer p-8 rounded-lg border border-gray-200 hover:shadow-lg transition">
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
                  <p className="text-gray-700 mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{article.date}</span>
                    <Link href={`/blog/${article.id}`} className="text-eucalyptus font-semibold hover:text-teal transition">
                      Lire →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
