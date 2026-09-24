import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { generateAiCompletion } from '@/lib/ai-provider'
import { validateGardeFous } from '@/lib/brand-voice'
import { ajoutsParRapportA, LIBELLES_AJOUT } from '@/lib/revendications'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Tes diapositives → une légende Instagram. La source, c'est le texte des
// diapositives — les mots de l'autrice. Avant le 21/09/2026, sans clé OpenAI
// (absente en production), cette route rendait un gabarit : « Découvrez {sujet}
// à travers notre dernier carrousel ✨ Vous y trouverez nos meilleurs
// conseils, nos découvertes secrètes… » — du vide, avec « vous » et
// « conseils », pour n'importe quel carrousel.

const SOURCE_MIN = 40

function nombres(texte: string): string[] {
  return (texte.match(/\d+(?:[.,]\d+)?/g) || []).map((n) => n.replace(',', '.'))
}

function slug(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

/** Hashtags déterministes : la marque, la destination si donnée, ceux du réglage. Aucun inventé. */
function hashtags(destination: string, defaults: string): string[] {
  const liste = ['#slowtravel', '#heldonica']
  const d = slug(destination)
  if (d) liste.push(`#${d}`)
  for (const t of defaults.split(/\s+/)) if (t.startsWith('#') && t.length > 1) liste.push(t.toLowerCase())
  return [...new Set(liste)].slice(0, 12)
}

function consigne(interdits: string[]): string {
  return `Écris la légende Instagram d'un carrousel à partir du TEXTE DES DIAPOSITIVES ci-dessous.

LA RÈGLE QUI PRIME : tu n'ajoutes RIEN qui ne soit dans ce texte.
- Aucun lieu, chiffre, prix, horaire, durée, nom, sensation (odeur, son, goût, texture, température) absent du texte. Aucun dialogue ni réplique entre guillemets qui ne soit dans le texte.
- Tu reprends les mots de l'autrice ; tu relies, tu ne brodes pas.
- Voix : « on » pour le duo, « tu » pour le lecteur. Jamais « je », « nous », « vous », « les voyageurs ».
- Aucun mot de ceux-ci : pépite, incontournable, bon plan, must-see, paradis, magnifique, splendide, incroyable, inoubliable, spot, découvrez, plongez, swipe.
- Pas de point d'exclamation, pas d'emoji, pas d'appel à l'action (« lien en bio », « abonne-toi »).
- 3 à 5 phrases, 50 à 90 mots. Termine par une question douce ou une observation suspendue, au « tu ».
- Pas de hashtags dans le texte : ils sont ajoutés à part.
${interdits.length ? `- INTERDIT (chiffres absents du texte que tu avais ajoutés) : ${interdits.join(', ')}.\n` : ''}
Réponds UNIQUEMENT en JSON : {"caption":"…"}`
}

function lireCaption(brut: string): string {
  const nettoye = brut.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  try {
    return String(JSON.parse(nettoye)?.caption ?? '').trim()
  } catch {
    const m = nettoye.match(/\{[\s\S]*\}/)
    if (m) {
      try {
        return String(JSON.parse(m[0])?.caption ?? '').trim()
      } catch {
        /* texte brut ci-dessous */
      }
    }
    return nettoye.replace(/^"|"$/g, '').trim()
  }
}

export async function POST(request: NextRequest) {
  const refus = await requireCmsAuth(request)
  if (refus) return refus

  const body = await request.json().catch(() => ({}))
  const slides: { title?: string; content?: string }[] = Array.isArray(body.slides) ? body.slides : []
  const destination = String(body.destination ?? '')
  const defaults = String(body.defaultHashtags ?? '')

  const source = slides
    .map((s) => `${String(s.title ?? '').trim()}\n${String(s.content ?? '').trim()}`.trim())
    .filter(Boolean)
    .join('\n\n')

  if (source.length < SOURCE_MIN) {
    return NextResponse.json(
      { success: false, error: 'Écris d’abord les diapositives : la légende se fait avec leurs mots, pas avec un sujet.' },
      { status: 400 }
    )
  }

  const dansSource = new Set(nombres(source))
  let caption = ''
  let interdits: string[] = []
  let fournisseur = ''
  try {
    for (let essai = 0; essai < 2; essai++) {
      const result = await generateAiCompletion({
        messages: [
          { role: 'system', content: consigne(interdits) },
          { role: 'user', content: `TEXTE DES DIAPOSITIVES :\n---\n${source}\n---` },
        ],
        temperature: 0.3,
        max_tokens: 500,
        jsonMode: true,
      })
      fournisseur = `${result.provider}/${result.model}`
      caption = lireCaption(result.content)
      const ajoutes = nombres(caption).filter((n) => !dansSource.has(n))
      if (!ajoutes.length) break
      interdits = [...new Set(ajoutes)]
    }
  } catch (e) {
    const raison = e instanceof Error ? e.message : String(e)
    console.error('carousel-caption — fournisseur IA:', raison)
    return NextResponse.json({ success: false, error: `L'assistant ne répond pas : ${raison}` }, { status: 502 })
  }

  if (!caption) {
    return NextResponse.json({ success: false, error: "L'assistant n'a rien rendu d'exploitable. Réessaie." }, { status: 502 })
  }

  const ajoutsRestants = [
    ...new Set(nombres(caption).filter((n) => !dansSource.has(n))),
    ...ajoutsParRapportA(caption, source).map((a) => `${LIBELLES_AJOUT[a.type]} : ${a.mot}`),
  ]
  if (ajoutsRestants.length) {
    caption = `[À TOI : la légende contient ce que les diapositives ne disent pas (${ajoutsRestants.join(', ')}) — corrige-la]\n${caption}`
  }
  const voix = validateGardeFous(caption, 'b2c')
  const tags = hashtags(destination, defaults)

  return NextResponse.json({
    success: true,
    caption,
    hashtags: tags,
    stats: { captionLength: caption.length, hashtagCount: tags.length },
    meta: { fournisseur, voix: { score: voix.score, mots_bannis: voix.forbiddenFound }, ajouts_non_sources: ajoutsRestants },
  })
}
