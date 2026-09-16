import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireCmsAuth } from '@/lib/cms-auth'
import { rateLimit, getClientIp } from '@/lib/rate-limit'
import { HELDONICA_B2C_PROMPT, validateGardeFous } from '@/lib/brand-voice'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * Copilote Heldonica — une route, deux familles de modes.
 *
 * Les modes 1/2/3 sont le coach ADHD/TSA d'origine : une seule action, un
 * temps estime, une version energie basse. Les modes d'ecriture produisent un
 * contenu public (legende, story, article, newsletter) dans la voix Heldonica ;
 * chaque texte passe ensuite par validateGardeFous et le resultat du controle
 * est renvoye tel quel — un score affiche doit correspondre a une mesure.
 *
 * Chaque generation est gardee dans `copilot_generations` (migration
 * 20260916100000) : l'ecran n'en montre qu'une a la fois, et une generation
 * fermee par erreur ne se retrouve pas autrement.
 */

const MODEL = 'gemini-2.5-flash'

const COACH_PROMPT = `Tu es le copilote Heldonica, adapté à un fonctionnement ADHD/TSA.

Règles :
1. Ne jamais donner une liste longue.
2. Proposer une seule action utile maintenant.
3. Estimer le temps : 5, 15 ou 30 minutes.
4. Décrire le premier geste exact à faire.
5. Proposer une version "énergie basse" si je n'arrive pas à faire l'action complète.

Si l'utilisateur dit "Mode 1", aide-le à créer du contenu (blog, carrousel, Reel, CMS, recycle).
Si l'utilisateur dit "Mode 2", aide-le à piloter son travail (démarrage, planification, déblocage, bilan).
Si l'utilisateur dit "Mode 3", aide-le à faire avancer le site (dev, audit, check, nettoyage).

Ne demande pas de choisir entre plusieurs choses.
Si une tâche implique un risque pour la production, Supabase ou Vercel, prépare un plan mais attends la validation avant toute modification.`

const MODES_COACH = ['1', '2', '3'] as const

/**
 * Ce que le Copilote recoit pour ecrire : des notes de terrain, jamais un
 * brief marketing. La regle d'or vaut aussi pour l'IA : ce qui n'est pas dans
 * les notes n'existe pas, et se marque [À TOI] plutot que de s'inventer.
 */
const PREAMBULE_ECRITURE = `${HELDONICA_B2C_PROMPT}

## CE QUE TU REÇOIS
Des notes de terrain du duo : le lieu, ce qu'on y a vécu, des détails vus, entendus, touchés.
Tu n'ajoutes AUCUN fait absent des notes. Prix, horaire, nom propre, date, distance, saison : s'ils ne sont pas dans les notes, écris [À TOI : ce qu'il faut préciser] à la place.
Pas d'introduction, pas de commentaire sur ta réponse, pas de « voici » : uniquement le texte demandé.`

type ModeEcriture = 'instagram' | 'story' | 'blog' | 'newsletter'

const MODES_ECRITURE: Record<
  ModeEcriture,
  { consigne: string; maxOutputTokens: number; controle: 'complet' | 'essentiel' }
> = {
  instagram: {
    consigne: `## FORMAT : LÉGENDE INSTAGRAM (fil, photo ou carrousel)
- 80 à 150 mots, phrases courtes, texte aéré (une ligne vide entre les idées).
- Première ligne = accroche vécue : elle s'affiche seule avant « plus », elle doit tenir debout.
- Un détail sensoriel concret (matière, son, lumière, odeur), une nuance honnête.
- Termine par une question douce en « tu ».
- Ligne vide, puis 4 à 6 hashtags sobres dont #slowtravel et #heldonica.
- Un ou deux emoji au plus, jamais en rafale.`,
    maxOutputTokens: 2500,
    controle: 'essentiel',
  },
  story: {
    consigne: `## FORMAT : STORY INSTAGRAM (15 secondes de lecture)
Le résultat a exactement deux parties, dans cet ordre, toutes deux obligatoires :
1. Le texte à poser sur l'image : 1 à 3 lignes, 25 mots maximum au total. Une phrase vécue ou un détail sensoriel, rien d'autre.
2. Une dernière ligne qui commence par « Sticker : » — soit une question fermée à deux choix pour un sticker sondage (« X ou Y ? »), soit une invitation douce (« dis-le nous en message »). Jamais « glisse vers le haut », jamais « clique ».
Aucun hashtag, aucun emoji.`,
    maxOutputTokens: 2000,
    controle: 'essentiel',
  },
  blog: {
    consigne: `## FORMAT : ARTICLE DE BLOG — CARNET DE ROUTE (Markdown)
- Un titre H1 sans mot banni, qui dit le lieu et une chose vécue.
- Les 5 points de la structure B2C en sections H2 courtes, dans cet ordre : l'accroche vécue ; l'histoire humaine et le contexte ; le détail sensoriel testé sur le terrain ; les infos pratiques ; « Ce qu'on a moins aimé » et le verdict.
- Infos pratiques en liste à puces, une donnée par ligne (adresse, accès, saison, prix, durée) — chaque donnée absente des notes en [À TOI : …].
- 500 à 800 mots. Phrases courtes, une idée par paragraphe : le texte doit être extractible tel quel par un moteur de recherche ou une IA.
- Termine par une ligne « Méta description : » de 150 caractères maximum, en « on » / « tu ».`,
    maxOutputTokens: 8192,
    controle: 'complet',
  },
  newsletter: {
    consigne: `## FORMAT : EMAIL DE NEWSLETTER
- Ligne 1 : « Objet : » — 45 caractères maximum, sans mot banni, sans majuscules criardes, sans point d'exclamation.
- Ligne 2 : « Pré-en-tête : » — une phrase qui complète l'objet.
- Puis le corps : 150 à 250 mots, UNE seule histoire vécue, un détail sensoriel, une nuance honnête.
- Un seul appel doux à la fin (lire le carnet, répondre à cet email, nous suivre) — jamais deux.
- Signature : « Le duo Heldonica ».`,
    maxOutputTokens: 3000,
    controle: 'complet',
  },
}

function estModeEcriture(m: string): m is ModeEcriture {
  return m in MODES_ECRITURE
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY
  if (!url || !key) return null
  return createClient(url, key)
}

/**
 * Le controle de voix, restreint a ce qui a un sens pour le format.
 *
 * validateGardeFous est calibre pour un article : E-E-A-T, reperes GEO,
 * section « moins aime ». Appliquer ces sept points a une story de 25 mots
 * donnerait 40 % a un texte parfait — un chiffre faux affiche avec assurance.
 * Pour les formats courts on ne garde que les deux regles dures : pronoms et
 * mots bannis. Le score n'est renvoye que quand les sept points s'appliquent.
 */
function controlerVoix(texte: string, niveau: 'complet' | 'essentiel') {
  const v = validateGardeFous(texte, 'b2c')
  const ids = niveau === 'complet' ? Object.keys(v.checks) : ['pronouns', 'forbidden']
  const checks = ids
    .filter((id) => id in v.checks)
    .map((id) => ({ id, ...v.checks[id] }))
  const essentielOk = v.checks.pronouns.ok && v.checks.forbidden.ok
  return {
    niveau,
    score: niveau === 'complet' ? v.score : null,
    passed: niveau === 'complet' ? v.passed : essentielOk,
    forbiddenFound: v.forbiddenFound,
    checks,
  }
}

export async function POST(req: NextRequest) {
  const authErr = await requireCmsAuth(req)
  if (authErr) return authErr
  if (!rateLimit(getClientIp(req), 10, 60_000)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY manquante (Vercel Env)' }, { status: 503 })
  }

  let body: { mode?: string; message?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON invalide' }, { status: 400 })
  }

  const mode = body.mode?.trim() ?? ''
  const message = body.message?.trim() ?? ''

  const coach = (MODES_COACH as readonly string[]).includes(mode)
  if (!coach && !estModeEcriture(mode)) {
    return NextResponse.json(
      { error: 'Mode requis : 1, 2, 3, instagram, story, blog ou newsletter' },
      { status: 400 }
    )
  }
  if (!message) {
    return NextResponse.json({ error: 'Message requis' }, { status: 400 })
  }
  if (message.length > 6000) {
    return NextResponse.json({ error: 'Message trop long (6000 caractères max)' }, { status: 400 })
  }

  const prompt = coach
    ? `${COACH_PROMPT}\n\nMode ${mode} — ${message}`
    : `${PREAMBULE_ECRITURE}\n\n${MODES_ECRITURE[mode as ModeEcriture].consigne}\n\n## NOTES DE TERRAIN\n${message}`
  const maxOutputTokens = coach ? 2500 : MODES_ECRITURE[mode as ModeEcriture].maxOutputTokens

  let text: string
  try {
    // Import dynamique pour éviter d'exploser le build si la lib manque
    const { GoogleGenerativeAI } = await import('@google/generative-ai')
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: MODEL })

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      // 2.5 Flash raisonne avant d'ecrire et ses tokens de raisonnement
      // comptent dans la sortie : a 600 une story sortait tronquee apres
      // « Sticker : ». Les limites sont donc larges pour des textes courts.
      generationConfig: { temperature: coach ? 0.7 : 0.6, maxOutputTokens },
    })

    text = result.response.text().trim()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[gemini-gallery] error:', msg)
    return NextResponse.json({ error: 'Gemini a échoué: ' + msg }, { status: 502 })
  }

  if (!text) {
    return NextResponse.json({ error: 'Réponse vide de Gemini' }, { status: 502 })
  }

  const controle = coach ? null : controlerVoix(text, MODES_ECRITURE[mode as ModeEcriture].controle)

  // Historique. Une insertion refusee n'empeche pas de rendre le texte, mais
  // elle se dit : `enregistre: false` plutot qu'un historique qui a des trous
  // sans que personne ne sache pourquoi.
  let enregistre = false
  const sb = getSupabase()
  if (sb) {
    const { error } = await sb.from('copilot_generations').insert({
      mode,
      prompt: message,
      result: text,
      provider: 'gemini',
      model: MODEL,
      score: controle?.score ?? null,
      forbidden_found: controle?.forbiddenFound ?? [],
    })
    if (error) {
      console.error('[gemini-gallery] historique non enregistré :', error.code, error.message)
    } else {
      enregistre = true
    }
  }

  return NextResponse.json({ reply: text, controle, enregistre })
}

/** GET ?limit=10 — les dernieres generations, la plus recente d'abord. */
export async function GET(req: NextRequest) {
  const authErr = await requireCmsAuth(req)
  if (authErr) return authErr

  const sb = getSupabase()
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 })

  const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get('limit')) || 10))
  const mode = req.nextUrl.searchParams.get('mode')?.trim()

  let requete = sb
    .from('copilot_generations')
    .select('id, mode, prompt, result, score, forbidden_found, created_at')
    .order('created_at', { ascending: false })
    .limit(limit)
  if (mode) requete = requete.eq('mode', mode)

  const { data, error } = await requete
  if (error) {
    // Table absente : la migration n'est pas encore appliquee. PostgREST
    // repond PGRST205 (schema cache), Postgres en direct 42P01. Le panneau le
    // dit en clair au lieu d'afficher un historique vide.
    if (error.code === 'PGRST205' || error.code === '42P01') {
      return NextResponse.json({
        generations: [],
        indisponible: 'Historique pas encore en base : migration 20260916100000_copilot_generations à appliquer.',
      })
    }
    console.error('[gemini-gallery] lecture historique :', error.message)
    return NextResponse.json({ error: 'Lecture de l’historique refusée par la base' }, { status: 500 })
  }

  return NextResponse.json({ generations: data ?? [] })
}
