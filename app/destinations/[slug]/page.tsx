import {
  getDestinationBySlug,
  getAllDestinationSlugs,
  blogPosts,
} from "@/lib/wordpress-data";
import { notFound } from "next/navigation";
import Link from "next/link";
import EnhancedRichContent from "@/components/EnhancedRichContent";
import { sanitizeHtml } from "@/lib/sanitize-html";

interface Props {
  params: { slug: string };
}

// Métadonnées enrichies par destination
const DEST_META: Record<string, { description: string; heroImage: string; region: string; emoji: string }> = {
  // ── Zurich ──────────────────────────────────────────────────
  zurich: {
    description: "Badi flottantes, brasseries artisanales et vieille ville médiévale. Zurich, la ville suisse que l'on croyait réservée aux banquiers — et qui nous a conquis.",
    heroImage: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1600&q=80",
    region: "Suisse",
    emoji: "🇨🇭",
  },
  // ── Suisse ──────────────────────────────────────────────────
  suisse: {
    description: "Randonnées alpines, lacs cristallins, Badi zurichoises et villages médiévaux. La Suisse en slow travel — sans les clichés.",
    heroImage: "https://images.unsplash.com/photo-1539067825854-0e2de6c5651e?w=1600&q=80",
    region: "Europe",
    emoji: "🇨🇭",
  },
  "suisse-heldonica": {
    description: "Randonnées alpines, lacs cristallins et villes cosmopolites. La Suisse en slow travel.",
    heroImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600",
    region: "Europe",
    emoji: "🇨🇭",
  },
  // ── Roumanie ────────────────────────────────────────────────
  roumanie: {
    description: "Timișoara, le Delta du Danube et les Carpates. La Roumanie authentique, loin des sentiers battus — notre coup de foudre slow travel.",
    heroImage: "https://images.unsplash.com/photo-1605486567306-2a5eb9a65494?w=1600&q=80",
    region: "Europe",
    emoji: "🇷🇴",
  },
  "roumanie-heldonica-slow": {
    description: "Timișoara, le Delta du Danube et les Carpates. La Roumanie authentique loin des sentiers battus.",
    heroImage: "https://images.unsplash.com/photo-1605486567306-2a5eb9a65494?w=1600&q=80",
    region: "Europe",
    emoji: "🇷🇴",
  },
  // ── Madère ──────────────────────────────────────────────────
  madere: {
    description: "La forêt de Fanal, les levadas et le Prego no bolo do caco. L'île de l'éternel printemps vue par Heldonica.",
    heroImage: "https://images.unsplash.com/photo-1596727147705-54a9d7509283e?w=1600&q=80",
    region: "Portugal",
    emoji: "🇵🇹",
  },
  "madere-heldonica": {
    description: "L'île de l'éternel printemps. Levadas, falaises spectaculaires et gastronomie portugaise.",
    heroImage: "https://images.unsplash.com/photo-1596727147705-54a9d7509283e?w=1600&q=80",
    region: "Portugal",
    emoji: "🇵🇹",
  },
  // ── Paris ───────────────────────────────────────────────────
  paris: {
    description: "La Petite Ceinture, la rue Mouffetard et le Canal de l'Ourcq. Paris en slow travel — loin des clichés, proche de l'âme.",
    heroImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80",
    region: "France",
    emoji: "🇫🇷",
  },
  "ile-de-france-heldonica": {
    description: "Paris et ses environs en slow travel : Canal de l'Ourcq, Petite Ceinture, Fontainebleau.",
    heroImage: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1600&q=80",
    region: "France",
    emoji: "🇫🇷",
  },
  "normandie-heldonica": {
    description: "Étretat, Honfleur, Deauville... La Normandie côtière en slow travel.",
    heroImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600",
    region: "France",
    emoji: "🇫🇷",
  },
  "bretagne-heldonica-slow": {
    description: "Randonnées côtières, crêperies et Saint-Malo. La Bretagne authentique.",
    heroImage: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=1600",
    region: "France",
    emoji: "🇫🇷",
  },
};

export async function generateStaticParams() {
  return getAllDestinationSlugs();
}

export async function generateMetadata({ params }: Props) {
  const page = getDestinationBySlug(params.slug);
  const meta = DEST_META[params.slug];
  const title = page?.title || params.slug;
  return {
    title: `${title} en Slow Travel | Heldonica`,
    description: meta?.description || `Découvrez ${title} en slow travel avec Heldonica — carnets de voyage terrain, pépites dénichées et conseils pratiques.`,
    openGraph: {
      images: meta?.heroImage ? [{ url: meta.heroImage }] : [],
    },
  };
}

export default function DestinationPage({ params }: Props) {
  const page = getDestinationBySlug(params.slug);
  if (!page) notFound();

  const meta = DEST_META[params.slug];
  const heroImage = page.image || meta?.heroImage || "";
  const description = meta?.description || "";
  const safeContent = sanitizeHtml(page.content);

  // Articles liés à cette destination
  const titleWords = page.title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const related = blogPosts
    .filter((p) => {
      const text = (p.title + " " + p.categories.join(" ") + " " + p.tags.join(" ")).toLowerCase();
      return titleWords.some((w) => text.includes(w));
    })
    .slice(0, 6);

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative h-[55vh] md:h-[70vh] w-full overflow-hidden bg-stone-800">
        {heroImage && (
          <img
            src={heroImage}
            alt={page.title}
            className="w-full h-full object-cover opacity-75"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12">
          <div className="max-w-5xl mx-auto">
            <Link
              href="/destinations"
              className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-sm mb-4 transition-colors"
            >
              ← Destinations
            </Link>
            {meta?.region && (
              <span className="block text-amber-300 text-xs font-semibold tracking-widest uppercase mb-2">
                {meta.emoji && <span className="mr-1">{meta.emoji}</span>}{meta.region}
              </span>
            )}
            <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight">
              {page.title}
            </h1>
            {description && (
              <p className="text-lg text-white/75 mt-3 max-w-2xl leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contenu */}
      {safeContent && (
        <section className="max-w-4xl mx-auto px-4 py-14">
          <EnhancedRichContent
            html={safeContent}
            className="prose prose-lg max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-xl prose-img:shadow-lg prose-img:mx-auto
              prose-ul:text-gray-700 prose-ol:text-gray-700
              prose-li:marker:text-amber-500"
          />
        </section>
      )}

      {/* Articles liés */}
      {related.length > 0 && (
        <section className="bg-amber-50 py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Nos articles sur {page.title}
            </h2>
            <p className="text-gray-500 mb-8 text-sm">Tous vécus sur le terrain — notre vécu, pas ChatGPT.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        width={400}
                        height={176}
                      />
                    ) : (
                      <div className="w-full h-44 bg-amber-50 flex items-center justify-center text-4xl opacity-30">
                        ✈️
                      </div>
                    )}
                    <div className="p-4">
                      <span className="text-xs text-amber-600 font-semibold">{post.category}</span>
                      <h3 className="font-semibold text-gray-900 mt-1 line-clamp-2 group-hover:text-amber-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-2">{post.date} · {post.readTime} min</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Travel Planning */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-amber-600 text-sm font-semibold tracking-widest uppercase mb-3">On planifie ensemble ?</p>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Ton voyage slow travel sur mesure
          </h2>
          <p className="text-gray-500 mb-6">
            On conçoit ton itinéraire de A à Z — basé sur nos expériences terrain, tes envies et ton rythme. Pas de template, pas de copier-coller.
          </p>
          <Link
            href="/travel-planning"
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Découvrir le Travel Planning →
          </Link>
        </div>
      </section>
    </main>
  );
}
