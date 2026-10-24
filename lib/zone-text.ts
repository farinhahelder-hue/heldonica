import { normalizeHtmlAttributes } from '@/lib/html-attributes'

/**
 * Normalisation du texte des zones CMS avant affichage.
 *
 * Une valeur saisie dans un `<textarea>` peut contenir la séquence **littérale**
 * `\n` — deux caractères, une barre oblique inverse suivie d'un « n » — et non un
 * retour à la ligne. Les valeurs sont injectées telles quelles
 * (`dangerouslySetInnerHTML`), donc le navigateur affiche « \n » en toutes lettres
 * au milieu de la phrase. Relevé le 20/10/2026 sur `/guides/top-10-pepites-madere`
 * (« …chaque plat.\n\nOn a testé… ») et `/guides/merci`.
 *
 * Seule la séquence littérale est convertie : un vrai saut de ligne est laissé
 * intact, pour ne rien changer aux zones qui en contiennent déjà.
 */
export function normalizeZoneText(value: string): string {
  return normalizeHtmlAttributes(value.replace(/\\n/g, '<br />'))
}
