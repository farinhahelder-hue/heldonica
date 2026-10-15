// ============================================================
// Le dispatch du registre — décider quoi lancer, et le dire.
//
// Une tâche `sent` du registre `agent_tasks` doit devenir une conversation. Ce
// fichier porte les deux décisions qui rendent cela sûr, et rien d'autre :
//
//   1. QUE dispatcher — une tâche `sent`, adressée à un agent qu'on sait piloter,
//      pas déjà lancée, et dont les dépendances sont satisfaites.
//   2. QUOI ENVOYER — un brief autoportant : une conversation déléguée ne connaît
//      rien de nous, ni AGENTS.md, ni la branche, ni le protocole de compte rendu.
//
// La règle vit ici, une seule fois, pour que la route et les tests la partagent.
// ============================================================

/**
 * Les destinataires qu'on sait réellement lancer.
 *
 * Volontairement restreint à `openhands` : c'est le seul agent dont on peut
 * ouvrir une conversation par API. `tous` est une tâche ouverte, pas un ordre —
 * la dispatcher reviendrait à voler le travail que l'agent voulu s'apprêtait à
 * prendre (la prise est atomique, le premier arrivé gagne). Une tâche `tous`
 * reste donc à un humain. Élargir cette liste est une décision, pas un réglage.
 */
export const DISPATCHABLES = ['openhands'] as const

export type Tache = {
  id: string
  agent?: string | null
  status?: string | null
  task?: string | null
  scope?: string | null
  risk_level?: string | null
  depends_on?: string | null
  payload?: unknown
  claimed_by?: string | null
}

/**
 * Un dispatch déjà fait est écrit dans le payload : c'est la mémoire qui empêche
 * la double exécution.
 *
 * Pourquoi ce n'est pas un détail : `libererBauxExpires` (route, heartbeat, et le
 * `balayer=1` de la veille) remet une tâche abandonnée en `sent` **avec
 * `claimed_by = null`**. Sans cette trace, une tâche dont le téléphone est mort
 * serait relancée à chaque passage — une conversation de plus toutes les cinq
 * minutes. La trace est dans `payload` et non dans une colonne : elle survit au
 * balayage (qui ne touche que `status`, `claimed_by`, `claimed_at`).
 */
export function dejaDispatchee(t: Tache): boolean {
  const p = t.payload
  if (!p || typeof p !== 'object') return false
  const d = (p as { dispatch?: unknown }).dispatch
  if (!d || typeof d !== 'object') return false
  const id = (d as { conversation_id?: unknown }).conversation_id
  return typeof id === 'string' && id.length > 0
}

/**
 * Une dépendance qui n'est pas `done` bloque le lancement.
 *
 * Dépendance absente du lot lu : on bloque aussi. Une dépendance introuvable est
 * une anomalie qu'il vaut mieux voir (la tâche reste `sent`, et la route le dit)
 * que de lancer un agent sur un préalable peut-être jamais fait.
 */
export function dependancesSatisfaites(t: Tache, parId: Map<string, Tache>): boolean {
  if (!t.depends_on) return true
  const dep = parId.get(t.depends_on)
  if (!dep) return false
  return dep.status === 'done'
}

/** La décision complète, pour une tâche et l'état connu du registre. */
export function estDispatchable(t: Tache, parId: Map<string, Tache>): boolean {
  if (t.status !== 'sent') return false
  if (!(DISPATCHABLES as readonly string[]).includes(String(t.agent || ''))) return false
  if (dejaDispatchee(t)) return false
  return dependancesSatisfaites(t, parId)
}

/** La branche de travail : celle déjà notée, sinon une branche dédiée par tâche. */
export function brancheDe(t: Tache): string {
  const p = t.payload
  if (p && typeof p === 'object') {
    const b = (p as { branch?: unknown }).branch
    if (typeof b === 'string' && b.trim()) return b.trim()
  }
  return `agent/openhands/${t.id.slice(0, 8)}`
}

/**
 * Le brief envoyé à la conversation déléguée.
 *
 * Autoportant, par construction : une conversation lancée par API démarre sans
 * contexte. On y met la tâche, mais aussi le protocole de compte rendu — sinon
 * l'agent ignore qu'il doit clore la tâche dans le registre, et la tâche
 * resterait `sent` pour toujours.
 */
export function brief(t: Tache, opts: { siteUrl: string }): string {
  const tache = (t.task || '').trim()
  const scope = t.scope || 'a-qualifier'
  const risque = t.risk_level || 'non precise'
  const branche = brancheDe(t)

  return `Tu prends une tâche du registre Heldonica. Le registre Supabase
\`agent_tasks\` est la vérité — pas Discord, pas les issues GitHub.

## La tâche

${tache}

- Dépôt : farinhahelder-hue/heldonica
- Branche de travail : \`${branche}\`
- Périmètre : ${scope}
- Niveau de risque : ${risque}
- Identifiant dans le registre : \`${t.id}\`

## Le protocole (AGENTS.md)

Avant de toucher au code, prends la tâche — la prise est atomique, elle te
protège de travailler en double :

\`\`\`bash
curl -X POST ${opts.siteUrl}/api/agent-tasks \\
  -H "x-api-key: $AGENT_API_KEY" -H "Content-Type: application/json" \\
  -d '{"action":"prendre","agent_name":"openhands","id":"${t.id}","branch":"${branche}"}'
\`\`\`

Puis, en fin de travail, rends compte :

\`\`\`json
{"action":"rendre_compte","agent_name":"openhands","id":"${t.id}",
 "status":"done|waiting_validation|blocked",
 "actions_done":{"corrige":[],"verifie":[],"non_verifie":[],"reste_a_faire":[]}}
\`\`\`

\`done\` sans preuve mesurée dans \`verifie\` est refusé par la route — et c'est
voulu. Si tu n'as pas mesuré, écris \`waiting_validation\` et dis ce qui reste à
mesurer. \`done\` sans vérification est le mensonge le plus coûteux du projet.

## Avant de finir

- Une tâche, une branche. Ouvre une PR vers \`main\` ; ne pousse jamais sur \`main\`.
- Lis \`AGENTS.md\` et, pour tout contenu éditorial, \`docs/GUIDE_VOIX_HELDONICA_IA.md\`.
- Ne commite aucun secret. Tout en français.`
}
