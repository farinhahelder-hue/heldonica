#!/usr/bin/env node
/**
 * Client d'essai : lance le serveur en enfant, comme le ferait Claude Code,
 * Gemini CLI ou OpenCode, et exerce les cinq outils.
 *
 *   node test-client.mjs            # lecture seule + tentatives d'ecriture
 *
 * Il depose une tache d'essai clairement marquee, puis la supprime lui-meme
 * par PostgREST — le serveur n'a volontairement pas d'outil de suppression.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ICI = dirname(fileURLToPath(import.meta.url))
const RACINE = resolve(ICI, '..', '..')
for (const l of readFileSync(resolve(RACINE, '.env.local'), 'utf8').split(/\r?\n/)) {
  const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}

const transport = new StdioClientTransport({
  command: process.execPath,
  args: [resolve(ICI, 'server.mjs')],
  env: { ...process.env, AGENT_NAME: 'claude' },
  stderr: 'pipe',
})
const client = new Client({ name: 'essai', version: '0.0.1' })
await client.connect(transport)

const appel = async (name, args) => {
  const r = await client.callTool({ name, arguments: args })
  const txt = r.content?.[0]?.text ?? ''
  return { isError: !!r.isError, txt }
}
const ok = (cond, msg) => console.log(`${cond ? '  ✓' : '  ✗'} ${msg}`)

// 1. Les outils sont bien la
const outils = (await client.listTools()).tools.map((t) => t.name).sort()
console.log('outils :', outils.join(', '))
ok(outils.length === 5, '5 outils exposes')

// 2. Lecture
let r = await appel('taches_en_attente', { agent: 'discord-bot' })
ok(!r.isError && r.txt.includes('aec21f21'), 'taches_en_attente voit la tache aec21f21 (discord-bot)')

r = await appel('lire_tache', { id: 'aec21f21' })
ok(!r.isError && r.txt.includes('!tache'), 'lire_tache resout un prefixe et rend la description')

// 3. Prendre — doit refuser : la tache est adressee a discord-bot, pas a claude
r = await appel('prendre_tache', { id: 'aec21f21' })
ok(r.isError && /adressée à discord-bot/.test(r.txt), `prendre_tache refuse une tache d'un autre agent : ${r.txt.slice(0, 70)}`)

// 4. Deposer une tache d'essai, puis tenter de la prendre
r = await appel('deposer_tache', { agent: 'claude', task: 'ESSAI-MCP-A-SUPPRIMER : verifier le serveur', scope: 'infra' })
ok(!r.isError, `deposer_tache : ${r.txt.replace(/\s+/g, ' ').slice(0, 90)}`)
const idEssai = JSON.parse(r.txt).deposee.id

r = await appel('prendre_tache', { id: idEssai, branch: 'agent/claude/essai-mcp' })
if (r.isError && /migration/.test(r.txt)) {
  ok(true, `prendre_tache dit clairement que la migration manque : ${r.txt.slice(0, 80)}…`)
} else {
  ok(!r.isError, `prendre_tache : ${r.txt.replace(/\s+/g, ' ').slice(0, 90)}`)
  // 5. Rendre compte — refuse un done sans verifie
  r = await appel('rendre_compte', { id: idEssai, status: 'done', actions_done: { corrige: ['rien'] } })
  ok(r.isError && /verifie/.test(r.txt), 'rendre_compte refuse `done` sans `verifie`')
  r = await appel('rendre_compte', { id: idEssai, status: 'done', actions_done: { corrige: ['rien'], verifie: ['essai'] } })
  ok(!r.isError, 'rendre_compte accepte `done` avec `verifie`')
}

// 6. Nettoyage direct : le serveur n'a pas d'outil de suppression, c'est voulu.
const toutes = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/agent_tasks?select=id&task=like.ESSAI-MCP-A-SUPPRIMER*`, {
  headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
}).then((x) => x.json())
for (const t of toutes) {
  await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/agent_tasks?id=eq.${t.id}`, {
    method: 'DELETE',
    headers: { apikey: process.env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
  })
}
ok(true, `nettoyage : ${toutes.length} tache(s) d'essai supprimee(s)`)

await client.close()
