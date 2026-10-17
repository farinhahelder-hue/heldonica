/**
 * Pages dont le contenu n'est pas publiable en l'état.
 *
 * Relevé du 11/10/2026 : le générateur de zones CMS (commit ad58c936) a produit
 * des descriptions réduites à un mot suivi d'un point (« Grec. », « Dunes. »),
 * voire des fragments en anglais (« Incredible. »). Ces textes sont présents à
 * la fois dans les fallbacks de code et dans `cms_editable_zones`, donc ils
 * s'affichent réellement.
 *
 * Réécrire ces pages suppose de la matière terrain (notes, photos) qui n'existe
 * pas encore pour ces destinations. En attendant, une entrée d'ici déclenche
 * trois protections :
 *   - `app/sitemap.ts` retire la page du sitemap ;
 *   - `lib/page-metadata.ts` la passe en `noindex` ;
 *   - `components/SubDestinationTemplate.tsx` remplace le brouillon par une page
 *     « Bientôt » (même état de non-publication que /destinations/grece) : plus
 *     de contenu de brouillon servi, seulement un appel à inscription.
 *
 * Pour publier une page : rédiger son contenu à partir de vécu vérifiable, puis
 * retirer son entrée d'ici. Le garde-fou `check:content-pages` et le test
 * `unpublished-pages.test.ts` rappellent la règle.
 */

/** Chemins publics des pages non publiables. */
export const UNPUBLISHED_PATHS: readonly string[] = [
  '/destinations/colombie/bogota',
  '/destinations/colombie/cali',
  '/destinations/colombie/cartago',
  '/destinations/colombie/medellin',
  '/destinations/sardaigne/alghero',
  '/destinations/sardaigne/asinara',
  '/destinations/sardaigne/cagliari',
  '/destinations/sardaigne/costa-smeralda',
  '/destinations/sardaigne/nuoro',
  '/destinations/sicile/catane',
  '/destinations/sicile/etoile',
  '/destinations/sicile/palerme',
  '/destinations/sicile/syracuse',
  '/destinations/sicile/taormine',
] as const;

/** Clés de page CMS (`destinations-sicile-taormine`) correspondantes. */
export const UNPUBLISHED_CMS_PAGES: readonly string[] = [
  'destinations-colombie-bogota',
  'destinations-colombie-cali',
  'destinations-colombie-cartago',
  'destinations-colombie-medellin',
  'destinations-sardaigne-alghero',
  'destinations-sardaigne-asinara',
  'destinations-sardaigne-cagliari',
  'destinations-sardaigne-costa-smeralda',
  'destinations-sardaigne-nuoro',
  'destinations-sicile-catane',
  'destinations-sicile-etoile',
  'destinations-sicile-palerme',
  'destinations-sicile-syracuse',
  'destinations-sicile-taormine',
] as const;

const pathSet = new Set(UNPUBLISHED_PATHS);
const cmsSet = new Set(UNPUBLISHED_CMS_PAGES);

/** Vrai si l'URL publique (ou son chemin) correspond à une page non publiable. */
export function isUnpublishedPath(pathOrUrl: string): boolean {
  const path = pathOrUrl.replace(/^https?:\/\/[^/]+/, '').replace(/\/+$/, '') || '/';
  return pathSet.has(path);
}

/** Vrai si la clé de page CMS correspond à une page non publiable. */
export function isUnpublishedCmsPage(page: string): boolean {
  return cmsSet.has(page);
}
