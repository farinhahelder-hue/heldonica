/**
 * Écarter ce que Whisper invente quand il n'entend rien.
 *
 * Sur un plan sans parole nette, il a rendu « Sous-titres par Jérémy Diaz » —
 * une formule de générique apprise sur des corpus de sous-titres, restituée
 * faute de mieux. Le segment portait un horodatage et un texte comme un autre :
 * rien, en aval, ne pouvait le distinguer d'une vraie parole, et il s'est gravé
 * dans l'image du montage. Un générique inventé au bas d'un Reel publié, avec
 * le nom d'une personne réelle, n'est pas un défaut cosmétique.
 *
 * Deux filtres, parce qu'aucun des deux ne suffit seul : les indicateurs de
 * confiance attrapent le silence mal interprété, la liste de formules attrape
 * les hallucinations que Whisper produit avec aplomb.
 *
 * Vit ici plutôt que dans la route pour être testable : un test qui
 * réimplémente la règle qu'il vérifie ne vérifie rien.
 */

/** Ce que Whisper dit d'un segment, au-delà de son texte. */
export type SegmentJuge = {
  texte: string
  probaSilence: number
  vraisemblance: number
}

/**
 * Les seuils de Whisper lui-même, ceux qu'il applique en interne pour décider
 * qu'un passage est du silence : forte probabilité d'absence de parole ET
 * faible vraisemblance du texte produit.
 *
 * Les deux ensemble, jamais l'un seul — une probabilité élevée arrive sur une
 * parole étouffée qu'on veut garder, et une faible vraisemblance sur un accent
 * ou un mot rare.
 */
export const PROBA_SILENCE_MAX = 0.6
export const VRAISEMBLANCE_MIN = -1.0

/**
 * Les formules de générique que Whisper restitue le plus souvent.
 *
 * La liste reste courte et sans ambiguïté : elle ne vise que les crédits de
 * sous-titrage, que personne ne prononce à voix haute dans un carnet de voyage.
 * On n'y met pas « merci d'avoir regardé », pourtant fréquent en hallucination :
 * quelqu'un peut réellement le dire, et jeter une vraie parole est un échec au
 * même titre qu'en graver une fausse.
 */
export const GENERIQUES: RegExp[] = [
  // Ancre au debut : Whisper rend la formule comme segment entier. Sans
  // l'ancre, « j'ai mis des sous-titres par-dessus » serait jete aussi.
  /^sous[\s-]?titr\w*\s+(par|realis|effectu|traduit)/,
  /amara\.org|soustitreur\.com/,
]

/**
 * Sans accents ni casse : Whisper varie sur les deux. Le texte est aussi
 * debarrasse de ce qui le precede — espace, ponctuation, emoji — pour que
 * l'ancre des generiques tienne.
 */
export function normaliser(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^[^a-z0-9]+/, '')
    .trim()
}

/** Vrai si le segment porte la signature d'une invention. */
export function estInvente(s: SegmentJuge): boolean {
  if (s.probaSilence > PROBA_SILENCE_MAX && s.vraisemblance < VRAISEMBLANCE_MIN) return true
  const nu = normaliser(s.texte)
  return GENERIQUES.some((motif) => motif.test(nu))
}
