#!/usr/bin/env node
// ============================================================
// Revue des PR de Jules — le Cerveau trie, le fondateur valide d'un geste.
//
// Lance toutes les 15 min par .github/workflows/revue-jules.yml, ou a la main :
//   node scripts/revue-jules.mjs --essai   # n'ecrit rien : affiche le tri
//
// Trois temps, dans cet ordre, a chaque passage :
//   1. Executer ce que le fondateur a valide (statut `done`) : fusionner ou
//      fermer — apres avoir reverifie que la PR n'a pas bouge depuis la
//      proposition (meme commit, toujours fusionnable, CI toujours verte).
//   2. Classer ce qu'il a renvoye, et ce qui est devenu obsolete (PR fermee ou
//      nouveau commit) : rien n'est fait, la trace reste.
//   3. Proposer pour chaque PR ouverte de Jules qui n'a pas encore de
//      proposition pour son commit courant.
//
// Les propositions sont des taches `agent_tasks` adressees a `fondateur`,
// scope `revue-jules`, payload { source, pr, head_sha, action }. Le Cerveau du
// Poco les montre dans « A valider » ; « valide #id » passe la tache en `done`
// (action `valider` de /api/agent-tasks, reservee au fondateur).
//
// Environnement : GITHUB_TOKEN, GITHUB_REPOSITORY (owner/repo),
// NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
// ============================================================

import { estPrDeJules, doublons, etatCi, recommander, libelle } from './revue-jules-regles.mjs'

const ESSAI = process.argv.includes('--essai')
const REPO = process.env.GITHUB_REPOSITORY || 'farinhahelder-hue/heldonica'
const GH = process.env.GITHUB_TOKEN
const SB_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '')
const SB_CLE = process.env.SUPABASE_SERVICE_ROLE_KEY
const SCOPE = 'revue-jules'

if (!GH) {
  console.error('GITHUB_TOKEN manquant')
  process.exit(2)
}
if (!ESSAI && (!SB_URL || !SB_CLE)) {
  console.error('NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requis (ou --essai)')
  process.exit(2)
}

async function gh(chemin, init = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${chemin}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${GH}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  })
  const texte = await res.text()
  const json = texte ? JSON.parse(texte) : null
  if (!res.ok) throw new Error(`GitHub ${init.method || 'GET'} ${chemin} : HTTP ${res.status} ${json?.message || ''}`)
  return json
}

async function sb(chemin, init = {}) {
  const res = await fetch(`${SB_URL}/rest/v1/${chemin}`, {
    ...init,
    headers: {
      apikey: SB_CLE,
      Authorization: `Bearer ${SB_CLE}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(init.headers || {}),
    },
  })
  const texte = await res.text()
  if (!res.ok) throw new Error(`Supabase ${init.method || 'GET'} ${chemin} : HTTP ${res.status} ${texte.slice(0, 200)}`)
  return texte ? JSON.parse(texte) : null
}

async function toutesLesPages(chemin) {
  const tout = []
  for (let page = 1; page <= 10; page++) {
    const lot = await gh(`${chemin}${chemin.includes('?') ? '&' : '?'}per_page=100&page=${page}`)
    tout.push(...lot)
    if (lot.length < 100) break
  }
  return tout
}

async function ciDuCommit(sha) {
  const [runs, statut] = await Promise.all([
    gh(`/commits/${sha}/check-runs?per_page=100`),
    gh(`/commits/${sha}/status`),
  ])
  return etatCi(runs.check_runs || [], statut.statuses || [])
}

/** PR enrichie de ce que le tri regarde. `mergeable` est calcule par GitHub a la demande : null au premier appel. */
async function enrichir(numero) {
  let pr = await gh(`/pulls/${numero}`)
  if (pr.mergeable === null && pr.state === 'open') {
    await new Promise((r) => setTimeout(r, 3000))
    pr = await gh(`/pulls/${numero}`)
  }
  const fichiers = await toutesLesPages(`/pulls/${numero}/files`)
  return {
    number: pr.number,
    title: pr.title,
    state: pr.state,
    draft: pr.draft === true,
    head_sha: pr.head.sha,
    mergeable: pr.mergeable,
    additions: pr.additions,
    deletions: pr.deletions,
    files: fichiers.map((f) => f.filename),
    ci: await ciDuCommit(pr.head.sha),
    url: pr.html_url,
  }
}

async function majTache(id, corps) {
  if (ESSAI) return
  await sb(`agent_tasks?id=eq.${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...corps, updated_at: new Date().toISOString() }),
  })
}

function clore(t, resultat, verifie) {
  return majTache(t.id, {
    status: 'done',
    payload: { ...t.payload, executee: { at: new Date().toISOString(), resultat } },
    actions_done: { verifie },
  })
}

// --- 1 et 2 : executer, classer -----------------------------------------------
async function traiterLesDecisions(propositions) {
  for (const t of propositions) {
    const p = t.payload || {}
    if (p.executee) continue
    const renvoyee = t.status === 'sent' && /renvoyee par le fondateur/.test(t.notes || '')
    if (renvoyee) {
      console.log(`↩︎ PR #${p.pr} : refusée par le fondateur, rien fait`)
      await clore(t, 'refusee', ['refusée par le fondateur : aucune action sur la PR'])
      continue
    }
    if (t.status !== 'done') continue

    const pr = await enrichir(p.pr)
    if (pr.state !== 'open') {
      await clore(t, 'obsolete', [`PR #${p.pr} déjà ${pr.state} : rien fait`])
      continue
    }
    if (pr.head_sha !== p.head_sha) {
      // Jules a pousse depuis la proposition : on ne fusionne pas un code que personne n'a vu.
      await clore(t, 'obsolete', [`nouveau commit sur #${p.pr} depuis la proposition : rien fait, une nouvelle proposition suivra`])
      continue
    }
    if (p.action === 'fusionner') {
      if (pr.mergeable !== true || pr.ci === 'rouge' || pr.ci === 'en_cours') {
        await clore(t, 'refusee_par_controle', [`#${p.pr} n'est plus fusionnable (mergeable=${pr.mergeable}, CI ${pr.ci}) : rien fait`])
        continue
      }
      if (ESSAI) {
        console.log(`[essai] fusionnerait #${p.pr}`)
        continue
      }
      const r = await gh(`/pulls/${p.pr}/merge`, {
        method: 'PUT',
        body: JSON.stringify({
          sha: p.head_sha,
          commit_title: `Merge PR #${p.pr} (Jules) — validée depuis le Cerveau`,
        }),
      })
      console.log(`✓ #${p.pr} fusionnée (${r.sha})`)
      await clore(t, 'fusionnee', [`PR #${p.pr} fusionnée sur main, commit ${r.sha}`])
    } else if (p.action === 'fermer') {
      if (ESSAI) {
        console.log(`[essai] fermerait #${p.pr}`)
        continue
      }
      await gh(`/issues/${p.pr}/comments`, {
        method: 'POST',
        body: JSON.stringify({ body: `Fermée par le Cerveau Heldonica, sur validation du fondateur : ${p.raison}.` }),
      })
      await gh(`/pulls/${p.pr}`, { method: 'PATCH', body: JSON.stringify({ state: 'closed' }) })
      console.log(`✓ #${p.pr} fermée (${p.raison})`)
      await clore(t, 'fermee', [`PR #${p.pr} fermée : ${p.raison}`])
    } else {
      await clore(t, 'rien_a_faire', ['proposition sans action : rien fait'])
    }
  }
}

// --- 3 : proposer -------------------------------------------------------------
async function proposer(propositions) {
  const ouvertes = (await toutesLesPages('/pulls?state=open')).filter(estPrDeJules)
  const dejaVues = new Set(propositions.map((t) => `${t.payload?.pr}@${t.payload?.head_sha}`))
  console.log(`${ouvertes.length} PR de Jules ouvertes`)

  // Une proposition en attente devient obsolete si la PR est fermee ou a bouge.
  const shaCourant = new Map(ouvertes.map((p) => [p.number, p.head.sha]))
  for (const t of propositions) {
    if (t.payload?.executee || !['waiting_validation', 'blocked'].includes(t.status)) continue
    if (shaCourant.get(t.payload?.pr) !== t.payload?.head_sha) {
      await clore(t, 'obsolete', [`PR #${t.payload?.pr} fermée ou modifiée depuis la proposition`])
    }
  }

  const enrichies = []
  for (const p of ouvertes) enrichies.push(await enrichir(p.number))
  const gardes = doublons(enrichies)

  const nouvelles = []
  for (const pr of enrichies) {
    if (dejaVues.has(`${pr.number}@${pr.head_sha}`)) continue
    const reco = recommander(pr, gardes.get(pr.number))
    if (!reco) {
      console.log(`… #${pr.number} : pas encore décidable (CI ${pr.ci}, mergeable=${pr.mergeable})`)
      continue
    }
    console.log(`${reco.action.padEnd(9)} #${pr.number} — ${reco.raison} — ${pr.title.slice(0, 60)}`)
    nouvelles.push({
      agent: 'fondateur',
      task: libelle(pr, reco),
      repo: 'heldonica',
      status: reco.statut,
      scope: SCOPE,
      risk_level: reco.action === 'fusionner' ? 'medium' : 'low', // agent_tasks_risk_check
      description: `${pr.url}\n${reco.raison}`,
      notes: `proposee par la revue des PR de Jules le ${new Date().toISOString().slice(0, 16)}`,
      payload: { source: SCOPE, pr: pr.number, head_sha: pr.head_sha, action: reco.action, raison: reco.raison, url: pr.url },
    })
  }
  if (nouvelles.length > 0 && !ESSAI) {
    await sb('agent_tasks', { method: 'POST', body: JSON.stringify(nouvelles) })
  }
  const compte = (a) => nouvelles.filter((n) => n.payload.action === a).length
  console.log(
    `\n${nouvelles.length} proposition(s)${ESSAI ? ' [essai : rien écrit]' : ''} : ` +
      `${compte('fusionner')} à fusionner, ${compte('fermer')} à fermer, ${compte('aucune')} à revoir`
  )
}

const propositions = ESSAI && !SB_CLE ? [] : await sb(`agent_tasks?scope=eq.${SCOPE}&select=id,status,notes,payload&limit=2000`)
await traiterLesDecisions(propositions)
await proposer(propositions)
