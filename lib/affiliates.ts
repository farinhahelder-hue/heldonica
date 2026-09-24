/**
 * Liens affiliés — Booking.com et GetYourGuide.
 *
 * Point unique de construction des URLs partenaires. Jusqu'ici l'identifiant
 * Booking était recopié en dur dans chaque page d'itinéraire (3 fichiers,
 * 19 occurrences) : impossible de le changer sans risquer d'en oublier une, et
 * aucune de ces URLs ne portait `rel="sponsored"`.
 *
 * Ces identifiants ne sont pas des secrets : ils transitent par définition dans
 * l'URL sortante, visible par le visiteur. Les exposer côté client est le
 * fonctionnement normal d'un programme d'affiliation — à ne pas confondre avec
 * une clé d'API, qui elle ne doit jamais quitter le serveur.
 */

/** Identifiant partenaire Booking.com (paramètre `aid`). */
export const BOOKING_AFFILIATE_ID = '2420035'

/**
 * Identifiant partenaire GetYourGuide (paramètre `partner_id`).
 *
 * Vide tant que le compte partenaire n'est pas ouvert : les helpers renvoient
 * alors `null` et l'UI n'affiche simplement pas les blocs activités, plutôt que
 * de publier des liens cassés ou non rémunérés.
 */
export const GETYOURGUIDE_PARTNER_ID = process.env.NEXT_PUBLIC_GETYOURGUIDE_PARTNER_ID ?? ''

export type AffiliatePartner = 'booking' | 'getyourguide'

/**
 * URL de recherche d'hébergements Booking.com pour une ville ou une région.
 * `query` est le nom de la destination tel qu'on veut la chercher ("Brașov").
 */
export function bookingSearchUrl(query: string): string {
  const params = new URLSearchParams({
    ss: query,
    aid: BOOKING_AFFILIATE_ID,
    lang: 'fr',
  })
  return `https://www.booking.com/searchresults.fr.html?${params.toString()}`
}

/**
 * URL de recherche d'activités GetYourGuide.
 * Renvoie `null` si aucun identifiant partenaire n'est configuré.
 */
export function getYourGuideSearchUrl(query: string): string | null {
  if (!GETYOURGUIDE_PARTNER_ID) return null
  const params = new URLSearchParams({
    q: query,
    partner_id: GETYOURGUIDE_PARTNER_ID,
  })
  return `https://www.getyourguide.com/s/?${params.toString()}`
}

/** GetYourGuide est-il activable (compte partenaire configuré) ? */
export function isGetYourGuideEnabled(): boolean {
  return GETYOURGUIDE_PARTNER_ID.length > 0
}

/** Libellé lisible d'un partenaire, pour les mentions de transparence. */
export const PARTNER_LABELS: Record<AffiliatePartner, string> = {
  booking: 'Booking.com',
  getyourguide: 'GetYourGuide',
}

/**
 * Mention de transparence affichée près des liens affiliés.
 * Obligation légale (DGCCRF) et engagement éditorial : le visiteur doit savoir
 * qu'un lien est rémunéré avant de cliquer.
 */
export const AFFILIATE_DISCLOSURE =
  "Liens partenaires : si tu réserves via ces liens, on touche une petite commission. Ton tarif, lui, ne bouge pas."
