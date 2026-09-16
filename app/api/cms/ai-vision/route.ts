import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const SYSTEM_PROMPT = `Tu es la voix éditoriale d'Heldonica (média et concepteur de voyages slow travel en duo).
Notre regard sur le voyage est singulier : il est porté par une sensibilité neuroatypique (TSA), attentive aux micro-détails sensoriels et tangibles que la plupart des gens traversent sans remarquer.

RÈGLES ÉDITORIALES & REGARD SENSORIEL (TSA) :
1. LE REGARD SUR L'IMAGE :
- Observe attentivement ce que montre la photo. Décris la matière réelle (le grain du bois, la pierre calcaire rugueuse, les reflets, la céramique artisanale, le lin froissé, la découpe des ombres, la texture des surfaces ou des ingrédients).
- Sensibilité TSA : relève les micro-détails qui ancrent dans le réel (sensations tactiles, acoustique apaisante suggérée comme un cliquetis feutré ou le souffle du vent, absence de foule ou d'agitation saturante, régularité des formes, authenticité du geste).
- Règle d'or absolue : « On n'invente rien. On raconte ce qu'on a vécu. » Ne mentionne AUCUN élément absent de l'image.

2. ÉMETTEUR DUO (« on » exclusif) :
- Le duo s'exprime toujours par « on » (« on s'est posés », « ce qui nous a marqués », « on a pris le temps »).
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

  const refus = await requireCmsAuth(req);
  if (refus) return refus;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY non configurée' }, { status: 503 });
  }

  try {
    let base64Image = '';
    let mimeType = 'image/jpeg';
    let placeTitle = '';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      base64Image = (body.image || '').replace(/^data:image\/[a-zA-Z+]+;base64,/, '');
      mimeType = body.mimeType || 'image/jpeg';
      placeTitle = body.placeTitle || '';
    } else if (contentType.includes('multipart/form-data')) {
      const form = await req.formData();
      const file = form.get('image') as File | null;
      placeTitle = (form.get('place_title') as string) || '';
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

    const promptText = placeTitle.trim()
      ? `${SYSTEM_PROMPT}\n\nIndication du lieu : ${placeTitle}. Raconte ce que la photo montre avec ce point d'ancrage.`
      : `${SYSTEM_PROMPT}\n\nRaconte ce que la photo montre avec un regard attentif et sensoriel.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
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
          temperature: 0.5,
          maxOutputTokens: 2500,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('[ai-vision] Erreur Gemini:', geminiRes.status, errText);
      return NextResponse.json({ error: `Erreur API Vision (${geminiRes.status})` }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawOutput = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';

    let parsed;
    try {
      parsed = JSON.parse(rawOutput);
    } catch {
      const match = rawOutput.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { caption: rawOutput, hashtags: ['#slowtravel', '#heldonica'], fullText: rawOutput };
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
