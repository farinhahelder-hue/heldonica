export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { safeEqual } from '@/lib/safe-equal'

// Bearer-only auth — le Brain Poller n'a pas de session navigateur, donc
// x-cms-auth est explicitement exclu ici.

async function requireBearerOnly(req: Request): Promise<NextResponse | null> {
  const bridgeToken = process.env.BRAIN_BRIDGE_TOKEN?.trim() || null

  if (!bridgeToken) {
    return NextResponse.json(
      { error: 'BRAIN_BRIDGE_TOKEN not configured' },
      { status: 503 }
    )
  }

  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const candidate = authHeader.slice('Bearer '.length)
    const valid = await safeEqual(candidate, bridgeToken)
    if (valid) return null
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

let _cached: ReturnType<typeof createClient> | null = null
function supabase() {
  if (!_cached) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
    _cached = (url && key) ? createClient(url, key) : null
  }
  return _cached
}

/**
 * `/api/brain/status` declare le Brain hors ligne au-dela de 120 s sans
 * `last_seen`. On garde donc une marge : au plus 90 s sans ecriture, meme si
 * l'etat ne bouge pas. Le seuil est cote serveur (ici), pas cote Brain, pour
 * que les deux ne puissent pas diverger.
 */
const FRAICHEUR_MAX_MS = 90_000

/** Arrondit les mesures pour qu'un bruit de virgule flottante ne compte pas. */
function signature(v: {
  cpu_percent?: unknown; ram_percent?: unknown; ollama_running?: unknown
  active_model?: unknown; active_tasks?: unknown
}): string {
  const arrondi = (x: unknown) =>
    typeof x === 'number' ? Math.round(x / 5) * 5 : x ?? null
  return JSON.stringify([
    arrondi(v.cpu_percent),
    arrondi(v.ram_percent),
    v.ollama_running ?? null,
    v.active_model ?? null,
    v.active_tasks ?? null,
  ])
}

type BattementPrecedent = {
  cpu_percent?: unknown; ram_percent?: unknown; ollama_running?: unknown
  active_model?: unknown; active_tasks?: unknown; at: number
}

/** Lit le battement precedent. Un echec de lecture ne bloque pas l'ecriture. */
async function lirePrecedent(sb: ReturnType<typeof createClient>): Promise<BattementPrecedent | null> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (sb.from('site_settings') as any)
    .select('value')
    .eq('key', 'brain_heartbeat')
    .maybeSingle()

  if (error || !data?.value) return null

  try {
    const parse = typeof data.value === 'string' ? JSON.parse(data.value) : data.value
    const at = parse?.last_seen ? Date.parse(parse.last_seen) : NaN
    if (!Number.isFinite(at)) return null
    return { ...parse, at }
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  const authResponse = await requireBearerOnly(req)
  if (authResponse) return authResponse

  const sb = supabase()
  if (!sb) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  const body = await req.json()
  const { cpu_percent, ram_percent, ollama_running, active_model, active_tasks } = body

  const maintenant = new Date().toISOString()
  const precedent = await lirePrecedent(sb)

  // Le battement est un état, pas un journal : on n'écrit que si l'état a
  // change, ou si la fraîcheur de `last_seen` risque de faire passer le Brain
  // hors ligne. Écrire à chaque battement réécrivait la ligne et ses deux
  // index toutes les minutes, pour une valeur identique — c'était 57 % des
  // blocs écrits de la base, mesuré sur pg_stat_statements le 21/10/2026.
  const nouveau = { cpu_percent, ram_percent, ollama_running, active_model, active_tasks }
  const ecrire =
    !precedent ||
    signature(nouveau) !== signature(precedent) ||
    Date.now() - precedent.at > FRAICHEUR_MAX_MS

  if (!ecrire) return NextResponse.json({ ok: true, ecrit: false })

  const value = JSON.stringify({ ...nouveau, last_seen: maintenant })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (sb.from('site_settings') as any)
    .upsert([{ key: 'brain_heartbeat', value }], { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, ecrit: true })
}
