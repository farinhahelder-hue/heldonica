import { NextRequest, NextResponse } from 'next/server'
import { requireCmsAuth } from '@/lib/cms-auth'
import { generateAiCompletion } from '@/lib/ai-provider'
import { validateGardeFous } from '@/lib/brand-voice'
import { ajoutsParRapportA, LIBELLES_AJOUT } from '@/lib/revendications'
import { HELDONICA_TOKENS, SlideData } from '@/app/panel-manager/carousel/tokens'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

// Tes notes → des diapositives. Rien d'autre.
//
// Jusqu'au 21/09/2026 cette route fabriquait des slogans à trous (« Découvrez
// {sujet} avec Heldonica. Une expérience unique pour les voyageurs… ») dès que
// la clé OpenAI manquait — et elle manquait en production. Un « chat IA » avec
// des gabarits « Top {n} endroits » demandait d'inventer. Ici la seule source
// est ce que l'autrice a écrit : le modèle découpe et resserre, n'ajoute ni
// lieu, ni chiffre, ni sensation, et on le mesure au lieu de le croire.

const NOTES_MIN = 80
const DIAPOS_MIN = 2
const DIAPOS_MAX = 10

function generateId(): string {
  return `slide-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function nombres(texte: string): string[] {
  return (texte.match(/\d+(?:[.,]\d+)?/g) || []).map((n) => n.replace(',', '.'))
}

/** Les chiffres d'une diapositive qui ne sont pas dans les notes. */
function chiffresAjoutes(diapo: string, notes: string): string[] {
  const dansNotes = new Set(nombres(notes))
  return nombres(diapo).filter((n) => !dansNotes.has(n))
}

function consigne(nb: number, interdits: string[]): string {
  return `Découpe les NOTES ci-dessous en ${nb} diapositives Instagram.

LA RÈGLE QUI PRIME : tu n'ajoutes RIEN qui ne soit dans les notes.
- Aucun lieu, chiffre, prix, horaire, durée, nom, sensation (odeur, son, goût, texture, température) absent des notes. Aucun dialogue ni réplique entre guillemets qui ne soit dans les notes.
- Tu reprends les mots de l'autrice ; tu resserres, tu ne réécris pas son regard.
- Voix : « on » pour le duo, « tu » pour le lecteur. Jamais « je », « nous », « vous », « les voyageurs ».
- Aucun mot de ceux-ci : pépite, incontournable, bon plan, must-see, paradis, magnifique, splendide, incroyable, inoubliable, spot, découvrez, plongez.
- Pas de point d'exclamation, pas d'enthousiasme forcé, pas d'appel à l'action.
- Si les notes ne remplissent pas ${nb} diapositives, rends-en moins : jamais de remplissage.
${interdits.length ? `- INTERDIT (chiffres absents des notes que tu avais ajoutés) : ${interdits.join(', ')}.\n` : ''}
Chaque diapositive : "title" = 8 mots maximum, tiré des notes ; "content" = 30 mots maximum, tiré des notes.

Réponds UNIQUEMENT en JSON : {"slides":[{"title":"…","content":"…"}]}`
}

type DiapoBrute = { title?: string; content?: string }

function lireDiapos(brut: string): DiapoBrute[] {
  const nettoye = brut.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  try {
    const j = JSON.parse(nettoye)
    return Array.isArray(j?.slides) ? j.slides : []
  } catch {
    const m = nettoye.match(/\{[\s\S]*\}/)
    if (!m) return []
    try {
      const j = JSON.parse(m[0])
      return Array.isArray(j?.slides) ? j.slides : []
    } catch {
      return []
    }
  }
}

export async function POST(request: NextRequest) {
  const refus = await requireCmsAuth(request)
  if (refus) return refus

  const body = await request.json().catch(() => ({}))
  // « prompt » est l'ancien nom du champ ; on l'accepte, mais c'est bien des notes qu'il faut.
  const notes = String(body.notes ?? body.prompt ?? '').trim()
  const nb = Math.min(DIAPOS_MAX, Math.max(DIAPOS_MIN, Number(body.slideCount) || 5))

  if (notes.length < NOTES_MIN) {
    return NextResponse.json(
      {
        success: false,
        error: `Écris d'abord ce que tu as vécu, en vrac (au moins ${NOTES_MIN} caractères). L'assistant découpe et resserre ; il n'invente pas une diapositive.`,
      },
      { status: 400 }
    )
  }

  let diapos: DiapoBrute[] = []
  let interdits: string[] = []
  let fournisseur = ''
  try {
    for (let essai = 0; essai < 2; essai++) {
      const result = await generateAiCompletion({
        messages: [
          { role: 'system', content: consigne(nb, interdits) },
          { role: 'user', content: `NOTES :\n---\n${notes}\n---` },
        ],
        temperature: 0.3,
        max_tokens: 1200,
        jsonMode: true,
      })
      fournisseur = `${result.provider}/${result.model}`
      diapos = lireDiapos(result.content).filter((d) => (d.title || d.content || '').trim())
      const ajoutes = diapos.flatMap((d) => chiffresAjoutes(`${d.title ?? ''} ${d.content ?? ''}`, notes))
      if (!ajoutes.length) break
      interdits = [...new Set(ajoutes)]
    }
  } catch (e) {
    const raison = e instanceof Error ? e.message : String(e)
    console.error('carousel-generate — fournisseur IA:', raison)
    return NextResponse.json({ success: false, error: `L'assistant ne répond pas : ${raison}` }, { status: 502 })
  }

  if (!diapos.length) {
    return NextResponse.json({ success: false, error: "L'assistant n'a rien rendu d'exploitable. Réessaie, ou colle ton texte à droite : il se découpe sans IA." }, { status: 502 })
  }

  // Après le second essai, un chiffre encore absent des notes est signalé sur
  // la diapositive même : l'autrice le voit, elle ne le publie pas par mégarde.
  const tokens = HELDONICA_TOKENS
  const couleurs = [
    { bg: tokens.colors.background, text: tokens.colors.text },
    { bg: tokens.colors.primary, text: '#ffffff' },
    { bg: tokens.colors.secondary, text: tokens.colors.text },
    { bg: tokens.colors.accent, text: '#ffffff' },
    { bg: tokens.colors.backgroundAlt, text: tokens.colors.primary },
  ]
  const ajoutsRestants: string[] = []
  const slides: SlideData[] = diapos.slice(0, nb).map((d, i) => {
    const title = String(d.title ?? '').trim()
    let content = String(d.content ?? '').trim()
    const ajoutes = chiffresAjoutes(`${title} ${content}`, notes)
    if (ajoutes.length) {
      ajoutsRestants.push(...ajoutes)
      content = `[À TOI : cette diapositive contient un chiffre absent de tes notes (${ajoutes.join(', ')}) — corrige-la] ${content}`
    }
    const c = couleurs[i % couleurs.length]
    return { id: generateId(), title, content, backgroundColor: c.bg, textColor: c.text, fontSize: 'md' }
  })

  const texteDiapos = slides.map((s) => `${s.title}. ${s.content}`).join('\n')
  const voix = validateGardeFous(texteDiapos, 'b2c')
  const sensoriel = ajoutsParRapportA(texteDiapos, notes).map((a) => `${LIBELLES_AJOUT[a.type]} : ${a.mot}`)

  return NextResponse.json({
    success: true,
    slides,
    meta: {
      slideCount: slides.length,
      fournisseur,
      voix: { score: voix.score, mots_bannis: voix.forbiddenFound },
      ajouts_non_sources: [...new Set([...ajoutsRestants, ...sensoriel])],
    },
  })
}
