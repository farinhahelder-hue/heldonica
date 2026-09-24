export const dynamic = 'force-dynamic'
export const maxDuration = 60

import { NextRequest, NextResponse } from 'next/server'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'
import {
  buildArticleSemanticText,
  buildDestinationSemanticText,
  generateEmbeddingsBatch,
} from '@/lib/ai-embeddings'

// Vectorisation des destinations et des articles pour /api/ai/search.
//
// Le contenu vit dans Supabase, la mécanique ici : chaque nuit, tout ce qui
// n'a pas de vecteur ou a été modifié depuis la dernière fenêtre est replongé
// avec les mêmes constructeurs de passage que la recherche (lib/ai-embeddings).
// `?force=1` régénère tout — nécessaire si le modèle, la dimension ou le
// taskType change, sinon les vecteurs en base et ceux des requêtes divergent.
//
// Écrire `embedding` ne touche pas `updated_at` (aucun trigger sur ces tables),
// donc la fenêtre ne se rappelle pas elle-même le lendemain.

// Fenêtre de fraîcheur : cron quotidien à 07:00, on prend 26 h pour couvrir un
// décalage d'exécution.
const FENETRE_HEURES = 26
const LIMITE_DEFAUT = 100

function isCron(req: NextRequest) {
  const auth = req.headers.get('Authorization')
  return auth === `Bearer ${process.env.CRON_SECRET}` && !!process.env.CRON_SECRET
}

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } })
}

type Bilan = { candidats: number; vectorises: number; echecs: string[] }

// Format d'entrée du type pgvector : '[0.1,0.2,…]'.
function versVector(vec: number[]): string {
  return `[${vec.join(',')}]`
}

async function vectoriser(
  sb: SupabaseClient,
  table: 'destinations' | 'cms_blog_posts',
  colonnes: string,
  construire: (row: any) => string,
  force: boolean,
  limite: number
): Promise<Bilan> {
  const bilan: Bilan = { candidats: 0, vectorises: 0, echecs: [] }

  let requete = sb.from(table).select(colonnes).order('updated_at', { ascending: false }).limit(limite)
  if (!force) {
    const depuis = new Date(Date.now() - FENETRE_HEURES * 3600 * 1000).toISOString()
    requete = requete.or(`embedding.is.null,updated_at.gte.${depuis}`)
  }

  const { data: rows, error } = await requete
  if (error) {
    bilan.echecs.push(`lecture ${table} : ${error.message}`)
    return bilan
  }
  if (!rows || rows.length === 0) return bilan

  bilan.candidats = rows.length
  const vecteurs = await generateEmbeddingsBatch(rows.map(construire))

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i] as any
    const vec = vecteurs[i]
    const libelle = row.slug || String(row.id)
    if (!vec) {
      bilan.echecs.push(`${libelle} : embedding non produit`)
      continue
    }
    const { error: errMaj } = await sb.from(table).update({ embedding: versVector(vec) }).eq('id', row.id)
    if (errMaj) {
      bilan.echecs.push(`${libelle} : ${errMaj.message}`)
      continue
    }
    bilan.vectorises++
  }

  return bilan
}

export async function GET(req: NextRequest) {
  if (!isCron(req)) {
    const authResponse = await requireCmsAuth(req as any)
    if (authResponse) return authResponse
  }

  const sb = getSupabase()
  if (!sb) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })
  }
  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json({ error: 'GEMINI_API_KEY non configurée' }, { status: 503 })
  }

  const force = req.nextUrl.searchParams.get('force') === '1'
  const limiteParam = Number(req.nextUrl.searchParams.get('limit'))
  const limite = Number.isFinite(limiteParam) && limiteParam > 0 ? Math.min(limiteParam, 500) : LIMITE_DEFAUT
  const debut = Date.now()

  const destinations = await vectoriser(
    sb,
    'destinations',
    'id, slug, title, country, region, travel_style, excerpt, intro_narrative, local_insider_tips, tags, itinerary, updated_at',
    buildDestinationSemanticText,
    force,
    limite
  )
  const articles = await vectoriser(
    sb,
    'cms_blog_posts',
    'id, slug, title, category, excerpt, content, tags, updated_at',
    buildArticleSemanticText,
    force,
    limite
  )

  const echecs = destinations.echecs.length + articles.echecs.length
  return NextResponse.json(
    {
      mode: force ? 'force' : `manquants ou modifiés depuis ${FENETRE_HEURES} h`,
      destinations,
      articles,
      duree_ms: Date.now() - debut,
    },
    // Un échec partiel se voit dans les logs Vercel du cron, pas seulement dans le corps.
    { status: echecs > 0 ? 207 : 200 }
  )
}

export async function POST(req: NextRequest) { return GET(req) }
