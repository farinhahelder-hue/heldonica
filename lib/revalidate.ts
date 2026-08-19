import { revalidatePath, revalidateTag } from 'next/cache';

export interface RevalidateOptions {
  page?: string | null;
  slug?: string | null;
  type?: 'page' | 'article' | 'destination' | 'sub-destination' | 'settings' | 'all';
}

/**
 * Convertit un identifiant de page CMS (ex: 'destinations-madere-funchal')
 * en chemin d'URL publique Next.js (ex: '/destinations/madere/funchal').
 */
export function pageToPath(page: string): string {
  const p = page.trim().toLowerCase();
  if (p === 'home' || p === 'index' || p === 'accueil') return '/';
  if (p === 'global') return '/';

  // Si commence par destinations-
  if (p.startsWith('destinations-')) {
    const parts = p.replace(/^destinations-/, '').split('-');
    if (parts.length === 1) return `/destinations/${parts[0]}`;
    if (parts.length === 2) return `/destinations/${parts[0]}/${parts[1]}`;
    if (parts.length >= 3) return `/destinations/${parts[0]}/${parts.slice(1).join('-')}`;
  }

  // Autres pages avec tirets
  if (p === 'destinations-carte' || p === 'carte') return '/destinations/carte';
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
    } catch {}

  } catch (err) {
    console.warn('[ISR Revalidate] Avertissement revalidation (peut survenir en dev local) :', err);
  }

  return { revalidated };
}
