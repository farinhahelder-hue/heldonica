// ============================================================
// Regles de tri des PR de Jules — sans reseau, testees par vitest.
//
// Le tri propose, il ne decide pas : chaque recommandation devient une tache
// `agent_tasks` adressee au fondateur, qui la valide d'un geste depuis le Poco
// (« valide #id »). Voir scripts/revue-jules.mjs.
// ============================================================

/** Une PR de Jules porte toujours le lien de sa tache Jules ; celles des autres agents, jamais. */
export function estPrDeJules(pr) {
  return /jules\.google\.com\/task/.test(pr.body || '')
}

/**
 * Fichiers qu'aucune fusion « en un geste » ne doit toucher : schema, CI,
 * authentification, routes API, dependances, secrets. Ils demandent une vraie
 * relecture sur GitHub.
 */
const SENSIBLES = [
  /^supabase\/migrations\//,
  /^sql\//,
  /^\.github\//,
  /^middleware\.ts$/,
  /(^|\/)lib\/[^/]*auth[^/]*$/,
  /^app\/api\//,
  /(^|\/)package(-lock)?\.json$/,
  /(^|\/)\.env/,
]

export function fichiersSensibles(fichiers) {
  return fichiers.filter((f) => SENSIBLES.some((r) => r.test(f)))
}

const MOTS_VIDES = new Set([
  'the', 'a', 'an', 'of', 'to', 'and', 'for', 'in', 'on', 'with', 'by', 'add', 'adds', 'improve', 'improves',
  'fix', 'fixes', 'feat', 'chore', 'perf', 'docs', 'test', 'tests', 'testing', 'improvement', 'palette', 'bolt',
  'sentinel', 'optimize', 'le', 'la', 'les', 'de', 'des', 'du', 'et', 'un', 'une', 'pour', 'dans',
])

/**
 * Mots porteurs du titre, sans emoji, prefixe d'agent ni mots vides. Le
 * camelCase est coupe et le pluriel retire : « ShareButtons » et « share
 * buttons » sont le meme sujet.
 */
export function motsDuTitre(titre) {
  return new Set(
    String(titre)
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}+/gu, '')
      .split(/[^a-z0-9]+/)
      .map((m) => (m.length > 4 && m.endsWith('s') ? m.slice(0, -1) : m))
      .filter((m) => m.length > 2 && !MOTS_VIDES.has(m))
  )
}

function jaccard(a, b) {
  if (a.size === 0 || b.size === 0) return 0
  let commun = 0
  for (const m of a) if (b.has(m)) commun++
  return commun / (a.size + b.size - commun)
}

/**
 * Doublons : titres proches (Jaccard >= 0,5) ET au moins un fichier en commun.
 * Les deux conditions, pour ne pas fermer deux PR « accessibilite » qui
 * touchent des composants differents. Renvoie Map(numero -> numero garde).
 * On garde la meilleure du groupe : CI verte et fusionnable d'abord, puis la
 * plus recente.
 */
export function doublons(prs) {
  const parent = new Map(prs.map((p) => [p.number, p.number]))
  const racine = (n) => (parent.get(n) === n ? n : racine(parent.get(n)))
  const mots = new Map(prs.map((p) => [p.number, motsDuTitre(p.title)]))
  for (let i = 0; i < prs.length; i++) {
    for (let j = i + 1; j < prs.length; j++) {
      const a = prs[i]
      const b = prs[j]
      const fichiersCommuns = a.files.some((f) => b.files.includes(f))
      if (fichiersCommuns && jaccard(mots.get(a.number), mots.get(b.number)) >= 0.5) {
        parent.set(racine(a.number), racine(b.number))
      }
    }
  }
  const groupes = new Map()
  for (const p of prs) {
    const r = racine(p.number)
    if (!groupes.has(r)) groupes.set(r, [])
    groupes.get(r).push(p)
  }
  const score = (p) => (p.ci === 'verte' ? 2 : 0) + (p.mergeable === true ? 1 : 0)
  const resultat = new Map()
  for (const groupe of groupes.values()) {
    if (groupe.length < 2) continue
    const garde = [...groupe].sort((x, y) => score(y) - score(x) || y.number - x.number)[0]
    for (const p of groupe) if (p.number !== garde.number) resultat.set(p.number, garde.number)
  }
  return resultat
}

/**
 * Etat de la CI d'un commit, depuis les check-runs et les statuts.
 * 'verte' | 'rouge' | 'en_cours' | 'absente'.
 */
export function etatCi(checkRuns, statuts) {
  const echecs = ['failure', 'cancelled', 'timed_out', 'action_required', 'startup_failure']
  if (checkRuns.some((c) => echecs.includes(c.conclusion)) || statuts.some((s) => s.state === 'failure' || s.state === 'error')) {
    return 'rouge'
  }
  if (checkRuns.some((c) => c.status !== 'completed') || statuts.some((s) => s.state === 'pending')) return 'en_cours'
  if (checkRuns.length === 0 && statuts.length === 0) return 'absente'
  return 'verte'
}

/**
 * Recommandation pour une PR deja enrichie ({ number, title, ci, mergeable,
 * files, additions, deletions }). null = rien a proposer pour l'instant (CI en
 * cours, fusionnabilite pas encore calculee par GitHub).
 */
export function recommander(pr, gardeDe) {
  const taille = `${pr.files.length} fichier${pr.files.length > 1 ? 's' : ''}, +${pr.additions}/−${pr.deletions}`
  if (gardeDe) {
    return { action: 'fermer', statut: 'waiting_validation', raison: `doublon de #${gardeDe}` }
  }
  if (pr.files.length === 0) {
    return { action: 'fermer', statut: 'waiting_validation', raison: 'PR vide : aucun fichier modifie' }
  }
  if (pr.ci === 'rouge') return { action: 'aucune', statut: 'blocked', raison: 'CI rouge' }
  if (pr.ci === 'en_cours' || pr.mergeable === null || pr.mergeable === undefined) return null
  if (pr.mergeable === false) {
    return { action: 'aucune', statut: 'blocked', raison: 'conflit avec main : Jules doit rebaser' }
  }
  const sensibles = fichiersSensibles(pr.files)
  if (sensibles.length > 0) {
    return { action: 'aucune', statut: 'blocked', raison: `fichiers sensibles (${sensibles.slice(0, 3).join(', ')}) : relecture sur GitHub` }
  }
  if (pr.ci === 'absente') {
    return { action: 'fusionner', statut: 'waiting_validation', raison: `aucune CI ne couvre ces fichiers, ${taille}` }
  }
  return { action: 'fusionner', statut: 'waiting_validation', raison: `CI verte, ${taille}` }
}

/** Libelle court de la tache, lisible dans le resume du Cerveau (90 caracteres). */
export function libelle(pr, reco) {
  const verbe = { fusionner: 'Fusionner', fermer: 'Fermer', aucune: 'À revoir' }[reco.action]
  return `${verbe} PR #${pr.number} (Jules) — ${reco.raison} — ${pr.title}`
}
