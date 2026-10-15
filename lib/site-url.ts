/**
 * lib/site-url.ts
 *
 * Source unique de l'URL publique du site, utilisée pour construire les URLs
 * canoniques (JSON-LD, sitemap, partage). Ordre de résolution :
 *   1. NEXT_PUBLIC_SITE_URL (variable documentée dans .env.example)
 *   2. NEXT_PUBLIC_BASE_URL  (alias hérité)
 *   3. https://www.heldonica.fr (défaut de production)
 *
 * La variable est lue à l'appel (et non figée à l'import) pour rester
 * correcte dans les environnements de prévisualisation Vercel.
 */

const DEFAULT_SITE_URL = 'https://www.heldonica.fr';

export function siteUrl(path = ''): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    DEFAULT_SITE_URL;

  const cleanBase = base.replace(/\/+$/, '');
  if (!path) return cleanBase;
  return path.startsWith('/') ? `${cleanBase}${path}` : `${cleanBase}/${path}`;
}
