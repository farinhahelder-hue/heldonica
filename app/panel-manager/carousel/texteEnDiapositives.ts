import { SlideData } from './tokens'

/**
 * Découpe un texte collé en diapositives.
 *
 * Repris de l'ancien éditeur, le seul apport qu'il avait sur celui-ci. Sa
 * seconde particularité — chercher une image Unsplash par diapositive — n'a pas
 * été reprise : illustrer un carnet de voyage avec des photos de lieux où l'on
 * n'est pas allé va contre la règle du projet. Les photos viennent de la
 * médiathèque, par le sélecteur.
 *
 * La règle de découpage : une ligne courte, ou numérotée, ouvre une
 * diapositive ; les lignes suivantes en forment le corps. C'est la forme
 * qu'ont les notes prises en voyage.
 */
export function texteEnDiapositives(
  texte: string,
  nouvelId: () => string
): SlideData[] {
  const lignes = texte.split('\n').map(l => l.trim()).filter(Boolean)
  if (lignes.length === 0) return []

  const diapositives: SlideData[] = []
  let titre = ''
  let corps = ''

  const clore = () => {
    // Un titre sans corps reste une diapositive valable : c'est souvent une
    // accroche. L'ancienne version les jetait, et coller une liste de titres ne
    // produisait alors rien du tout.
    if (titre || corps) {
      diapositives.push({ id: nouvelId(), title: titre, content: corps, cta: '' })
    }
  }

  for (const ligne of lignes) {
    const ouvreUneDiapositive = /^\d+[.)\-:]/.test(ligne) || ligne.length < 50
    if (ouvreUneDiapositive) {
      clore()
      titre = ligne.replace(/^\d+[.)\-:]\s*/, '')
      corps = ''
    } else {
      corps += (corps ? '\n' : '') + ligne
    }
  }
  clore()

  // Un texte d'un seul bloc, sans aucune ligne courte : la boucle ci-dessus en
  // fait une seule diapositive sans titre, ce qui n'aide personne. Chaque
  // paragraphe en devient une.
  if (diapositives.every(d => !d.title)) {
    return texte
      .split(/\n\s*\n/)
      .map(p => p.trim())
      .filter(Boolean)
      .map(p => ({ id: nouvelId(), title: '', content: p, cta: '' }))
  }

  return diapositives
}
