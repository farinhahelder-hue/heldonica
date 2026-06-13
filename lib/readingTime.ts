/**
 * Fonctions utilitaires pour le temps de lecture des articles
 * Basé sur 200 mots/minute (moyenne slow travel)
 */

const WORDS_PER_MINUTE = 200

/**
 * Calcule le temps de lecture en minutes
 * @param content - Contenu HTML ou texte
 * @returns Nombre de minutes (minimum 1)
 */
export function getReadingTime(content: string | null | undefined): number {
  if (!content || typeof content !== 'string') {
    return 0
  }

  try {
    // Supprimer les tags HTML
    const plainText = content.replace(/<[^>]+>/g, ' ')
    // Compter les mots
    const words = plainText.split(/\s+/).filter(Boolean).length
    // Calculer le temps
    const minutes = Math.ceil(words / WORDS_PER_MINUTE)
    return Math.max(1, minutes)
  } catch {
    return 1
  }
}

/**
 * Formate le temps de lecture pour l'affichage
 * @param minutes - Nombre de minutes
 * @returns Texte formaté (ex: "3 min de lecture")
 */
export function formatReadingTime(minutes: number): string {
  if (minutes < 1) return 'Moins d\'une minute de lecture';
  if (minutes === 1) return '1 minute de lecture';
  return `${Math.ceil(minutes)} minutes de lecture`;
}

/**
 * Calcule et formate le temps de lecture depuis le contenu
 * @param content - Contenu HTML ou texte
 * @returns Texte formaté (ex: "3 min de lecture") ou chaîne vide
 */
export function getFormattedReadingTime(content: string | null | undefined): string {
  const minutes = getReadingTime(content)
  return formatReadingTime(minutes)
}