/**
 * Conversion markdown minimale pour les contenus éditoriaux.
 *
 * Le champ `content` des articles et le type TextBlock annoncent du markdown
 * (cf. types/cms-blocks.ts), mais aucun convertisseur n'existait dans le
 * projet : les « ## » et « ** » s'affichaient donc en texte brut sur les
 * articles publiés. Ce module couvre le sous-ensemble réellement présent en
 * base (titres et gras), sans dépendance externe.
 *
 * La sortie est destinée à passer par DOMPurify avant insertion.
 */

function escapeHtml(texte: string): string {
  return texte.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function gras(texte: string): string {
  // **gras** — exige un caractère non blanc aux deux bords pour éviter de
  // transformer une ligne de séparation en balise vide.
  return texte.replace(/\*\*(?!\s)([^*]+?)(?<!\s)\*\*/g, '<strong>$1</strong>');
}

/**
 * Convertit du markdown en HTML sain.
 * Si `source` contient déjà des balises de bloc HTML, elle est renvoyée telle
 * quelle : on ne mélange pas les deux formats dans un même contenu.
 */
export function markdownToHtml(source: string | null | undefined): string {
  if (!source) return '';

  const texte = source.replace(/\r\n?/g, '\n').trim();
  if (!texte) return '';

  if (/<(?:p|h[1-6]|figure|img|blockquote|ul|ol|div|article|section|table)[\s>]/i.test(texte)) {
    return texte;
  }

  const blocs = texte.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);

  return blocs
    .map((bloc) => {
      const titre = bloc.match(/^(#{1,6})\s+(.*)$/s);
      if (titre) {
        const niveau = titre[1].length;
        const contenu = gras(escapeHtml(titre[2].trim()));
        return `<h${niveau}>${contenu}</h${niveau}>`;
      }
      const contenu = gras(escapeHtml(bloc)).replace(/\n/g, '<br />');
      return `<p>${contenu}</p>`;
    })
    .join('\n');
}

export default markdownToHtml;
