/**
 * Normalisation des attributs HTML des contenus éditoriaux avant affichage.
 *
 * Certaines zones CMS et certains fallbacks codés en dur portent encore du JSX
 * (`className="text-mahogany"`) au lieu de HTML (`class="text-mahogany"`). Le
 * contenu passe par `dangerouslySetInnerHTML` : le navigateur reçoit un attribut
 * `className` qu'il ne connaît pas, l'ignore, et la classe Tailwind ne
 * s'applique donc jamais — la couleur voulue est simplement absente, sans erreur.
 *
 * Relevé le 24/10/2026 : 18 zones en base (`destinations-alentejo` intro_1/2 et
 * quick_1/4, `destinations-montenegro-kotor` ×12, `home` section_quiz_title),
 * 16 fallbacks JSX dans les mêmes pages, et 5 articles de blog (dont un publié,
 * `/blog/itineraire-slow-travel-roumanie-bucarest-apuseni`).
 *
 * La correction se fait au rendu, pas en base : elle couvre d'un même geste les
 * valeurs stockées et les fallbacks du code, et survit à une régénération de ces
 * pages par `scripts/generate-*-cms.mjs`. Même approche que `normalizeZoneText`
 * pour la séquence `\n` littérale.
 */

/**
 * `className=` → `class=`. L'attribut est toujours précédé d'un blanc en HTML
 * comme en JSX (`<strong className=…>`), ce qui évite de toucher un identifiant
 * qui se terminerait par « className ». Aucune fonctionnalité ne dépend d'un
 * attribut `className` littéral dans le contenu servi : c'est toujours un défaut.
 */
export function normalizeHtmlAttributes(html: string): string {
  return html.replace(/(\s)className(\s*)=/g, '$1class$2=')
}
