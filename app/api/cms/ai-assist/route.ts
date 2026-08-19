import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import {
  HELDONICA_SYSTEM_PROMPT,
  HELDONICA_B2C_PROMPT,
  HELDONICA_B2B_PROMPT,
  validateGardeFous,
  GARDE_FOUS_CHECKLIST,
} from '@/lib/brand-voice';
import { generateAiCompletion, type AiMessage } from '@/lib/ai-provider';

export const dynamic = 'force-dynamic';

export interface AiAssistRequest {
  action:
    | 'voice_polish'
    | 'generate_seo'
    | 'expand_notes'
    | 'generate_excerpt'
    | 'structure_itinerary'
    | 'b2b_linkedin'
    | 'b2c_instagram'
    | 'email_sequence'
    | 'destination_hub'
    | 'case_study'
    | 'audit_refresh'
    | 'guided_from_facts';
  audience?: 'b2c' | 'b2b';
  text?: string;
  title?: string;
  destination?: string;
  context?: Record<string, any>;
}

export async function POST(req: NextRequest) {
  // Sécurisation CMS
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  try {
    const body: AiAssistRequest = await req.json();
    const { action, text, title, destination, context, audience = 'b2c' } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action requise' }, { status: 400 });
    }

    let messages: AiMessage[] = [];
    let jsonMode = false;
    const basePrompt = audience === 'b2b' ? HELDONICA_B2B_PROMPT : HELDONICA_B2C_PROMPT;

    switch (action) {
      case 'voice_polish': {
        if (!text) {
          return NextResponse.json({ error: 'Texte manquant pour le polissage' }, { status: 400 });
        }

        const prompt = `Tu es le rédacteur en chef d'Heldonica (audience: ${audience.toUpperCase()}).
RÈGLE D'OR : "On n'invente rien. On raconte ce qu'on a vécu."
Pronoms obligatoires : "on" (duo), "${audience === 'b2c' ? 'tu' : 'vous'}". Interdits : "je", "nous", "les voyageurs".

Réécris et sublime le texte ci-dessous pour qu'il respecte les 7 garde-fous Heldonica :
- Détail sensoriel précis.
- Aucun superlatif creux ("incontournable", "bon plan", "must-see", "paradis").
- Nuance honnête ("Ce qu'on a moins aimé").

Génère DEUX variantes distinctes.
Réponds UNIQUEMENT sous forme d'un objet JSON strict :
{
  "variant_1": "Première variante soignée...",
  "variant_2": "Deuxième variante avec un angle différent..."
}

Texte source :
---
${text}
---`;

        messages = [
          { role: 'system', content: basePrompt },
          { role: 'user', content: prompt },
        ];
        jsonMode = true;
        break;
      }

      case 'generate_seo': {
        const sourceContent = text || context?.content || '';
        const sourceTitle = title || context?.title || '';

        if (!sourceContent && !sourceTitle) {
          return NextResponse.json({ error: 'Contenu ou titre requis pour générer le SEO' }, { status: 400 });
        }

        const prompt = `Analyse l'article ou le contenu suivant pour le site slow travel Heldonica.
Génère les métadonnées SEO optimales au format JSON strict :
- "seo_title" : Titre optimisé et accrocheur, MAXIMUM 60 caractères, contenant la destination ou le thème slow travel (se termine idéalement par " | Heldonica").
- "seo_description" : Meta description captivante invitant au clic, MAXIMUM 155 caractères, sans superlatif creux.
- "suggested_tags" : Tableau de 3 à 5 tags précis (ex: ["slow travel", "madère", "randonnée"]).
- "og_alt" : Description de l'image de couverture pour l'accessibilité.

Titre actuel : ${sourceTitle}
Destination : ${destination || 'Générale'}
Contenu extrait :
---
${sourceContent.slice(0, 3000)}
---

Réponds UNIQUEMENT avec le JSON valide, sans aucun texte autour :
{
  "seo_title": "...",
  "seo_description": "...",
  "suggested_tags": ["..."],
  "og_alt": "..."
}`;

        messages = [
          { role: 'system', content: HELDONICA_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ];
        jsonMode = true;
        break;
      }

      case 'expand_notes': {
        if (!text) {
          return NextResponse.json({ error: 'Notes de terrain manquantes' }, { status: 400 });
        }

        const prompt = `Voici des notes brutes prises sur le terrain par le duo Heldonica lors d'un voyage.
Rédige un carnet de route complet (1 200 à 1 800 mots), immersif et poétique :
- Pronoms stricts : "on" (le duo), "tu" (le lecteur). Jamais "je", jamais "nous".
- Structure en 5 points : Accroche vécue, Histoire humaine, Détails sensoriels, Ce qu'on a moins aimé / bémols, Infos pratiques GEO vérifiables.
- Intègre une section "Ce qu'on a moins aimé" avec honnêteté.
- Termine par un verdict Heldonica signé et un CTA doux.

Notes brutes :
---
${text}
---`;

        messages = [
          { role: 'system', content: HELDONICA_B2C_PROMPT },
          { role: 'user', content: prompt },
        ];
        break;
      }

      case 'b2b_linkedin': {
        if (!text) {
          return NextResponse.json({ error: 'Sujet ou faits hôteliers requis' }, { status: 400 });
        }

        const prompt = `Rédige un post LinkedIn B2B (150 à 250 mots) pour les hôteliers indépendants.
- Structure P-A-S : Problème chiffré ➔ Agitation (marge, RevPAR) ➔ Solution slow travel / storytelling Heldonica.
- Pronoms : "on" (notre expérience), "vous" (l'hôtelier).
- Termine par une question ouverte professionnelle.

Sujet / Notes :
---
${text}
---`;

        messages = [
          { role: 'system', content: HELDONICA_B2B_PROMPT },
          { role: 'user', content: prompt },
        ];
        break;
      }

      case 'b2c_instagram': {
        if (!text) {
          return NextResponse.json({ error: 'Notes ou sujet Instagram requis' }, { status: 400 });
        }

        const prompt = `Rédige une caption Instagram Heldonica (150 à 200 mots) :
- Accroche percutante en 1ère ligne (micro-récit sans cliché).
- 4 à 6 lignes de storytelling épuré axé sur la matière et le ressenti vécu.
- Détail pratique vérifié.
- Question complice en tutoiement ("tu").
- 6 à 8 hashtags ciblés (#slowtravel #ecoluxe #${(destination || 'voyage').replace(/\s+/g, '')}).

Contexte :
---
${text}
---`;

        messages = [
          { role: 'system', content: HELDONICA_B2C_PROMPT },
          { role: 'user', content: prompt },
        ];
        break;
      }

      case 'email_sequence': {
        const dest = destination || 'Slow Travel';
        const prompt = `Rédige la séquence d'accueil complète (3 emails) pour les abonnés newsletter Heldonica (${dest}) :
- EMAIL 1 (J+0) : Le Manifeste Heldonica + Téléchargement du carnet secret offert (sujet + corps).
- EMAIL 2 (J+3) : Une pépite terrain vécue avec sensorialité, prix réel et « Ce qu'on a moins aimé ».
- EMAIL 3 (J+7) : L'invitation douce au Travel Planning sur-mesure pour couples.
Respecte scrupuleusement la voix Heldonica ("on" + "tu"), zéro mot banni.`;

        messages = [
          { role: 'system', content: HELDONICA_B2C_PROMPT },
          { role: 'user', content: prompt },
        ];
        break;
      }

      case 'destination_hub': {
        const dest = destination || title || 'cette destination';
        const prompt = `Génère le contenu complet des zones CMS pour la page sous-destination de "${dest}" :
1. Titre & sous-titre héroïque (rythme en jours conseillé)
2. Introduction géographique et atmosphère du terroir
3. 3 pépites locales testées (nom, ressenti sensoriel, prix réel)
4. Le conseil secret d'initié (horaires, météo)
5. Ce qu'on a moins aimé (la nuance honnête)
6. 2 tables locales d'artisans + 1 hébergement coup de cœur

Notes fournies :
---
${text || 'Découverte immersive en duo'}
---`;

        messages = [
          { role: 'system', content: HELDONICA_B2C_PROMPT },
          { role: 'user', content: prompt },
        ];
        break;
      }

      case 'case_study': {
        const isB2B = audience === 'b2b';
        const prompt = isB2B
          ? `Rédige une étude de cas hôtelière Heldonica (B2B) :
- Établissement indépendant & défi initial (taux OTA élevé, saisonnalité).
- L'accompagnement Heldonica (re-scénarisation des séjours, ancrage slow travel).
- Les résultats chiffrés obtenus (hausse RevPAR, marge directe préservée).
Faits fournis :
---
${text || 'Hôtel de charme 20 chambres'}
---`
          : `Rédige un témoignage client / carnet conçu sur-mesure (B2C) :
- Le profil du couple et leur contrainte initiale.
- Le carnet de route sur-mesure conçu par Heldonica.
- L'anecdote vécue la plus marquante.
- Le ressenti final du couple.
Faits fournis :
---
${text || 'Voyage 10 jours en couple'}
---`;

        messages = [
          { role: 'system', content: isB2B ? HELDONICA_B2B_PROMPT : HELDONICA_B2C_PROMPT },
          { role: 'user', content: prompt },
        ];
        break;
      }

      case 'audit_refresh': {
        if (!text) {
          return NextResponse.json({ error: 'Texte d’article existant requis pour l’audit' }, { status: 400 });
        }

        const prompt = `Effectue l'audit et le rafraîchissement complet de cet ancien contenu selon le protocole des 3R d'Heldonica :
1. R1 - Data terrain : Conserve les données réelles et souligne les points à re-vérifier si obsolètes.
2. R2 - Réalignement voix : Élimine tous les mots bannis (bons plans, incontournables, tips), assure l'usage strict de "on" (duo) et "${audience === 'b2c' ? 'tu' : 'vous'}", insère une section "Ce qu'on a moins aimé" si absente, et injecte au moins un détail sensoriel fort.
3. R3 - Redirection / SEO : Propose un titre optimisé et signale si l'URL doit être conservée ou redirigée.

Article actuel à auditer et réécrire :
---
${text}
---

Rends l'article entièrement réécrit et prêt à la publication, précédé d'un court encart de diagnostic d'audit.`;

        messages = [
          { role: 'system', content: basePrompt },
          { role: 'user', content: prompt },
        ];
        break;
      }

      case 'guided_from_facts': {
        const lieu = context?.lieu?.trim() || '';
        const moment = context?.moment?.trim() || '';
        const detail = context?.detail?.trim() || '';

        if (!lieu && !moment && !detail) {
          return NextResponse.json(
            { error: 'Renseigne au moins un des trois champs (lieu, moment ou détail).' },
            { status: 400 }
          );
        }

        const prompt = `Le duo Heldonica t'a donné trois informations brutes sur un moment vécu, sans les mettre en forme. À partir de CES SEULS faits, rédige une caption Instagram complète (120 à 200 mots) dans la voix Heldonica.

Lieu / contexte : ${lieu || 'non précisé'}
Ce qu'on faisait juste avant ou après : ${moment || 'non précisé'}
Détail marquant (bruit, odeur, sensation, parole) : ${detail || 'non précisé'}

RÈGLE ABSOLUE : "On n'invente rien." Tu peux travailler le style, le rythme et les mots — mais n'ajoute AUCUN fait, lieu, personne ou événement qui n'est pas dans les trois informations ci-dessus. S'il manque un champ, ne le remplace pas par une invention : construis avec ce que tu as.

Structure :
- Accroche courte tirée du détail marquant.
- 3-4 lignes qui posent le lieu et le moment, sobres, sans superlatif.
- Question complice en "tu" à la fin.
- 5-6 hashtags ciblés (#slowtravel #ecoluxe...).`;

        messages = [
          { role: 'system', content: HELDONICA_B2C_PROMPT },
          { role: 'user', content: prompt },
        ];
        break;
      }

      case 'generate_excerpt': {
        if (!text) {
          return NextResponse.json({ error: 'Contenu manquant' }, { status: 400 });
        }

        const prompt = `Rédige un extrait d'accroche (1 à 2 phrases courtes, maximum 140 caractères) pour ce carnet de route Heldonica.
L'accroche doit donner envie de lire sans dévoiler toute la fin, avec le style épuré et complice d'Heldonica ("on" + "tu").

Contenu :
---
${text.slice(0, 2000)}
---

Retourne UNIQUEMENT l'extrait textuel, sans guillemets ni commentaire.`;

        messages = [
          { role: 'system', content: HELDONICA_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ];
        break;
      }

      case 'structure_itinerary': {
        const targetDest = destination || title || 'cette destination';
        const prompt = `Propose une structure d'itinéraire Slow Travel pour ${targetDest}.
Critères stricts Heldonica :
- Rester au moins 2-3 nuits au même endroit (profondeur > quantité).
- Découpage par journées thématiques avec : 'Le matin', 'L'après-midi', 'La table du soir', 'Le conseil secret', 'Ce qu'on a moins aimé / à éviter'.

Détails / souhaits :
---
${text || 'Itinéraire immersif en duo'}
---`;

        messages = [
          { role: 'system', content: HELDONICA_B2C_PROMPT },
          { role: 'user', content: prompt },
        ];
        break;
      }

      default:
        return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
    }

    // Appel au moteur IA unifié
    const result = await generateAiCompletion({
      messages,
      temperature: 0.7,
      jsonMode,
    });

    let parsedResult: any = result.content;

    if (jsonMode) {
      try {
        const jsonMatch = result.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResult = JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.warn('[AI Assist API] Échec du parsing JSON strict, retour du texte brut :', err);
      }
    }

    // Évaluation automatique des 7 garde-fous
    let sampleText = '';
    if (typeof parsedResult === 'string') sampleText = parsedResult;
    else if (parsedResult?.variant_1) sampleText = parsedResult.variant_1;
    else if (parsedResult?.seo_description) sampleText = parsedResult.seo_description;

    const validation = sampleText ? validateGardeFous(sampleText, audience) : null;

    return NextResponse.json({
      success: true,
      action,
      audience,
      data: parsedResult,
      validation,
      provider: result.provider,
      model: result.model,
    });
  } catch (err: any) {
    console.error('[AI Assist API Error]:', err);
    return NextResponse.json(
      { error: err.message || 'Erreur lors de l’assistance IA' },
      { status: 500 }
    );
  }
}
