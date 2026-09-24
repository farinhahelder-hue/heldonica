import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';
import { validateGardeFous } from '@/lib/brand-voice';
import { extraireRevendications, porteLesConsignesDuPrompt } from '@/lib/revendications';

export const dynamic = 'force-dynamic';

// La file « À publier » de l'accueil du panneau.
//
// Le 17/09, 26 brouillons dormaient : 9 étaient du bruit (tests de l'APK,
// coquilles vides), 9 étaient finis et n'attendaient que la décision de
// l'auteur, et le compteur « Relire 26 brouillons » ne distinguait rien.
// Ici chaque brouillon est mesuré avec le même contrôle que le Copilote
// (validateGardeFous) et la file est triée : le plus prêt en premier.
// La route ne publie rien — elle dit ce qui est prêt, et pourquoi pas.

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

type Ligne = {
  id: number;
  title: string | null;
  slug: string | null;
  category: string | null;
  content: string | null;
  featured_image: string | null;
  meta_description: string | null;
  updated_at: string | null;
};

// Deux titres qui commencent par les mêmes mots pleins (« Stoos Ridge : … »)
// désignent presque toujours le même sujet ; on le signale, l'auteur tranche.
// Les mots vides sont ignorés : « Bacalhau à Lagareiro » et « Bacalhau à Gomes
// de Sá » ne sont pas le même article.
const MOTS_VIDES = new Set(['a', 'au', 'aux', 'de', 'des', 'du', 'la', 'le', 'les', 'l', 'd', 'en', 'et', 'sur', 'un', 'une', 'notre', 'nos', 'pour', 'dans', 'ou', 'the', 'of']);

function racine(titre: string | null): string {
  return (titre || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((m) => m && !MOTS_VIDES.has(m))
    .slice(0, 2)
    .join(' ');
}

export async function GET(req: Request) {
  const refus = await requireCmsAuth(req);
  if (refus) return refus;

  const sb = supabase();
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });

  const [{ data: brouillons, error: e1 }, { data: publies, error: e2 }] = await Promise.all([
    sb
      .from('cms_blog_posts')
      .select('id, title, slug, category, content, featured_image, meta_description, updated_at')
      .eq('published', false)
      .order('updated_at', { ascending: false }),
    sb.from('cms_blog_posts').select('title').eq('published', true),
  ]);
  if (e1) return NextResponse.json({ error: `Lecture des brouillons : ${e1.message}` }, { status: 500 });
  if (e2) return NextResponse.json({ error: `Lecture des publiés : ${e2.message}` }, { status: 500 });

  const racinesPubliees = new Map<string, string>();
  for (const p of (publies ?? []) as { title: string | null }[]) {
    const r = racine(p.title);
    if (r && !racinesPubliees.has(r)) racinesPubliees.set(r, p.title || '');
  }

  const file = ((brouillons ?? []) as Ligne[]).map((b) => {
    const texte = b.content || '';
    const v = validateGardeFous(texte, 'b2c');
    const mots = texte.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
    const aToi = (texte.match(/\[(À|A) TOI/g) || []).length;
    const manques = Object.entries(v.checks)
      .filter(([, c]) => !c.ok)
      .map(([id, c]) => ({ id, message: c.message }));
    // Les titres sont encore les consignes du prompt : texte du générateur
    // jamais relu. La voix peut être à 100 %, le vécu n'y est pas.
    const entetesPrompt = porteLesConsignesDuPrompt(texte);
    if (entetesPrompt) {
      manques.unshift({
        id: 'generateur',
        message: 'Sorti du générateur, jamais relu : les titres sont encore les consignes du prompt. À réécrire avec ton vécu, pas à publier.',
      });
    }
    const aConfirmer = extraireRevendications(texte, 10);
    return {
      id: b.id,
      title: b.title,
      slug: b.slug,
      category: b.category,
      mots,
      minutes_lecture: Math.max(1, Math.ceil(mots / 200)),
      image: !!(b.featured_image && b.featured_image.trim()),
      meta_description: !!(b.meta_description && b.meta_description.trim()),
      a_toi: aToi,
      entetes_prompt: entetesPrompt,
      a_confirmer: aConfirmer,
      score: v.score,
      voix_ok: v.passed,
      manques,
      mots_bannis: v.forbiddenFound,
      doublon_de: racinesPubliees.get(racine(b.title)) ?? null,
      updated_at: b.updated_at,
    };
  });

  // Le plus prêt d'abord : voix qui passe, pas de balise à remplir, pas de
  // doublon, meilleur score, puis le plus long (un article court n'est pas
  // plus prêt parce qu'il est court).
  file.sort((a, b) => {
    const pa = (a.voix_ok ? 0 : 1) + (a.a_toi > 0 ? 1 : 0) + (a.doublon_de ? 1 : 0) + (a.entetes_prompt ? 2 : 0);
    const pb = (b.voix_ok ? 0 : 1) + (b.a_toi > 0 ? 1 : 0) + (b.doublon_de ? 1 : 0) + (b.entetes_prompt ? 2 : 0);
    if (pa !== pb) return pa - pb;
    if (a.score !== b.score) return b.score - a.score;
    return b.mots - a.mots;
  });

  return NextResponse.json({
    file,
    total: file.length,
    prets: file.filter((f) => f.voix_ok && f.a_toi === 0 && !f.doublon_de && !f.entetes_prompt).length,
  });
}
