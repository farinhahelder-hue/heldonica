/**
 * Routes d'administration.
 *
 * Le bandeau cookies et la fenêtre newsletter s'adressent aux visiteurs du
 * site. Ils s'affichaient aussi dans le panneau d'administration, où ils
 * recouvrent les commandes — d'autant plus sur téléphone, où la fenêtre occupe
 * la moitié de l'écran. Le garde existant visait « /cms », un préfixe qui
 * n'existe plus depuis le renommage en « /panel-manager » : il ne masquait donc
 * plus rien.
 *
 * Une seule liste, partagée, pour que le prochain renommage ne laisse pas
 * derrière lui un garde muet.
 */
const PREFIXES_ADMIN = ['/panel-manager', '/admin'] as const

export function estRouteAdmin(chemin: string | null | undefined): boolean {
  if (!chemin) return false
  return PREFIXES_ADMIN.some(prefixe => chemin.startsWith(prefixe))
}
