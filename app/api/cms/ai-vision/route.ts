import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { verifyAiAuth } from '@/lib/ai-auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { GEMINI_MODEL } from '@/lib/ai-provider';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SYSTEM_PROMPT = `Tu es la voix éditoriale d'Heldonica (média et concepteur de voyages slow travel en duo).
Notre regard sur le voyage est singulier : il est porté par une sensibilité neuroatypique (TSA), attentive aux micro-détails sensoriels et tangibles que la plupart des gens traversent sans remarquer.

RÈGLES ÉDITORIALES & REGARD SENSORIEL (TSA) :
1. LA SOURCE — CE QUI PRIME SUR TOUT :
- Les NOTES de l'autrice, si elles sont données plus bas, sont la seule source du vécu : ce qu'on a fait, ressenti, entendu, goûté. Reprends-les, resserre-les, ne les contredis pas.
- L'IMAGE ne donne que ce qui est visible : matières, lumière, couleurs, objets, lieu, absence ou présence de gens. Décris-la avec précision (le grain du bois, la pierre, les reflets, la découpe des ombres, le lin froissé).
- N'AJOUTE RIEN : aucune sensation non visible (son, odeur, toucher, goût, température), aucune action du duo (« on s'est posés », « on a pris le temps ») qui ne soit dans les notes, aucun nom de lieu, aucun chiffre, aucune heure absents des notes et de l'image.
- Sans notes : décris ce que la photo montre, sans raconter ce que le duo a fait, et termine par exactement « [À TOI : ce que tu as ressenti là] ».

2. ÉMETTEUR DUO (« on » exclusif) :
- Le duo s'exprime toujours par « on » — et seulement pour ce que les notes racontent.
- Ne dis JAMAIS « je », « nous », « nos », « notre équipe », « la rédaction ».

3. DESTINATAIRE (« tu ») :
- Tutoiement direct et complice (« tu »), comme une note intime partagée dans un carnet de route.

4. MOTS STRICTEMENT BANNIS (zéro tolérance) :
- Clichés d'influenceurs et superlatifs interdits : pépite, pépites, incontournable, incontournables, bon plan, bons plans, must-see, must-have, paradis, paradisiaque, magnifique, splendide, incroyable, magique, merveilleux, spot.
- Tics de langage IA bannis : plongez dans, laissez-vous emporter, au cœur de, véritable havre de paix, cocon, n'attends plus, embarquez.
- Pas d'exclamation artificielle ni d'enthousiasme forcé. Ton calme, posé, sincère, reposant.

5. FORMAT DE SORTIE :
- Légende courte et aérée (3 à 5 phrases, 50 à 75 mots environ).
- Termine par une question douce ou une observation suspendue en tutoiement ("tu").
- 4 hashtags sobres dont obligatoirement #slowtravel et #heldonica.

Réponds UNIQUEMENT en JSON valide avec ce schéma :
{
  "caption": "Le texte de la légende (sans les hashtags)",
  "hashtags": ["#slowtravel", "#heldonica", "#...", "#..."],
  "fullText": "Le texte complet de la légende suivi des hashtags"
}`;

export async function POST(req: NextRequest) {
  if (!rateLimit(getClientIp(req), 30, 60_000)) {
    return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 });
  }

  // Supporte à la fois les clés API agents (x-api-key) et la session CMS
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
    let base64Image = '';
    let mimeType = 'image/jpeg';
    let placeTitle = '';
    let notes = '';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      base64Image = (body.image || '').replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      mimeType = body.mimeType || 'image/jpeg';
      placeTitle = body.placeTitle || '';
      notes = String(body.notes || '');
    } else if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('image') as File | null;
      placeTitle = (form.get('place_title') as string) || '';
      notes = (form.get('notes') as string) || '';
      if (!file) {
        return NextResponse.json({ error: 'Aucun fichier image fourni' }, { status: 400 });
      }
      const buffer = Buffer.from(await file.arrayBuffer());
      base64Image = buffer.toString('base64');
      mimeType = file.type || 'image/jpeg';
    } else {
      return NextResponse.json({ error: 'Format non supporté (JSON ou FormData attendu)' }, { status: 400 });
    }

    if (!base64Image) {
      return NextResponse.json({ error: 'Image requise pour analyse visuelle' }, { status: 400 });
    }

    const blocs = [SYSTEM_PROMPT];
    if (placeTitle.trim()) blocs.push(`Lieu indiqué par l'autrice : ${placeTitle.trim()}.`);
    blocs.push(
      notes.trim()
        ? `NOTES DE L'AUTRICE (la seule source du vécu) :\n---\n${notes.trim()}\n---\nÉcris la légende à partir de ces notes et de ce que la photo montre.`
        : `Aucune note : décris ce que la photo montre, sans inventer ce que le duo a fait, et termine par [À TOI : ce que tu as ressenti là].`
    );
    const promptText = blocs.join('\n\n');

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: promptText },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 1500,
          responseMimeType: 'application/json',
          // Gemini 2.5 « réfléchit » avant d'écrire et ces jetons se décomptent
          // de maxOutputTokens : la légende revenait coupée au milieu du JSON
          // (mesuré le 21/09/2026). Décrire une photo n'a rien à résoudre.
          thinkingConfig: { thinkingBudget: 0 },
        }
      }),
      signal: AbortSignal.timeout(50_000)
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[ai-vision] Erreur Gemini:', geminiRes.status, errText);
      return NextResponse.json({ error: `Erreur API Vision (${geminiRes.status})` }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawOutput = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    let parsed: { caption?: string; hashtags?: unknown; fullText?: string };
    try {
      parsed = JSON.parse(rawOutput);
    } catch {
      // JSON coupé net (sortie tronquée) : on récupère au moins la valeur de
      // « caption » plutôt que de renvoyer le JSON brut comme légende.
      const objet = rawOutput.match(/\{[\s\S]*\}/);
      const valeur = rawOutput.match(/"caption"\s*:\s*"((?:[^"\\]|\\.)*)/);
      if (objet) {
        try {
          parsed = JSON.parse(objet[0]);
        } catch {
          parsed = { caption: valeur ? JSON.parse(`"${valeur[1]}"`) : rawOutput };
        }
      } else {
        parsed = { caption: valeur ? JSON.parse(`"${valeur[1]}"`) : rawOutput };
      }
    }

    const hashtagsList = Array.isArray(parsed.hashtags)
      ? parsed.hashtags
      : ['#slowtravel', '#heldonica', '#voyagerlentement'];

    const caption = parsed.caption || parsed.fullText || '';
    const fullText = parsed.fullText || `${caption}\n\n${hashtagsList.join(' ')}`;

    return NextResponse.json({
      success: true,
      caption,
      hashtags: hashtagsList,
      fullText
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[ai-vision] Exception:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
