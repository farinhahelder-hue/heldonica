// ============================================================
// La clôture du registre — décider quand une tâche est finie, et le dire.
//
// Ferme la boucle ouverte par lib/registre-dispatch.ts :
//
//   dépôt → dispatch → conversation → [ici] compte rendu dans le registre
//
// LA RÈGLE QUI COMPTE, et qui vient d'AGENTS.md : on ne clôt JAMAIS en `done`.
// Une conversation qui s'arrête et une PR qui existe ne prouvent pas qu'un test a
// tourné. La route écrit donc `waiting_validation` — « le code est fait, une
// action humaine manque » — avec le lien de la PR et un résumé reprenable. C'est
// l'humain qui promeut en `done`, sur preuves. `done` aveugle est le mensonge le
// plus coûteux du projet.
// ============================================================

/** Une conversation encore active, ou arrêtée depuis moins que ça, n'est pas close. */
export const INACTIVITE_MINUTES = 10

/** Les statuts qui signifient « déjà clos » : on ne re-clôt pas. */
const DEJA_CLOS = ['waiting_validation', 'blocked', 'done']

export type TacheCloturable = {
  id: string
  status?: string | null
  task?: string | null
  claimed_by?: string | null
  payload?: unknown
}

export type Conversation = {
  id: string
  execution_status?: string | null
  sandbox_status?: string | null
  updated_at?: string | null
  pr_number?: unknown
  conversation_ui_url?: string | null
  title?: string | null
}

/** L'identifiant de conversation écrit par le dispatch, s'il existe. */
export function conversationTracee(t: TacheCloturable): string | null {
  const p = t.payload
  if (!p || typeof p !== 'object') return null
  const d = (p as { dispatch?: unknown }).dispatch
  if (!d || typeof d !== 'object') return null
  const id = (d as { conversation_id?: unknown }).conversation_id
  return typeof id === 'string' && id.length > 0 ? id : null
}

/** La conversation a-t-elle fini de travailler ? */
export function conversationTerminee(conv: Conversation, maintenant: Date): boolean {
  // Encore en cours d'exécution : on attend.
  if (conv.execution_status === 'running') return false
  // Sans horodatage, on ne peut pas juger l'inactivité : on attend plutôt que de
  // clore à l'aveugle. Un faux « terminé » clorait une tâche encore en travail.
  if (!conv.updated_at) return false
  const t = Date.parse(conv.updated_at)
  if (Number.isNaN(t)) return false
  return maintenant.getTime() - t >= INACTIVITE_MINUTES * 60_000
}

/** Les numéros de PR produits, quels que soient les formats rendus par l'API. */
export function prs(conv: Conversation): number[] {
  const v = conv.pr_number
  if (!Array.isArray(v)) return []
  return v.filter((n): n is number => typeof n === 'number' && Number.isInteger(n) && n > 0)
}

/**
 * La décision : clore, ou attendre — et pourquoi.
 *
 * On ne clôt que ce qu'on a soi-même dispatché (trace présente) : une tâche prise
 * à la main par un humain ne doit pas être close sous ses pieds par un cron.
 */
export function decisionCloture(
  t: TacheCloturable,
  conv: Conversation | null,
  maintenant: Date
): { clore: boolean; raison: string } {
  if (DEJA_CLOS.includes(String(t.status))) {
    return { clore: false, raison: `déjà ${t.status}` }
  }
  if (!conversationTracee(t)) {
    return { clore: false, raison: 'pas dispatchée par la route : la clôture ne la touche pas' }
  }
  if (!conv) {
    return { clore: false, raison: 'conversation introuvable : on attend plutôt que de supposer' }
  }
  if (!conversationTerminee(conv, maintenant)) {
    return { clore: false, raison: 'conversation encore active' }
  }
  return { clore: true, raison: 'conversation terminée' }
}

/**
 * Le compte rendu écrit dans le registre.
 *
 * Toujours `waiting_validation` : jamais `done`. Le résumé dit ce qui a été
 * observé (PR détectée ou non) et ce qui reste à faire à l'humain.
 */
export function compteRendu(
  t: TacheCloturable,
  conv: Conversation,
  opts: { repo: string }
): {
  status: 'waiting_validation'
  description: string
  actions_done: Record<string, string[]>
  notes: string
} {
  const numeros = prs(conv)
  const liens = numeros.map((n) => `https://github.com/${opts.repo}/pull/${n}`)
  const ui = conv.conversation_ui_url || `https://app.all-hands.dev/canvas/conversations/${conv.id}`

  const corrige = numeros.length
    ? [`PR ouverte : ${liens.join(', ')}`]
    : ['Conversation terminée sans PR détectée.']

  return {
    status: 'waiting_validation',
    description:
      numeros.length > 0
        ? `Code produit — PR à valider : ${liens.join(', ')}`
        : `Conversation terminée sans PR détectée. À inspecter : ${ui}`,
    actions_done: {
      corrige,
      // Vide À DESSEIN : la clôture automatique n'a rien mesuré. Prétendre le
      // contraire serait exactement le théâtre de validation qu'AGENTS.md interdit.
      verifie: [],
      non_verifie: [
        "Les tests n'ont pas été exécutés par la clôture automatique : elle constate l'arrêt de la conversation, elle ne mesure rien.",
        "Le statut `done` n'est jamais posé ici : il exige des preuves mesurées.",
      ],
      reste_a_faire: [
        numeros.length
          ? `Vérifier la PR ${liens.join(', ')} (CI verte, tests mesurés), puis promouvoir en done avec la preuve.`
          : `Inspecter la conversation ${ui} : aucune PR n'a été détectée.`,
      ],
    },
    notes: `Clôture automatique : conversation ${conv.id} arrêtée (dernière activité ${conv.updated_at}). Statut posé : waiting_validation, jamais done.`,
  }
}
