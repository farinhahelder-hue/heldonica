/**
 * Doublure Supabase partagée par les tests de propriété du pont Brain-CMS.
 *
 * Elle est volontairement *stateful* : les tests de propriété doivent observer
 * ce que la route a réellement écrit (payload inséré, lignes affectées par un
 * claim conditionnel), pas seulement le code de retour HTTP. Une doublure qui
 * renverrait toujours la même chose ne prouverait rien sur la modification.
 *
 * Elle est partagée entre fichiers via un `vi.mock` dont la fabrique importe ce
 * module : la même instance est donc vue par le mock et par le test.
 */
import { vi } from 'vitest'

export const sbState = {
  /** Réponse par défaut, hors simulation de claim atomique. */
  result: { data: null, error: null } as unknown,
  /** Lignes passées à `.insert()`, dans l'ordre. */
  inserted: [] as unknown[],
  /** Active la simulation « UPDATE … WHERE status='sent' » (1 seul gagnant). */
  claimAtomic: false,
  claimed: false,
}

export function resetSbState() {
  sbState.result = { data: null, error: null }
  sbState.inserted = []
  sbState.claimAtomic = false
  sbState.claimed = false
}

type Eq = [string, unknown]

function makeQuery() {
  const q: Record<string, unknown> = {}
  const eqs: Eq[] = []
  let op: string | null = null

  const resolve = () => {
    if (sbState.claimAtomic && op === 'update' && eqs.some(([c, v]) => c === 'status' && v === 'sent')) {
      if (!sbState.claimed) {
        sbState.claimed = true
        return { data: [{ id: 'claimed' }], error: null }
      }
      return { data: [], error: null }
    }
    return sbState.result
  }

  for (const m of ['select', 'order', 'range']) q[m] = () => q
  q.update = () => { op = 'update'; return q }
  q.insert = (rows: unknown) => {
    op = 'insert'
    sbState.inserted.push(...(Array.isArray(rows) ? rows : [rows]))
    return q
  }
  q.upsert = () => { op = 'upsert'; return q }
  q.eq = (col: string, val: unknown) => { eqs.push([col, val]); return q }
  q.single = async () => resolve()
  q.maybeSingle = async () => resolve()
  q.then = (onOk: (v: unknown) => unknown) => Promise.resolve(resolve()).then(onOk)
  return q
}

/** Appelée par la fabrique `vi.mock` ; espionnée pour prouver « aucun accès DB ». */
export const from = vi.fn(() => makeQuery())
