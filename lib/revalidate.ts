import { revalidatePath, revalidateTag } from 'next/cache';

export interface RevalidateOptions {
  page?: string | null;
  slug?: string | null;
  type?: 'page' | 'article' | 'destination' | 'sub-destination' | 'settings' | 'all';
}

/**
 * Slugs des destinations de premier niveau, telles que servies par
 * `app/destinations/<slug>/page.tsx`.
 *
 * Sert à lever l'ambiguïté des clés de page CMS : la clé joint la destination et
 * la sous-destination par un tiret, mais certains slugs en contiennent eux-mêmes
 * un. `destinations-cote-d-azur-beausoleil` doit donner
 * `/destinations/cote-d-azur/beausoleil` ; un découpage sur le premier tiret
 * produit `/destinations/cote/d-azur-beausoleil`, une URL qui n'existe pas et
 * dont la revalidation ne fait donc rien.
 *
 * À tenir à jour quand une destination de premier niveau est ajoutée : sans son
 * entrée ici, ses sous-pages retombent sur le découpage au premier tiret.
 */
const DESTINATIONS_RACINES: readonly string[] = [
  'alentejo', 'carte', 'colombie', 'compare', 'cote-d-azur', 'grece', 'idf',
  'lisbonne', 'madere', 'montenegro', 'normandie', 'paris', 'portugal',
  'roumanie', 'sardaigne', 'savoie', 'sicile', 'suisse', 'zurich',
];

/**
 * Convertit un identifiant de page CMS (ex: 'destinations-madere-funchal')
 * en chemin d'URL publique Next.js (ex: '/destinations/madere/funchal').
 */
export function pageToPath(page: string): string {
  const p = page.trim().toLowerCase();
  if (p === 'home' || p === 'index' || p === 'accueil') return '/';
  if (p === 'global') return '/';

  // Clés de guide : 'guides-top-10-pepites-madere' -> '/guides/top-10-pepites-madere'.
  // Sans cette branche, la clé tombait sur '/guides-<slug>', une URL inexistante.
  if (p.startsWith('guides-')) return `/guides/${p.slice('guides-'.length)}`;

  if (p.startsWith('destinations-')) {
    const reste = p.slice('destinations-'.length);

    // La racine la plus longue qui préfixe `reste` gagne : c'est ce qui distingue
    // 'cote-d-azur/beausoleil' de 'cote/d-azur-beausoleil'.
    const racine = DESTINATIONS_RACINES
      .filter((r) => reste === r || reste.startsWith(`${r}-`))
      .sort((a, b) => b.length - a.length)[0];

    if (racine) {
      const sous = reste.slice(racine.length).replace(/^-/, '');
      return sous ? `/destinations/${racine}/${sous}` : `/destinations/${racine}`;
    }

    // Clé inconnue : découpage au premier tiret, faute de mieux.
    const parts = reste.split('-');
    if (parts.length === 1) return `/destinations/${parts[0]}`;
    if (parts.length === 2) return `/destinations/${parts[0]}/${parts[1]}`;
    return `/destinations/${parts[0]}/${parts.slice(1).join('-')}`;
  }

  // Autres pages avec tirets
  if (p === 'carte') return '/destinations/carte';
  if (p === 'travel-planning' || p === 'travel-planning-form') return `/${p}`;
  if (p === 'slow-travel' || p === 'temoignages' || p === 'mentions-legales') return `/${p}`;
  if (p === 'politique-confidentialite' || p === 'politique-affiliation') return `/${p}`;

  return `/${p}`;
}

/**
 * Déclenche la revalidation instantanée (On-Demand ISR) sur Vercel/Next.js
 * pour actualiser le cache des pages modifiées depuis le CMS.
 */
export async function revalidateCmsTarget(options: RevalidateOptions): Promise<{ revalidated: string[] }> {
  const revalidated: string[] = [];

  try {
    const { page, slug, type } = options;

    if (type === 'all' || type === 'settings') {
      revalidatePath('/', 'layout');
      revalidated.push('/* (layout global)');
      return { revalidated };
    }

    if (page) {
      const path = pageToPath(page);
      revalidatePath(path);
      revalidated.push(path);

      // Si c'est une sous-destination, revalider aussi la destination parente
      if (path.startsWith('/destinations/') && path.split('/').length > 3) {
        const parentPath = path.substring(0, path.lastIndexOf('/'));
        revalidatePath(parentPath);
        revalidated.push(parentPath);
      }
    }

    if (slug) {
      const articlePath = `/blog/${slug}`;
      revalidatePath(articlePath);
      revalidated.push(articlePath);
    }

    if (type === 'article' || page === 'blog') {
      revalidatePath('/blog');
      revalidated.push('/blog');
      revalidatePath('/');
      revalidated.push('/');
    }

    if (type === 'destination') {
      revalidatePath('/destinations');
      revalidatePath('/destinations/carte');
      revalidated.push('/destinations', '/destinations/carte');
    }

    // Revalidation des tags si présents
    try {
      revalidateTag('cms-content');
      revalidateTag('site-settings');
      revalidateTag('cms-zones');
    } catch {}

  } catch (err) {
    console.warn('[ISR Revalidate] Avertissement revalidation (peut survenir en dev local) :', err);
  }

  return { revalidated };
}
