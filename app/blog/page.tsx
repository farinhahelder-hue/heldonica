"use client";

import { blogPosts } from "@/lib/wordpress-data";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useState, useMemo } from "react";

export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState<string>("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = ["Tous", "Travel", "Food & Lifestyle", "Expertise Hôtelière"];

  const categoryLabel: Record<string, string> = {
    "Tous": "Tous",
    "Travel": "✈️ Voyages",
    "Food & Lifestyle": "🍽️ Food & Lifestyle",
    "Expertise Hôtelière": "🏨 Expertise",
  };

  const destinations = [
    "Paris", "Île-de-France", "Normandie", "Le Havre",
    "Madère", "Timișoara", "Malte", "Sicile",
    "Sardaigne", "Tanzanie", "Colombie", "Afrique du Sud"
  ];

  const filteredPosts = useMemo(() => {
    return blogPosts.filter((p) => {
      const matchCat = activeFilter === "Tous" || p.category === activeFilter;
      const matchSearch =
        searchQuery === "" ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.excerpt || "").toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeFilter, searchQuery]);

  const featuredPost = blogPosts[0];
  const travel = filteredPosts.filter((p) => p.category === "Travel");
  const food = filteredPosts.filter((p) => p.category === "Food & Lifestyle");
  const expertise = filteredPosts.filter((p) => p.category === "Expertise Hôtelière");

  const totalTravel = blogPosts.filter((p) => p.category === "Travel").length;
  const totalFood = blogPosts.filter((p) => p.category === "Food & Lifestyle").length;
  const totalExpertise = blogPosts.filter((p) => p.category === "Expertise Hôtelière").length;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7f6f2]">

        {/* ── HERO ─────────────────────────────────────────── */}
        <section className="relative bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 py-24 px-4 overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1600')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative max-w-4xl mx-auto text-center text-white">
            <p className="text-amber-300 text-xs font-semibold tracking-[0.25em] uppercase mb-4">Heldonica · Blog</p>
            <h1 className="text-5xl md:text-7xl font-serif font-light mb-6 leading-tight">
              Le Blog
            </h1>
            <p className="text-lg text-white/75 max-w-2xl mx-auto leading-relaxed mb-10">
              Carnets de voyage, pépites dénichées, recettes du monde et expertise hôtelière —{" "}
              <em className="text-white/90">pour voyager autrement, en couple et en conscience.</em>
            </p>
            {/* Compteurs */}
            <div className="flex justify-center gap-8 text-sm text-white/60">
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-light text-white">{totalTravel}</span>
                <span>Carnets de voyage</span>
              </div>
              <div className="w-px bg-white/20" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-light text-white">{totalFood}</span>
                <span>Food & Lifestyle</span>
              </div>
              <div className="w-px bg-white/20" />
              <div className="flex flex-col items-center gap-1">
                <span className="text-2xl font-light text-white">{totalExpertise}</span>
                <span>Expertises</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── BANDEAU DESTINATIONS ─────────────────────────── */}
        <section className="bg-amber-900 overflow-hidden">
          <div className="flex items-center gap-0 py-3 overflow-x-auto no-scrollbar px-4 md:justify-center md:flex-wrap">
            {destinations.map((dest) => (
              <button
                key={dest}
                onClick={() => setSearchQuery(dest)}
                className="shrink-0 text-xs font-medium text-amber-100/80 hover:text-white px-3 py-1 whitespace-nowrap transition-colors hover:bg-white/10 rounded-full"
              >
                {dest}
              </button>
            ))}
          </div>
        </section>

        {/* ── ARTICLE À LA UNE ─────────────────────────────── */}
        {featuredPost && activeFilter === "Tous" && searchQuery === "" && (
          <section className="max-w-7xl mx-auto px-4 pt-14 pb-4">
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-700 mb-5">✦ À la une</p>
            <Link href={`/blog/${featuredPost.slug}`} className="group block">
              <article className="relative rounded-3xl overflow-hidden bg-stone-900 shadow-xl h-[420px] md:h-[500px] flex items-end">
                {featuredPost.image ? (
                  <img
                    src={featuredPost.image}
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-700"
                    loading="lazy"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-900 to-stone-900" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="relative z-10 p-8 md:p-12 max-w-2xl">
                  <span className="inline-block bg-amber-500 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4">
                    {featuredPost.category}
                  </span>
                  <h2 className="text-2xl md:text-4xl font-serif font-light text-white leading-snug mb-3 group-hover:text-amber-200 transition-colors">
                    {featuredPost.title}
                  </h2>
                  {featuredPost.excerpt && (
                    <p className="text-white/70 text-sm md:text-base leading-relaxed line-clamp-2 mb-4">
                      {featuredPost.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span>{featuredPost.date}</span>
                    <span>·</span>
                    <span>{featuredPost.readTime} min de lecture</span>
                    <span className="ml-2 text-amber-400 font-semibold group-hover:translate-x-1 transition-transform inline-block">Lire →</span>
                  </div>
                </div>
              </article>
            </Link>
          </section>
        )}

        {/* ── BARRE DE RECHERCHE & FILTRES ─────────────────── */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            {/* Filtres catégories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    activeFilter === cat
                      ? "bg-amber-900 text-white shadow-md"
                      : "bg-white text-stone-600 hover:bg-amber-50 hover:text-amber-900 border border-stone-200"
                  }`}
                >
                  {categoryLabel[cat]}
                </button>
              ))}
            </div>
            {/* Recherche */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                placeholder="Rechercher un article…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-full border border-stone-200 bg-white text-sm text-stone-700 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 shadow-sm"
              />
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600">
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Résultat de recherche */}
          {searchQuery && (
            <p className="mt-4 text-sm text-stone-500">
              {filteredPosts.length} article{filteredPosts.length > 1 ? "s" : ""} pour &ldquo;{searchQuery}&rdquo;
              {" "}<button onClick={() => setSearchQuery("")} className="underline text-amber-700 hover:text-amber-900">Effacer</button>
            </p>
          )}
        </section>

        {/* ── GRILLE ARTICLES ──────────────────────────────── */}
        {filteredPosts.length === 0 ? (
          <div className="max-w-7xl mx-auto px-4 pb-20 text-center">
            <div className="py-20">
              <p className="text-5xl mb-4">🗺️</p>
              <p className="text-stone-500 text-lg">Aucun article ne correspond à ta recherche.</p>
              <button onClick={() => { setSearchQuery(""); setActiveFilter("Tous"); }} className="mt-4 text-sm underline text-amber-700">Voir tous les articles</button>
            </div>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto px-4 pb-20 space-y-16">

            {/* Carnets de voyage */}
            {(activeFilter === "Tous" || activeFilter === "Travel") && travel.length > 0 && (
              <section>
                <SectionHeader emoji="✈️" title="Carnets de Voyage" count={travel.length} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {travel.map((post) => <ArticleCard key={post.slug} post={post} />)}
                </div>
              </section>
            )}

            {/* Food & Lifestyle */}
            {(activeFilter === "Tous" || activeFilter === "Food & Lifestyle") && food.length > 0 && (
              <section className="-mx-4 px-4 py-12 bg-amber-50 rounded-3xl">
                <SectionHeader emoji="🍽️" title="Food & Lifestyle" count={food.length} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {food.map((post) => <ArticleCard key={post.slug} post={post} />)}
                </div>
              </section>
            )}

            {/* Expertise Hôtelière */}
            {(activeFilter === "Tous" || activeFilter === "Expertise Hôtelière") && expertise.length > 0 && (
              <section>
                <SectionHeader emoji="🏨" title="Expertise Hôtelière" count={expertise.length} />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                  {expertise.map((post) => <ArticleCard key={post.slug} post={post} />)}
                </div>
              </section>
            )}

          </div>
        )}

        {/* ── NEWSLETTER ───────────────────────────────────── */}
        <section className="bg-gradient-to-br from-stone-900 to-amber-900 py-20 px-4">
          <div className="max-w-2xl mx-auto text-center text-white">
            <p className="text-amber-300 text-xs font-semibold tracking-[0.2em] uppercase mb-4">✦ Rejoins l'aventure</p>
            <h2 className="text-3xl md:text-4xl font-serif font-light mb-4 leading-snug">
              Les pépites dénichées,<br />directement dans ta boîte mail
            </h2>
            <p className="text-white/65 text-sm leading-relaxed mb-8 max-w-md mx-auto">
              Nos meilleures adresses, carnets de voyage inédits et coulisses d'Heldonica — une fois par mois, sans spam.
            </p>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
            >
              <input
                type="email"
                placeholder="ton@email.com"
                className="flex-1 px-5 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-white font-semibold rounded-full text-sm transition-colors shrink-0"
              >
                Je m'inscris →
              </button>
            </form>
            <p className="mt-4 text-white/30 text-xs">Désinscription en 1 clic · Zéro spam</p>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}

function SectionHeader({ emoji, title, count }: { emoji: string; title: string; count: number }) {
  return (
    <div className="flex items-center gap-3 border-b border-stone-200 pb-4">
      <span className="text-2xl">{emoji}</span>
      <h2 className="text-xl font-semibold text-stone-900">{title}</h2>
      <span className="ml-2 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full">
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
      <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col border border-stone-100 hover:-translate-y-1">
        {/* Image */}
        <div className="relative h-52 overflow-hidden bg-gradient-to-br from-amber-50 to-stone-100">
          {post.image ? (
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl opacity-30">
              {categoryEmoji}
            </div>
          )}
          {/* Badge catégorie */}
          <div className="absolute top-3 left-3">
            <span className="bg-amber-600/90 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {post.category}
            </span>
          </div>
          {/* Temps de lecture */}
          <div className="absolute bottom-3 right-3">
            <span className="bg-black/40 backdrop-blur-sm text-white/90 text-xs px-2.5 py-1 rounded-full">
              {post.readTime} min
            </span>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-5 flex flex-col flex-1">
          <h3 className="font-semibold text-stone-900 text-base leading-snug mb-2 group-hover:text-amber-700 transition-colors line-clamp-2">
            {post.title}
          </h3>
          {post.excerpt && (
            <p className="text-stone-500 text-sm leading-relaxed line-clamp-3 flex-1 mb-3">
              {post.excerpt}
            </p>
          )}
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.categories.slice(0, 3).map((cat) => (
                <span key={cat} className="text-xs bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">
                  {cat}
                </span>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-auto">
            <span className="text-xs text-stone-400">{post.date}</span>
            <span className="text-xs text-amber-700 font-semibold group-hover:translate-x-1 transition-transform inline-block">
              Lire l&apos;article →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
