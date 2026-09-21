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
import { ajoutsParRapportA, LIBELLES_AJOUT } from '@/lib/revendications';

// Le Copilote met en forme ; il n'est pas une source. Jusqu'au 21/09/2026,
// « Notes ➔ Carnet » demandait 1 200 à 1 800 mots depuis des notes brutes avec
// les titres « Accroche vécue, Histoire humaine, Détails sensoriels » — c'est
// lui qui a produit les brouillons 119 et 120, titres-consignes compris ;
// « Page Hub » demandait « 3 pépites testées (nom, ressenti, prix réel) » avec
// pour notes par défaut « Découverte immersive en duo » ; « Témoignage » des
// « résultats chiffrés » d'un client qui n'existe pas. La règle ci-dessous
// entre dans chaque consigne, et la route mesure ce que le texte a ajouté.
const REGLE_SOURCE = `LA RÈGLE QUI PRIME SUR TOUT : tu n'ajoutes RIEN qui ne soit dans le texte fourni.
- Aucun lieu, chiffre, prix, horaire, distance, durée, date, nom, adresse, plat, personne absents du texte.
- Aucune sensation (odeur, son, goût, texture, température), aucun dialogue, aucune pensée prêtée à quelqu'un, absents du texte.
- Là où la forme demanderait un élément que le texte n'a pas, écris exactement : [À TOI : ce qui manque].
- Les titres de sections décrivent le contenu ; jamais la consigne (« Accroche vécue », « Détails sensoriels », « Infos pratiques » sont interdits comme titres).
- Aucun mot de ceux-ci : pépite, incontournable, bon plan, must-see, paradis, magnifique, splendide, incroyable, inoubliable, spot.`;

const NOTES_MIN = 200;

function nombres(texte: string): string[] {
  return (texte.match(/\d+(?:[.,]\d+)?/g) || []).map((n) => n.replace(',', '.'));
}

/** Chiffres, sensations et répliques présents dans `texte` et absents de `source`. */
function ajoutsNonSources(texte: string, source: string): string[] {
  const dansSource = new Set(nombres(source));
  const chiffres = [...new Set(nombres(texte).filter((n) => !dansSource.has(n)))].map((n) => `chiffre : ${n}`);
  const autres = ajoutsParRapportA(texte, source).map((a) => `${LIBELLES_AJOUT[a.type]} : ${a.mot}`);
  return [...chiffres, ...autres];
}

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

Corrige la FORME du texte ci-dessous, et seulement la forme : pronoms, mots bannis, phrases lourdes, répétitions, tournures scolaires. Tu ne le rallonges pas.
${REGLE_SOURCE}

Génère DEUX variantes distinctes de cette correction (un rythme différent, pas un contenu différent).
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
Génère les métadonnées SEO au format JSON strict, sans ajouter un fait, un lieu ou un chiffre absents du contenu :
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
        if (!text || text.trim().length < NOTES_MIN) {
          return NextResponse.json(
            { error: `Raconte d'abord ce que tu as vécu (au moins ${NOTES_MIN} caractères). Le Copilote met en forme tes notes ; il n'écrit pas un carnet à leur place.` },
            { status: 400 }
          );
        }

        const motsNotes = text.trim().split(/\s+/).length;
        const prompt = `Voici des notes brutes prises sur le terrain par le duo Heldonica.
Mets-les en forme en carnet de route — c'est une mise en forme, pas une rédaction : ${Math.max(150, motsNotes * 2)} mots AU MAXIMUM (les notes en font ${motsNotes}), en Markdown simple.
- Pronoms stricts : "on" (le duo), "tu" (le lecteur). Jamais "je", jamais "nous".
- Ouvre sur le moment le plus concret des notes. Sections titrées par ce qu'elles racontent (« ## Le marché à 7 h »).
- « Ce qu'on a moins aimé » : seulement si les notes le disent ; sinon la section contient [À TOI : ce que tu as moins aimé].
- Infos pratiques : seulement celles des notes ; sinon [À TOI].
- Pas de verdict signé, pas d'appel à l'action, pas de conclusion générale.
${REGLE_SOURCE}

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
- Structure P-A-S : Problème ➔ Agitation ➔ Solution slow travel / storytelling Heldonica. Un chiffre seulement s'il est dans le texte fourni ; sinon [À TOI : le chiffre].
${REGLE_SOURCE}
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

        const prompt = `Rédige une légende Instagram Heldonica (60 à 120 mots) à partir du texte fourni, et de lui seul :
- Première ligne : le moment le plus concret du texte.
- 3 à 5 lignes sobres, avec les mots de l'autrice.
- Un repère pratique seulement s'il est dans le texte.
${REGLE_SOURCE}
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
- EMAIL 2 (J+3) : Un moment vécu tiré du texte fourni, avec « Ce qu'on a moins aimé » s'il y est ; sinon [À TOI].
${REGLE_SOURCE}
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
        if (!text || text.trim().length < NOTES_MIN) {
          return NextResponse.json(
            { error: `Écris d'abord ce que tu as vécu sur place, à ${dest} (au moins ${NOTES_MIN} caractères). Une page de destination sans notes serait inventée de bout en bout.` },
            { status: 400 }
          );
        }
        const prompt = `Répartis les notes ci-dessous dans les zones de la page sous-destination de "${dest}". Chaque zone ne contient que ce que les notes disent ; une zone que les notes ne remplissent pas contient exactement [À TOI : …] et rien d'autre.
1. Titre et sous-titre (tirés des notes ; le rythme en jours seulement s'il y est)
2. Introduction : le lieu tel que les notes le décrivent
3. Adresses et moments vécus : nom, ce qu'on y a fait, prix payé — uniquement ceux des notes
4. Repères pratiques : horaires, météo, accès — uniquement ceux des notes
5. Ce qu'on a moins aimé : uniquement si les notes le disent
6. Où on a mangé, où on a dormi : uniquement si les notes le disent
${REGLE_SOURCE}

Notes fournies :
---
${text}
---`;

        messages = [
          { role: 'system', content: HELDONICA_B2C_PROMPT },
          { role: 'user', content: prompt },
        ];
        break;
      }

      // « Témoignage / Étude de cas » retiré le 21/09/2026 : il demandait des
      // « résultats chiffrés obtenus (hausse RevPAR, marge préservée) » pour un
      // établissement qui n'existe pas — un témoignage inventé, la catégorie
      // même de l'incident du 19/08. Le jour où un vrai cas existe, ses faits
      // passent par « Partir de 3 infos » ou par le texte de l'autrice.

      case 'audit_refresh': {
        if (!text) {
          return NextResponse.json({ error: 'Texte d’article existant requis pour l’audit' }, { status: 400 });
        }

        const prompt = `Effectue l'audit et le rafraîchissement complet de cet ancien contenu selon le protocole des 3R d'Heldonica :
1. R1 - Data terrain : Conserve les données réelles et souligne les points à re-vérifier si obsolètes. N'ajoute aucun fait, chiffre, lieu ou sensation absent du texte.
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
            { error: 'Renseigne au moins un des trois champs pour démarrer.' },
            { status: 400 }
          );
        }

        if (audience === 'b2b') {
          const prompt = `Un hôtelier ou le duo Heldonica t'a fourni trois informations brutes sur un hébergement de charme et son marché. À partir de CES SEULS faits, rédige un contenu d'analyse / post conseil B2B (150 à 220 mots) selon la structure P-A-S et la voix officielle Heldonica.

Établissement & localisation : ${lieu || 'Hébergement de charme indépendant'}
Constat chiffré / problème : ${moment || 'Dépendance aux commissions OTAs'}
Solution slow travel & bénéfice visé : ${detail || 'Valorisation de l’ancrage local et de la marge directe'}

RÈGLE D'OR : "On n'invente rien." Reste fidèle aux faits fournis.
PRONOMS OBLIGATOIRES : "On" (le duo/Heldonica) et "Vous" (l'hôtelier). Interdiction absolue de "je", "tu", "nous".
STRUCTURE P-A-S :
1. Hook percutant & Problème : Constat chiffré sur l'hébergement ou la perte de marge.
2. Agitation : L'impact sur la rentabilité et la dépendance aux plateformes.
3. Solution : La stratégie slow travel de terroir et le bénéfice concret.
4. CTA doux : "On ouvre 3 audits ce mois-ci. Si vous voulez qu'on regarde votre cas, envoyez-nous un DM."`;

          messages = [
            { role: 'system', content: HELDONICA_B2B_PROMPT },
            { role: 'user', content: prompt },
          ];
        } else {
          const prompt = `Le duo Heldonica t'a donné trois informations brutes sur un moment vécu, sans les mettre en forme. À partir de CES SEULS faits, rédige une légende Instagram immersive (120 à 180 mots) dans la voix Heldonica.

Lieu / contexte : ${lieu || 'non précisé'}
Ce qu'on faisait juste avant ou après : ${moment || 'non précisé'}
Détail marquant (bruit, odeur, sensation, parole) : ${detail || 'non précisé'}

RÈGLE ABSOLUE : "On n'invente rien." Tu peux travailler le style, le rythme et les mots — mais n'ajoute AUCUN fait, lieu, personne ou événement qui n'est pas dans les trois informations ci-dessus.
PRONOMS : "On" (duo) + "Tu" (voyageur). 0 mot banni (pas de magnifique, spot, bon plan).
Structure :
- Accroche courte tirée du détail marquant.
- 3-4 lignes qui posent le lieu et le moment, sobres, sans superlatif.
- Question complice en "tu" à la fin.
- 5-6 hashtags ciblés (#slowtravel #ecoluxe...).`;

          messages = [
            { role: 'system', content: HELDONICA_B2C_PROMPT },
            { role: 'user', content: prompt },
          ];
        }
        break;
      }

      case 'generate_excerpt': {
        if (!text) {
          return NextResponse.json({ error: 'Contenu manquant' }, { status: 400 });
        }

        const prompt = `Rédige un extrait d'accroche (1 à 2 phrases courtes, maximum 140 caractères) pour ce carnet de route Heldonica, avec ses mots, sans ajouter un fait qui n'y est pas.
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
        const prompt = `Propose une TRAME de repérage slow travel pour ${targetDest} — une grille à remplir par le duo après le voyage, pas un récit et pas une recommandation.
- Rester au moins 2-3 nuits au même endroit (profondeur > quantité).
- Découpage par journées, chacune avec : « Le matin », « L'après-midi », « La table du soir », « Ce qu'on a moins aimé ».
- Chaque case contient exactement [À TOI : …] avec ce qu'il faudra noter (heure, lieu, prix payé, ce qu'on a fait). AUCUN nom d'établissement, aucun conseil, aucun avis, aucun prix : tu ne connais pas ce voyage.
- Si des souhaits sont fournis ci-dessous, place-les dans la grille tels quels, sans les développer.
${REGLE_SOURCE}

Souhaits fournis :
---
${text || '(aucun)'}
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

    // Ce que la sortie contient et que l'entrée n'avait pas — chiffres,
    // sensations, répliques. Mesuré, pas cru : la consigne interdit d'ajouter,
    // le modèle ajoute quand même, l'autrice doit le voir avant d'insérer.
    const sourceTexte = [text, context?.lieu, context?.moment, context?.detail].filter(Boolean).join('\n');
    const sorties: string[] = [];
    if (typeof parsedResult === 'string') sorties.push(parsedResult);
    else if (parsedResult && typeof parsedResult === 'object') {
      for (const v of Object.values(parsedResult)) if (typeof v === 'string') sorties.push(v);
    }
    const ajouts = sourceTexte.trim() ? [...new Set(sorties.flatMap((t) => ajoutsNonSources(t, sourceTexte)))] : [];

    return NextResponse.json({
      success: true,
      action,
      audience,
      data: parsedResult,
      validation,
      ajouts_non_sources: ajouts,
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
