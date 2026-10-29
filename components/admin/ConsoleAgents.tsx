'use client'

// ============================================================
// ConsoleAgents — le poste de pilotage du suivi des agents
//
// Trois vues, dans l'ordre où on les consulte :
//
//   1. « À valider » — les tâches qui attendent un geste HUMAIN. C'est la file
//      qui débloque le travail : tant qu'une tâche y est, l'agent attend.
//   2. « Fil d'activité » — le journal `agent_task_events`, la vérité système.
//      Filtrable par agent et par type d'événement.
//   3. « Gouvernance » — la vue agrégée `v_agent_governance`, qui existait en
//      base depuis le 2026-09-03 sans lecteur.
//
// La fiche d'une tâche (PR, commit, timeline) s'ouvre depuis le fil ou la file.
//
// Aucune écriture ici : valider ou renvoyer se fait dans l'app Android, qui
// porte le geste du fondateur. Cette console observe ; elle ne tranche pas.
// ============================================================

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  GitBranch,
  GitCommit,
  GitPullRequest,
  ListChecks,
  RefreshCw,
  ShieldCheck,
  X,
} from 'lucide-react'

type Evenement = {
  id: string
  task_id: string | null
  agent: string | null
  event_type: string
  from_status: string | null
  to_status: string | null
  payload: Record<string, unknown> | null
  created_at: string
}

type Tache = {
  id: string
  agent: string
  task: string
  scope: string | null
  branch: string | null
  pr_url: string | null
  commit_sha: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

type LigneGouvernance = {
  agent: string | null
  scope: string | null
  risk_level: string | null
  status: string | null
  nb_tasks: number
  derniere_action: string | null
  taches_terminees: number
  en_attente_validation: number
  taches_risquees: number
}

type Reponse = {
  evenements: Evenement[]
  gouvernance: LigneGouvernance[]
  a_valider: Tache[]
}

/** Les libellés lisibles des types d'événement du trigger. */
const LIBELLES_EVENEMENT: Record<string, string> = {
  etat_initial: 'Amorçage',
  depose: 'Déposée',
  prise: 'Prise',
  statut: 'Statut',
  compte_rendu: 'Compte rendu',
  validation: 'Validation',
  edition: 'Édition',
  suppression: 'Suppression',
}

const COULEUR_STATUT: Record<string, string> = {
  sent: 'bg-stone-100 text-stone-700 border-stone-300',
  in_progress: 'bg-amber-50 text-amber-800 border-amber-300',
  waiting_validation: 'bg-violet-50 text-violet-800 border-violet-300',
  blocked: 'bg-red-50 text-red-800 border-red-300',
  done: 'bg-emerald-50 text-emerald-800 border-emerald-300',
}

function dateCourte(iso: string | null): string {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function BadgeStatut({ statut }: { statut: string | null }) {
  if (!statut) return <span className="text-stone-400">—</span>
  const classe = COULEUR_STATUT[statut] ?? 'bg-stone-100 text-stone-700 border-stone-300'
  return (
    <span className={`inline-block rounded border px-1.5 py-0.5 text-[11px] font-medium ${classe}`}>
      {statut}
    </span>
  )
}

/** La timeline d'une tâche : ses événements, du plus ancien au plus récent. */
function TimelineTache({ evenements }: { evenements: Evenement[] }) {
  if (evenements.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        Aucun événement journalisé pour cette tâche.
      </p>
    )
  }
  return (
    <ol className="space-y-2">
      {evenements.map((e) => (
        <li key={e.id} className="flex gap-3 text-sm">
          <span className="w-28 shrink-0 text-stone-500">{dateCourte(e.created_at)}</span>
          <span className="w-28 shrink-0 font-medium text-stone-800">
            {LIBELLES_EVENEMENT[e.event_type] ?? e.event_type}
          </span>
          <span className="text-stone-600">
            {(e.from_status ?? '—') + ' vers ' + (e.to_status ?? '—')}
          </span>
        </li>
      ))}
    </ol>
  )
}

export default function ConsoleAgents() {
  const [donnees, setDonnees] = useState<Reponse | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [chargement, setChargement] = useState(true)
  const [filtreType, setFiltreType] = useState('')
  const [filtreAgent, setFiltreAgent] = useState('')
  const [tacheOuverte, setTacheOuverte] = useState<Tache | null>(null)

  const charger = useCallback(async () => {
    setChargement(true)
    setErreur(null)
    try {
      const res = await fetch('/api/admin/agents/journal?limit=300', { cache: 'no-store' })
      const corps = await res.json().catch(() => null)
      if (!res.ok) {
        setErreur(corps?.detail ?? corps?.error ?? `Erreur HTTP ${res.status}`)
        setDonnees(null)
        return
      }
      setDonnees(corps as Reponse)
    } catch (e) {
      setErreur(e instanceof Error ? e.message : 'Réseau indisponible')
      setDonnees(null)
    } finally {
      setChargement(false)
    }
  }, [])

  useEffect(() => {
    void charger()
  }, [charger])

  const evenementsFiltres = useMemo(() => {
    if (!donnees) return []
    return donnees.evenements.filter((e) => {
      if (filtreType && e.event_type !== filtreType) return false
      if (filtreAgent && e.agent !== filtreAgent) return false
      return true
    })
  }, [donnees, filtreType, filtreAgent])

  const agentsConnus = useMemo(() => {
    if (!donnees) return []
    const s = new Set<string>()
    donnees.evenements.forEach((e) => {
      if (e.agent) s.add(e.agent)
    })
    return [...s].sort()
  }, [donnees])

  const typesConnus = useMemo(() => {
    if (!donnees) return []
    const s = new Set<string>()
    donnees.evenements.forEach((e) => s.add(e.event_type))
    return [...s].sort()
  }, [donnees])

  const evenementsTache = useMemo(() => {
    if (!donnees || !tacheOuverte) return []
    return donnees.evenements
      .filter((e) => e.task_id === tacheOuverte.id)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
  }, [donnees, tacheOuverte])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2 font-serif text-xl font-semibold text-mahogany">
            <Bot size={20} className="shrink-0" />
            Console des agents
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            Lecture du journal <code className="text-xs">agent_task_events</code> (vérité
            système) et de la vue <code className="text-xs">v_agent_governance</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void charger()}
          disabled={chargement}
          className="flex items-center gap-2 rounded border border-stone-300 bg-white px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-50 disabled:opacity-50"
        >
          <RefreshCw size={14} className={chargement ? 'animate-spin' : ''} />
          Recharger
        </button>
      </div>

      {erreur && (
        <div className="flex items-start gap-2 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-medium">Lecture impossible</p>
            <p className="text-red-700">{erreur}</p>
          </div>
        </div>
      )}

      {chargement && !donnees && (
        <p className="text-sm text-stone-500">Chargement du journal…</p>
      )}

      {donnees && (
        <>
          {/* 1. File « À valider » */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-600">
              <ListChecks size={16} />
              À valider ({donnees.a_valider.length})
            </h3>
            {donnees.a_valider.length === 0 ? (
              <p className="text-sm text-stone-500">
                Aucune tâche n’attend de geste humain.
              </p>
            ) : (
              <ul className="space-y-2">
                {donnees.a_valider.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-start justify-between gap-4 rounded border border-stone-200 bg-white p-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-stone-800">{t.task}</p>
                      <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                        <span className="inline-flex items-center gap-1">
                          <Bot size={12} />
                          {t.agent}
                        </span>
                        {t.branch && (
                          <span className="inline-flex items-center gap-1">
                            <GitBranch size={12} />
                            {t.branch}
                          </span>
                        )}
                        {t.pr_url && (
                          <a
                            href={t.pr_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-mahogany hover:underline"
                          >
                            <GitPullRequest size={12} />
                            PR
                          </a>
                        )}
                        <span className="inline-flex items-center gap-1">
                          <Clock size={12} />
                          {dateCourte(t.updated_at)}
                        </span>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTacheOuverte(t)}
                      className="shrink-0 rounded border border-stone-300 px-2 py-1 text-xs text-stone-700 hover:bg-stone-50"
                    >
                      Détail
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* 2. Fil d'activité */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-600">
              <Activity size={16} />
              Fil d’activité ({evenementsFiltres.length})
            </h3>
            <div className="mb-3 flex flex-wrap gap-3">
              <label className="flex items-center gap-2 text-sm text-stone-600">
                Agent
                <select
                  value={filtreAgent}
                  onChange={(e) => setFiltreAgent(e.target.value)}
                  className="rounded border border-stone-300 bg-white px-2 py-1 text-sm"
                >
                  <option value="">tous</option>
                  {agentsConnus.map((a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-2 text-sm text-stone-600">
                Événement
                <select
                  value={filtreType}
                  onChange={(e) => setFiltreType(e.target.value)}
                  className="rounded border border-stone-300 bg-white px-2 py-1 text-sm"
                >
                  <option value="">tous</option>
                  {typesConnus.map((t) => (
                    <option key={t} value={t}>
                      {LIBELLES_EVENEMENT[t] ?? t}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="overflow-hidden rounded border border-stone-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Date</th>
                    <th className="px-3 py-2 font-medium">Événement</th>
                    <th className="px-3 py-2 font-medium">Agent</th>
                    <th className="px-3 py-2 font-medium">Transition</th>
                  </tr>
                </thead>
                <tbody>
                  {evenementsFiltres.slice(0, 200).map((e) => (
                    <tr key={e.id} className="border-t border-stone-100">
                      <td className="whitespace-nowrap px-3 py-2 text-stone-500">
                        {dateCourte(e.created_at)}
                      </td>
                      <td className="px-3 py-2 text-stone-800">
                        {LIBELLES_EVENEMENT[e.event_type] ?? e.event_type}
                      </td>
                      <td className="px-3 py-2 text-stone-600">{e.agent ?? '—'}</td>
                      <td className="px-3 py-2">
                        <span className="flex items-center gap-2">
                          <BadgeStatut statut={e.from_status} />
                          <span className="text-stone-400">vers</span>
                          <BadgeStatut statut={e.to_status} />
                        </span>
                      </td>
                    </tr>
                  ))}
                  {evenementsFiltres.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-3 py-4 text-center text-stone-500">
                        Aucun événement pour ce filtre.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. Gouvernance */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-stone-600">
              <ShieldCheck size={16} />
              Gouvernance ({donnees.gouvernance.length} lignes)
            </h3>
            <div className="overflow-x-auto rounded border border-stone-200 bg-white">
              <table className="w-full text-left text-sm">
                <thead className="bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
                  <tr>
                    <th className="px-3 py-2 font-medium">Agent</th>
                    <th className="px-3 py-2 font-medium">Périmètre</th>
                    <th className="px-3 py-2 font-medium">Risque</th>
                    <th className="px-3 py-2 font-medium">Statut</th>
                    <th className="px-3 py-2 font-medium text-right">Tâches</th>
                    <th className="px-3 py-2 font-medium text-right">Terminées</th>
                    <th className="px-3 py-2 font-medium text-right">À valider</th>
                  </tr>
                </thead>
                <tbody>
                  {donnees.gouvernance.map((g, i) => (
                    <tr key={`${g.agent}-${g.scope}-${g.status}-${i}`} className="border-t border-stone-100">
                      <td className="px-3 py-2 text-stone-800">{g.agent ?? '—'}</td>
                      <td className="px-3 py-2 text-stone-600">{g.scope ?? '—'}</td>
                      <td className="px-3 py-2 text-stone-600">{g.risk_level ?? '—'}</td>
                      <td className="px-3 py-2">
                        <BadgeStatut statut={g.status} />
                      </td>
                      <td className="px-3 py-2 text-right text-stone-700">{g.nb_tasks}</td>
                      <td className="px-3 py-2 text-right text-stone-700">
                        {g.taches_terminees}
                      </td>
                      <td className="px-3 py-2 text-right text-stone-700">
                        {g.en_attente_validation}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* Fiche tâche */}
      {tacheOuverte && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded border border-stone-200 bg-white p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="font-serif text-lg font-semibold text-mahogany">
                {tacheOuverte.task}
              </h3>
              <button
                type="button"
                onClick={() => setTacheOuverte(null)}
                className="shrink-0 rounded p-1 text-stone-500 hover:bg-stone-100"
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>
            <dl className="mb-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">Agent</dt>
                <dd className="text-stone-800">{tacheOuverte.agent}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">Périmètre</dt>
                <dd className="text-stone-800">{tacheOuverte.scope ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">Branche</dt>
                <dd className="break-all text-stone-800">{tacheOuverte.branch ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-stone-500">Commit</dt>
                <dd className="break-all font-mono text-xs text-stone-800">
                  {tacheOuverte.commit_sha ?? '—'}
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs uppercase tracking-wide text-stone-500">Pull request</dt>
                <dd>
                  {tacheOuverte.pr_url ? (
                    <a
                      href={tacheOuverte.pr_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-mahogany hover:underline"
                    >
                      <GitPullRequest size={14} />
                      {tacheOuverte.pr_url}
                    </a>
                  ) : (
                    <span className="text-stone-500">—</span>
                  )}
                </dd>
              </div>
            </dl>

            <h4 className="mb-2 flex items-center gap-2 text-sm font-semibold text-stone-700">
              <GitCommit size={14} />
              Timeline ({evenementsTache.length})
            </h4>
            <TimelineTache evenements={evenementsTache} />

            {evenementsTache.length === 0 && (
              <p className="mt-3 flex items-center gap-2 text-xs text-stone-500">
                <CheckCircle2 size={12} />
                La timeline vient du journal système ; une tâche sans événement n’a pas
                encore été modifiée depuis l’amorçage.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
