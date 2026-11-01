import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { verifyAiAuth } from '@/lib/ai-auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { GEMINI_MODEL } from '@/lib/ai-provider';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SYSTEM_PROMPT = `Tu es le réalisateur et directeur cinématique d'Heldonica (média slow travel) et de Memoria Imperium (histoire).
Ta mission est de concevoir un STORYBOARD CINÉMATIQUE en format vertical 9:16 (durée totale 12 à 18 secondes, 4 à 5 scènes courtes de 3 à 4s) adapté pour TikTok, Instagram Reels et YouTube Shorts.

RÈGLES ÉDITORIALES STRICTES :
1. TON SLOW TRAVEL & AUTHENTICITÉ :
- Privilégie les micro-détails sensoriels (grain du bois, réfraction de la lumière, lin froissé, buée, brume matinale).
- Mouvements de caméra lents et contemplatifs (slow pan, slow zoom, travelling avant).
- Zéro superlatif creux, zéro mot banni (pas de "pépite", "incontournable", "paradis", "magique", "splendide").
- Tutoiement complice ("tu") pour la narration ou texte à l'écran.

2. RECOMMANDATION MUSICALE HELDONICA :
Choisis la musique la plus adaptée parmi :
- "atrium_lin_brut" (guitare acoustique, matin calme, nature)
- "golden_hour_marbre" (piano feutré, jazz lounge, boutique hôtel)
- "echappee_slow_luxury" (nappes 432 Hz, grands espaces, altitude)
- "velours_noyer_fonce" (guitare folk, feu de bois, intimité)
- "baroque_lofi" (clavecin 415 Hz, réflexion, histoire)

RÉPONDS STRICTEMENT EN JSON VALIDE avec ce schéma :
{
  "titre": "Titre évocateur du court-métrage",
  "duree_totale_s": 15,
  "musique_recommandee": "atrium_lin_brut",
  "scenes": [
    {
      "numero": 1,
      "duree_s": 3,
      "mouvement_camera": "slow_zoom_in",
      "visuel": "Description très précise de ce que la caméra filme en 9:16",
      "texte_ecran": "Texte court ou voix-off sobre",
      "prompt_flow_optionnel": "Prompt en anglais optimisé pour Veo si l'utilisateur veut aussi tester sur Google Flow"
    }
  ],
  "accroche_partage": "Phrase d'accroche pour la publication"
}`;

export async function POST(req: NextRequest) {
  if (!rateLimit(getClientIp(req), 30, 60_000)) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  const auth = await verifyAiAuth(req);
  if (!auth.ok) {
    const refus = await requireCmsAuth(req);
    if (refus) return refus;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY non configurée' }, { status: 503 });
  }

  try {
    const body = await req.json();
    const sujet = String(body.sujet || body.topic || 'Voyage contemplatif au cœur de la nature');
    const lieu = String(body.lieu || '');
    const style = String(body.style || 'slow_travel');

    const promptUser = `Conçois le storyboard vertical 9:16 pour ce sujet :\nSujet : ${sujet}\nLieu : ${lieu || 'Non spécifié'}\nStyle : ${style}\nRespecte strictement la voix Heldonica.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${SYSTEM_PROMPT}\n\n${promptUser}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 2000,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 }
        }
      }),
      signal: AbortSignal.timeout(40_000)
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[ai-video-storyboard] Erreur Gemini:', geminiRes.status, errText);
      return NextResponse.json({ error: `Erreur API Gemini (${geminiRes.status})` }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawOutput = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const parsed = JSON.parse(rawOutput);

    return NextResponse.json({
      success: true,
      storyboard: parsed
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ai-video-storyboard] Exception:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
