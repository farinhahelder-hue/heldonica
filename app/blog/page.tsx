import { blogPosts } from "@/lib/wordpress-data";
import Link from "next/link";
import Header from "@/components/Header";
import Breadcrumb from "@/components/Breadcrumb";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Blog | Heldonica — Slow Travel & Lifestyle",
  description: "Carnets de voyage slow travel, recettes du monde et expertise hôtelière par Heldonica.",
};

export default function BlogPage() {
  const travel = blogPosts.filter((p) => p.category === "Travel");
  const food = blogPosts.filter((p) => p.category === "Food & Lifestyle");
  const expertise = blogPosts.filter((p) => p.category === "Expertise Hôtelière");

  return (
    <>
      <Header />
      <Breadcrumb />
      <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-stone-900 to-amber-900 py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600')", backgroundSize: "cover", backgroundPosition: "center" }}
        />
        <div className="relative max-w-4xl mx-auto text-center text-white">
          <p className="text-amber-300 text-sm font-semibold tracking-widest uppercase mb-3">Heldonica</p>
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            Le Blog
          </h1>
          <p className="text-xl text-white/80 max-w-2xl mx-auto leading-relaxed">
            Carnets de voyage, recettes du monde et expertise hôtelière —{" "}
            <em>pour voyager autrement, en couple et en conscience.</em>
          </p>
          <div className="flex justify-center gap-6 mt-8 text-sm text-white/60">
            <span>✈️ {travel.length} voyages</span>
            <span>🍽️ {food.length} recettes</span>
            <span>🏨 {expertise.length} expertises</span>
          </div>
        </div>
      </section>

      {/* Section Travel */}
      {travel.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <SectionHeader emoji="✈️" title="Carnets de Voyage" count={travel.length} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {travel.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}

      {/* Séparateur */}
      {food.length > 0 && (
        <section className="bg-amber-50 py-16">
          <div className="max-w-7xl mx-auto px-4">
            <SectionHeader emoji="🍽️" title="Food & Lifestyle" count={food.length} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {food.map((post) => (
                <ArticleCard key={post.slug} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Section Expertise */}
      {expertise.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <SectionHeader emoji="🏨" title="Expertise Hôtelière" count={expertise.length} />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {expertise.map((post) => (
              <ArticleCard key={post.slug} post={post} />
            ))}
          </div>
        </section>
      )}
    </main>
      <Footer />
    </>
  );
}

function SectionHeader({ emoji, title, count }: { emoji: string; title: string; count: number }) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
      <span className="text-3xl">{emoji}</span>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <span className="ml-2 bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
        {count} article{count > 1 ? "s" : ""}
      </span>
    </div>
  );
}

function ArticleCard({ post }: { post: (typeof blogPosts)[0] }) {
  const categoryEmoji =
    post.category === "Travel" ? "✈️" :
    post.category === "Food & Lifestyle" ? "🍽️" : "🏨";

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-gray-100">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-amber-100 to-orange-100">
          {post.image ? (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl opacity-40">
              {categoryEmoji}
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span className="bg-amber-500/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {post.category}
            </span>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 flex-1 mb-3">
              {post.excerpt}
            </p>
          )}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.categories.slice(0, 3).map((cat) => (
                <span key={cat} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  {cat}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            <span className="text-xs text-gray-400">{post.date}</span>
            <span className="text-xs text-amber-600 font-semibold group-hover:translate-x-1 transition-transform inline-block">
              {post.readTime} min →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

// Ajouter le Footer à la fin de BlogPage
// Modification du return pour fermer correctement
// Note: Le Footer doit être ajouté dans le return de BlogPage
