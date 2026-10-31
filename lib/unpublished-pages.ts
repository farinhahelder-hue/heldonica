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
 * ces protections :
 *   - `app/sitemap.ts` retire la page du sitemap ;
 *   - `lib/page-metadata.ts` la passe en `noindex`, avec l'image de partage par
 *     défaut ;
 *   - `components/SubDestinationTemplate.tsx` et `DestinationPage` remplacent
 *     le brouillon par une page « Bientôt » (`ComingSoonDestination`) : plus de
 *     contenu de brouillon servi, seulement un appel à inscription ;
 *   - les menus pilotés par le CMS (`getZoneLinks`) n'y mènent plus.
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
  '/destinations/cote-d-azur/beausoleil',
  '/destinations/savoie/aillon-le-jeune',
  '/destinations/suisse/stoos',
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

  // MVP du 18/10/2026 (décision du fondateur) : sous-pages sans photo vérifiée,
  // « Bientôt » jusqu'à une vraie photo (planche de contrôle des photos).
  '/destinations/idf/fontainebleau',
  '/destinations/idf/giverny',
  '/destinations/idf/versailles',
  '/destinations/idf/paris',
  '/destinations/madere/achadas-da-cruz',
  '/destinations/madere/budget',
  '/destinations/madere/cabo-girao',
  '/destinations/madere/camara-de-lobos',
  '/destinations/madere/cote-est',
  '/destinations/madere/estreito',
  '/destinations/madere/faial',
  '/destinations/madere/funchal',
  '/destinations/madere/itineraire-7-jours',
  '/destinations/madere/ponta-do-sol',
  '/destinations/madere/portela',
  '/destinations/madere/porto-moniz',
  '/destinations/madere/ribeiro-frio',
  '/destinations/madere/santos',
  '/destinations/madere/sao-vicente',
  '/destinations/montenegro/kotor',
  '/destinations/normandie/cote-albatre',
  '/destinations/normandie/le-havre',
  '/destinations/normandie/pays-dauge',
  '/destinations/portugal/lisbonne',
  '/destinations/portugal/porto',
  '/destinations/portugal/sintra',
  '/destinations/portugal/obidos',
  '/destinations/portugal/batalha-tomar',
  '/destinations/portugal/coimbra',
  '/destinations/portugal/alcobaca',
  '/destinations/roumanie/brasov',
  '/destinations/roumanie/cluj',
  '/destinations/roumanie/itineraire-10-jours',
  '/destinations/roumanie/itineraire-5-jours',
  '/destinations/roumanie/itineraire-7-jours',
  '/destinations/roumanie/sibiu',
  '/destinations/roumanie/timisoara',
  '/destinations/roumanie/transylvanie',

  // Relevé en ligne du 19/10/2026 : Paris montrait encore la tour Eiffel de
  // stock, Maramureș une photo qui n'est pas du Maramureș (mêmes maisons qu'une
  // photo de l'article Apuseni, 6 minutes d'écart), et la Grèce, déjà
  // « Bientôt », restait indexable et dans le pied de page de chaque page.
  '/destinations/paris',
  '/destinations/roumanie/maramures',
  '/destinations/grece',

  // Décision du fondateur du 19/10/2026 (migration 20261019030000) : sans
  // photo vérifiée, Colombie, Lisbonne et Sicile passent « Bientôt ». Elle
  // n'avait été appliquée qu'à la liste /destinations : les pages restaient
  // complètes (« Destination testée », « On y est allés »), indexables et dans
  // le sitemap.
  '/destinations/colombie',
  '/destinations/lisbonne',
  '/destinations/sicile',
] as const;

/** Clés de page CMS (`destinations-sicile-taormine`) correspondantes. */
export const UNPUBLISHED_CMS_PAGES: readonly string[] = [
  'destinations-colombie-bogota',
  'destinations-colombie-cali',
  'destinations-colombie-cartago',
  'destinations-colombie-medellin',
  'destinations-cote-d-azur-beausoleil',
  'destinations-savoie-aillon-le-jeune',
  'destinations-suisse-stoos',
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

  // MVP du 18/10/2026 : mêmes pages, clés CMS.
  'destinations-idf-fontainebleau',
  'destinations-idf-giverny',
  'destinations-idf-versailles',
  'destinations-idf-paris',
  'destinations-madere-achadas-da-cruz',
  'destinations-madere-budget',
  'destinations-madere-cabo-girao',
  'destinations-madere-camara-de-lobos',
  'destinations-madere-cote-est',
  'destinations-madere-estreito',
  'destinations-madere-faial',
  'destinations-madere-funchal',
  'destinations-madere-itineraire-7-jours',
  'destinations-madere-ponta-do-sol',
  'destinations-madere-portela',
  'destinations-madere-porto-moniz',
  'destinations-madere-ribeiro-frio',
  'destinations-madere-santos',
  'destinations-madere-sao-vicente',
  'destinations-montenegro-kotor',
  'destinations-normandie-cote-albatre',
  'destinations-normandie-le-havre',
  'destinations-normandie-pays-dauge',
  'destinations-portugal-lisbonne',
  'destinations-portugal-porto',
  'destinations-portugal-sintra',
  'destinations-portugal-obidos',
  'destinations-portugal-batalha-tomar',
  'destinations-portugal-coimbra',
  'destinations-portugal-alcobaca',
  'destinations-roumanie-brasov',
  'destinations-roumanie-cluj',
  'destinations-roumanie-itineraire-10-jours',
  'destinations-roumanie-itineraire-5-jours',
  'destinations-roumanie-itineraire-7-jours',
  'destinations-roumanie-sibiu',
  'destinations-roumanie-timisoara',
  'destinations-roumanie-transylvanie',

  // Relevé en ligne du 19/10/2026 : mêmes pages, clés CMS.
  'destinations-paris',
  'destinations-roumanie-maramures',
  'destinations-grece',

  // Décision du 19/10/2026 : mêmes pages, clés CMS.
  'destinations-colombie',
  'destinations-lisbonne',
  'destinations-sicile',
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
