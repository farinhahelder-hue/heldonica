#!/usr/bin/env node
/**
 * Serveur MCP : le registre `agent_tasks`, pour tous les agents.
 *
 * Claude Code, Gemini CLI et OpenCode parlent MCP. Ce serveur leur donne les
 * memes cinq gestes sur la meme table — lire, prendre, rendre compte,
 * deposer — au lieu de trois colles differentes et d'un acces SQL brut.
 * Le protocole qu'il applique est dans AGENTS.md, section Coordination.
 *
 * Il tourne en enfant du client (transport stdio), sur le poste. La cle
 * service est lue dans l'environnement ou dans .env.local a la racine du
 * depot ; elle n'apparait dans aucune configuration de client.
 *
 * Chaque client se presente par AGENT_NAME (claude, gemini, opencode…).
 * Sans nom, on peut lire mais ni prendre, ni rendre compte, ni deposer :
 * pas de geste anonyme sur le registre.
 *
 * Il n'y a pas d'outil de suppression. C'est voulu.
 */

import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

// --- environnement ----------------------------------------------------------

const ICI = dirname(fileURLToPath(import.meta.url))
const RACINE = resolve(ICI, '..', '..')

// .env.local n'ecrase jamais une variable deja posee par le client : le
// client peut ainsi imposer AGENT_NAME sans toucher au fichier.
for (const nom of ['.env.local', '.env']) {
  const chemin = resolve(RACINE, nom)
  if (!existsSync(chemin)) continue
  for (const ligne of readFileSync(chemin, 'utf8').split(/\r?\n/)) {
    const m = ligne.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
    if (!m || process.env[m[1]] !== undefined) continue
    process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
  break
}

const URL_BASE = process.env.NEXT_PUBLIC_SUPABASE_URL
const CLE = process.env.SUPABASE_SERVICE_ROLE_KEY
const AGENT = (process.env.AGENT_NAME || '').trim().toLowerCase()

if (!URL_BASE || !CLE) {
  process.stderr.write(
    'agent-tasks : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquent ' +
      '(environnement ou .env.local a la racine du depot).\n'
  )
  process.exit(1)
}

const STATUTS = ['sent', 'in_progress', 'waiting_validation', 'blocked', 'done']
const AGENTS_CONNUS = ['claude', 'gemini', 'opencode', 'jules', 'muse-spark', 'discord-bot', 'tous']

// --- PostgREST ---------------------------------------------------------------

async function pg(chemin, { method = 'GET', body, prefer } = {}) {
  const entetes = {
    apikey: CLE,
    Authorization: `Bearer ${CLE}`,
    'Content-Type': 'application/json',
  }
  if (prefer) entetes.Prefer = prefer
  const r = await fetch(`${URL_BASE}/rest/v1/${chemin}`, {
    method,
    headers: entetes,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const texte = await r.text()
  let donnees = null
  try {
    donnees = texte ? JSON.parse(texte) : null
  } catch {
    donnees = texte
  }
  if (!r.ok) {
    const message = donnees?.message || (typeof donnees === 'string' ? donnees : r.statusText)
    // Une colonne absente veut presque toujours dire : migration non appliquee.
    if (/column .* does not exist/i.test(message)) {
      throw new Error(
        `${message} — la migration supabase/migrations/20260911120000_agent_tasks_coordination.sql ` +
          `n'est probablement pas appliquee.`
      )
    }
    throw new Error(`PostgREST ${r.status} : ${message}`)
  }
  return donnees
}

// Un identifiant peut etre donne entier ou par ses premiers caracteres, comme
// on les cite dans les conversations. On resout parmi les taches non closes,
// puis parmi toutes si besoin.
async function resoudreId(fragment) {
  const f = String(fragment).trim().toLowerCase()
  if (/^[0-9a-f-]{36}$/.test(f)) return f
  if (!/^[0-9a-f]{4,}$/.test(f)) throw new Error(`identifiant illisible : ${fragment}`)
  const toutes = await pg('agent_tasks?select=id,status&order=created_at.desc&limit=500')
  const candidats = toutes.filter((t) => t.id.startsWith(f))
  if (candidats.length === 0) throw new Error(`aucune tache ne commence par ${f}`)
  if (candidats.length > 1) throw new Error(`${candidats.length} taches commencent par ${f} — precise`)
  return candidats[0].id
}

function exigerAgent() {
  if (!AGENT) {
    throw new Error(
      'AGENT_NAME manque : ce serveur doit savoir qui parle. ' +
        'Pose-le dans la configuration MCP du client (claude, gemini, opencode…).'
    )
  }
  return AGENT
}

function texte(obj) {
  return { content: [{ type: 'text', text: typeof obj === 'string' ? obj : JSON.stringify(obj, null, 2) }] }
}

function erreur(e) {
  return { isError: true, content: [{ type: 'text', text: `Refus : ${e.message}` }] }
}

function resume(t) {
  return {
    id: t.id.slice(0, 8),
    agent: t.agent,
    status: t.status,
    claimed_by: t.claimed_by ?? null,
    task: t.task,
    scope: t.scope ?? null,
    created_at: t.created_at?.slice(0, 16),
  }
}

// --- serveur ---------------------------------------------------------------------

const serveur = new McpServer({ name: 'heldonica-agent-tasks', version: '0.1.0' })

serveur.registerTool(
  'taches_en_attente',
  {
    title: 'Tâches en attente',
    description:
      "Liste les tâches `sent` (personne ne les a prises) et `in_progress` (prises, fichiers réservés). " +
      "Filtre par agent si demandé ; inclut toujours celles adressées à `tous`. À appeler en début de session.",
    inputSchema: {
      agent: z.string().optional().describe("Nom d'agent : claude, gemini, opencode… Vide = toutes."),
    },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ agent }) => {
    try {
      let q = 'agent_tasks?select=id,agent,status,claimed_by,task,scope,created_at&status=in.(sent,in_progress)&order=created_at.asc'
      if (agent) q += `&or=(agent.eq.${encodeURIComponent(agent.toLowerCase())},agent.eq.tous)`
      const rows = await pg(q)
      return texte({ nombre: rows.length, taches: rows.map(resume) })
    } catch (e) {
      return erreur(e)
    }
  }
)

serveur.registerTool(
  'lire_tache',
  {
    title: 'Lire une tâche',
    description:
      "La tâche entière : description, actions_done, files_modified, risque, dépendance. " +
      "L'identifiant peut être donné par ses premiers caractères. À lire avant de prendre.",
    inputSchema: { id: z.string().describe('UUID complet ou ses premiers caractères (≥ 4)') },
    annotations: { readOnlyHint: true, openWorldHint: false },
  },
  async ({ id }) => {
    try {
      const uuid = await resoudreId(id)
      const [t] = await pg(`agent_tasks?select=*&id=eq.${uuid}`)
      if (!t) throw new Error('tâche introuvable')
      return texte(t)
    } catch (e) {
      return erreur(e)
    }
  }
)

serveur.registerTool(
  'prendre_tache',
  {
    title: 'Prendre une tâche',
    description:
      "Passe une tâche `sent` en `in_progress` et pose ton nom dans claimed_by. À faire AVANT la première " +
      "modification. Refuse si la tâche n'est plus `sent` ou si un autre agent l'a déjà prise : on ne la lui " +
      "retire pas — on dépose une suite avec depends_on.",
    inputSchema: {
      id: z.string().describe('UUID ou ses premiers caractères'),
      branch: z.string().optional().describe('Branche de travail, forme agent/<nom>/<slug>'),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async ({ id, branch }) => {
    try {
      const moi = exigerAgent()
      const uuid = await resoudreId(id)
      const [avant] = await pg(`agent_tasks?select=id,status,agent,claimed_by,task&id=eq.${uuid}`)
      if (!avant) throw new Error('tâche introuvable')
      if (avant.claimed_by && avant.claimed_by !== moi) {
        throw new Error(`déjà prise par ${avant.claimed_by} — dépose une suite avec depends_on plutôt que de la reprendre`)
      }
      if (avant.status !== 'sent' && avant.claimed_by !== moi) {
        throw new Error(`statut ${avant.status}, pas \`sent\` — elle n'est plus à prendre`)
      }
      if (avant.agent && avant.agent !== 'tous' && avant.agent !== moi) {
        throw new Error(`adressée à ${avant.agent}, pas à ${moi}`)
      }
      // Le filtre status=eq.sent rend la prise atomique cote base : si un
      // autre agent a ete plus rapide, zero ligne est modifiee.
      const corps = { status: 'in_progress', claimed_by: moi, claimed_at: new Date().toISOString(), updated_at: new Date().toISOString() }
      if (branch) corps.branch = branch
      const rows = await pg(`agent_tasks?id=eq.${uuid}&or=(status.eq.sent,claimed_by.eq.${moi})`, {
        method: 'PATCH',
        body: corps,
        prefer: 'return=representation',
      })
      if (!rows || rows.length === 0) throw new Error('quelqu’un a été plus rapide : la tâche n’est plus `sent`')
      return texte({ prise: resume(rows[0]), rappel: 'Une tâche, une branche. Rends compte avec rendre_compte quand c’est fait ET vérifié.' })
    } catch (e) {
      return erreur(e)
    }
  }
)

serveur.registerTool(
  'rendre_compte',
  {
    title: 'Rendre compte',
    description:
      "Clore ou suspendre une tâche que TU as prise. `done` veut dire fait ET vérifié — si tu n'as pas mesuré, " +
      "mets `waiting_validation` et dis ce qu'il reste à mesurer. actions_done suit la forme d'AGENTS.md : " +
      "corrige / verifie / non_verifie / reste_a_faire.",
    inputSchema: {
      id: z.string().describe('UUID ou ses premiers caractères'),
      status: z.enum(['waiting_validation', 'blocked', 'done']),
      actions_done: z
        .object({
          corrige: z.array(z.string()).optional(),
          verifie: z.array(z.string()).optional(),
          non_verifie: z.array(z.string()).optional(),
          reste_a_faire: z.array(z.string()).optional(),
        })
        .passthrough()
        .describe('Ce qui a été fait, mesuré, pas mesuré, et ce qui reste — avec les commits.'),
      description: z.string().optional().describe('Remplace la description ; commencer par ce qui manque si waiting_validation.'),
      files_modified: z.array(z.string()).optional(),
      notes: z.string().optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  },
  async ({ id, status, actions_done, description, files_modified, notes }) => {
    try {
      const moi = exigerAgent()
      const uuid = await resoudreId(id)
      if (status === 'done' && !(actions_done.verifie && actions_done.verifie.length > 0)) {
        throw new Error('`done` sans rien dans `verifie` : dis ce que tu as mesuré, ou mets `waiting_validation`')
      }
      const corps = { status, actions_done, updated_at: new Date().toISOString() }
      if (description !== undefined) corps.description = description
      if (files_modified !== undefined) corps.files_modified = files_modified
      if (notes !== undefined) corps.notes = notes
      // Seul celui qui a pris la tache la clot : le filtre claimed_by le garantit.
      const rows = await pg(`agent_tasks?id=eq.${uuid}&claimed_by=eq.${moi}`, {
        method: 'PATCH',
        body: corps,
        prefer: 'return=representation',
      })
      if (!rows || rows.length === 0) {
        throw new Error(`cette tâche n'est pas prise par ${moi} — on ne clôt pas la tâche d'un autre`)
      }
      return texte({ close: resume(rows[0]) })
    } catch (e) {
      return erreur(e)
    }
  }
)

serveur.registerTool(
  'deposer_tache',
  {
    title: 'Déposer une tâche',
    description:
      "Crée une tâche `sent` pour un autre agent (ou `tous`). C'est ainsi qu'on demande quelque chose à Claude, " +
      "Gemini, OpenCode ou au bot Discord sans toucher à leurs fichiers. Pose depends_on si elle suit une tâche existante.",
    inputSchema: {
      agent: z.string().describe(`Destinataire : ${AGENTS_CONNUS.join(', ')}`),
      task: z.string().min(8).describe('Titre — une phrase qui dit le résultat attendu'),
      description: z.string().optional().describe('Le contexte, ce qui est vérifié, ce qui ne doit PAS être fait'),
      scope: z.string().optional().describe('cms, content, infra, mobile, produit, schema, security…'),
      depends_on: z.string().optional().describe('UUID (ou préfixe) de la tâche qui doit être done avant'),
      risk_level: z.enum(['low', 'medium', 'high']).optional(),
    },
    annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false },
  },
  async ({ agent, task, description, scope, depends_on, risk_level }) => {
    try {
      const moi = exigerAgent()
      const dest = agent.trim().toLowerCase()
      if (!AGENTS_CONNUS.includes(dest)) {
        throw new Error(`agent inconnu : ${dest}. Connus : ${AGENTS_CONNUS.join(', ')}`)
      }
      const corps = {
        agent: dest,
        task,
        repo: 'heldonica',
        status: 'sent',
        scope: scope || 'a-qualifier',
        description: description || null,
        notes: `déposée par ${moi} via MCP le ${new Date().toISOString().slice(0, 16)}`,
      }
      if (risk_level) corps.risk_level = risk_level
      if (depends_on) corps.depends_on = await resoudreId(depends_on)
      const rows = await pg('agent_tasks', { method: 'POST', body: corps, prefer: 'return=representation' })
      return texte({ deposee: resume(rows[0]) })
    } catch (e) {
      return erreur(e)
    }
  }
)

// --- demarrage -------------------------------------------------------------------

const transport = new StdioServerTransport()
await serveur.connect(transport)
process.stderr.write(`agent-tasks : pret${AGENT ? ` — je suis ${AGENT}` : ' — AGENT_NAME non pose, lecture seule'}\n`)
