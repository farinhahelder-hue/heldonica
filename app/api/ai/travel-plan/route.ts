import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { verifyAiAuth, logAiRequest } from '@/lib/ai-auth';
import { requireCmsAuth } from '@/lib/cms-auth';
import { generateEmbedding } from '@/lib/ai-embeddings';
import { HELDONICA_SYSTEM_PROMPT, validateGardeFous } from '@/lib/brand-voice';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Pré-itinéraire proposé au panneau pour une demande Travel Planning.
//
// Outil interne : le texte va dans demandes_travel.proposition_ia, jamais au
// client. Le modèle ne reçoit que le vécu réel des destinations les plus
// proches de la demande (recherche sémantique sur les 41 destinations) et a
// pour consigne de dire ce que ce vécu ne couvre pas, plutôt que de combler.

const MODEL = 'gemini-2.5-flash';
const NB_DESTINATIONS = 3;
const SEUIL_SIMILARITE = 0.3;

function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

type Demande = {
  id: string;
  prenom: string | null;
  trip_type: string | null;
  vibe: string | null;
  destination: string | null;
  destination_detail: string | null;
  duree_jours: string | null;
  budget_fourchette: string | null;
  mois_depart: string | null;
  nb_voyageurs: number | null;
  notes: string | null;
};

type Etape = { day?: number; title?: string; desc?: string };
type DestinationVecue = {
  id: string;
  slug: string;
  title: string;
  country: string | null;
  region: string | null;
  travel_style: string | null;
  excerpt: string | null;
  intro_narrative: string | null;
  itinerary: Etape[] | null;
  tags: string[] | null;
  similarity: number | null;
};

const COLONNES_DESTINATION = 'id, slug, title, country, region, travel_style, excerpt, intro_narrative, itinerary, tags';

function texteDemande(d: Demande): string {
  return [
    d.trip_type && `Type d'escapade : ${d.trip_type}`,
    d.vibe && `Ambiance recherchée : ${d.vibe}`,
    d.destination && `Destination souhaitée : ${d.destination}`,
    d.destination_detail && `Précision : ${d.destination_detail}`,
    d.duree_jours && `Durée : ${d.duree_jours}`,
    d.mois_depart && `Période : ${d.mois_depart}`,
    d.budget_fourchette && `Budget : ${d.budget_fourchette}`,
    d.nb_voyageurs && `Voyageurs : ${d.nb_voyageurs}`,
    d.notes && `Message : ${d.notes}`,
  ]
    .filter(Boolean)
    .join('\n');
}

function materiauDestination(dest: DestinationVecue): string {
  const parts = [`### ${dest.title}${dest.country ? ` (${dest.country}${dest.region ? `, ${dest.region}` : ''})` : ''}`];
  if (dest.travel_style) parts.push(`Style : ${dest.travel_style}`);
  if (dest.excerpt) parts.push(`Résumé : ${dest.excerpt}`);
  if (dest.intro_narrative) parts.push(`Ce qu'on a vécu : ${dest.intro_narrative}`);
  if (Array.isArray(dest.itinerary) && dest.itinerary.length > 0) {
    const jours = dest.itinerary
      .slice(0, 10)
      .map((e) => `- Jour ${e.day ?? '?'} — ${e.title ?? ''}${e.desc ? ` : ${e.desc}` : ''}`)
      .join('\n');
    parts.push(`Itinéraire qu'on a suivi :\n${jours}`);
  } else {
    parts.push("Itinéraire : pas d'étapes jour par jour dans notre carnet pour cette destination.");
  }
  if (dest.tags?.length) parts.push(`Tags : ${dest.tags.join(', ')}`);
  return parts.join('\n');
}

// Les destinations les plus proches de la demande : d'abord celle qu'elle
// nomme (si elle existe dans nos 41), puis la recherche sémantique.
async function destinationsProches(sb: SupabaseClient, demande: Demande): Promise<{ liste: DestinationVecue[]; methode: string }> {
  const retenues = new Map<string, DestinationVecue>();
  let methode = 'pgvector_cosine';

  // Le formulaire met « Destination précise » / « Suggestions Heldonica » /
  // « Région/continent » dans `destination` ; le nom réel est dans
  // `destination_detail`. On cherche celui-là dans nos 41.
  const nommee = (demande.destination_detail || '').trim() || (demande.destination || '').trim();
  if (nommee && nommee.length >= 3) {
    const { data, error } = await sb
      .from('destinations')
      .select(COLONNES_DESTINATION)
      .ilike('title', `%${nommee.replace(/[%_]/g, '')}%`)
      .limit(2);
    if (error) console.warn('[travel-plan] lecture destination nommée :', error.message);
    for (const d of (data ?? []) as any[]) retenues.set(d.id, { ...d, similarity: null });
  }

  const vecteur = await generateEmbedding(texteDemande(demande), 'RETRIEVAL_QUERY');
  if (vecteur) {
    const { data, error } = await sb.rpc('match_destinations', {
      query_embedding: vecteur,
      match_threshold: SEUIL_SIMILARITE,
      match_count: NB_DESTINATIONS,
    });
    if (error) {
      console.warn('[travel-plan] match_destinations :', error.message);
      methode = 'destination_nommee_seule';
    } else {
      const ids = ((data ?? []) as any[]).filter((m) => !retenues.has(m.id)).map((m) => m.id);
      if (ids.length) {
        const { data: completes, error: errC } = await sb.from('destinations').select(COLONNES_DESTINATION).in('id', ids);
        if (errC) console.warn('[travel-plan] lecture destinations proches :', errC.message);
        for (const m of (data ?? []) as any[]) {
          if (retenues.size >= NB_DESTINATIONS) break;
          const complete = (completes ?? []).find((c: any) => c.id === m.id) as any;
          if (complete && !retenues.has(m.id)) retenues.set(m.id, { ...complete, similarity: m.similarity });
        }
      }
    }
  } else {
    methode = 'destination_nommee_seule';
  }

  return { liste: Array.from(retenues.values()).slice(0, NB_DESTINATIONS), methode };
}

function construirePrompt(demande: Demande, destinations: DestinationVecue[]): string {
  return `${HELDONICA_SYSTEM_PROMPT}

## TA TÂCHE
Tu prépares, pour le duo Heldonica (pas pour le client), un PRÉ-ITINÉRAIRE à partir d'une demande Travel Planning.
Ce texte est un brouillon interne : le duo le relira, le corrigera et écrira lui-même au client.

## CE QUE TU AS LE DROIT D'UTILISER
Uniquement le matériau ci-dessous, tiré des carnets de route du duo. Rien d'autre.
- Si le matériau ne couvre pas un point de la demande (durée plus longue que le carnet, période, budget, un lieu précis), tu l'écris noir sur blanc dans la section « Ce que notre vécu ne couvre pas » — tu ne combles jamais avec des connaissances générales, des hébergements ou des adresses que le matériau ne contient pas.
- Pas de prix, pas d'horaires, pas de noms de lieux absents du matériau.

## FORMAT (Markdown, en français, ${demande.prenom ? `le client s'appelle ${demande.prenom}` : 'client sans prénom'})
1. **Ce qu'on lit dans la demande** — 2 à 3 phrases, avec ce qui compte pour cette personne.
2. **Le fil qu'on propose** — la ou les destinations retenues et pourquoi, en s'appuyant sur ce qu'on y a vécu.
3. **Jour par jour** — une trame adaptée à la durée demandée, chaque jour ancré dans une étape ou un moment réel du matériau ; si la durée dépasse ce qu'on a vécu, on le dit plutôt que d'inventer des jours.
4. **Ce que notre vécu ne couvre pas** — liste honnête.
5. **Questions à poser avant de répondre** — 3 maximum.

Pronoms : « on » pour le duo, « tu » si tu cites une formulation destinée au client. Aucun mot banni.
Commence directement par « ### 1. » — pas de phrase d'introduction, pas de conclusion après la section 5.

## LA DEMANDE
${texteDemande(demande)}

## LE MATÉRIAU (nos carnets)
${destinations.map(materiauDestination).join('\n\n')}
`;
}

export async function POST(req: NextRequest) {
  const debut = Date.now();

  // Panneau (session CMS) ou agent (clé API) — même règle que /api/cms/ai-vision.
  const auth = await verifyAiAuth(req);
  if (!auth.ok) {
    const refus = await requireCmsAuth(req);
    if (refus) return refus;
  }
  const agentName = auth.ok ? auth.agentName || 'unknown' : 'cms_session';

  const sb = getSupabase();
  if (!sb) return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  if (!process.env.GEMINI_API_KEY) return NextResponse.json({ error: 'GEMINI_API_KEY manquante' }, { status: 503 });

  let id: string | undefined;
  try {
    ({ id } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Corps JSON attendu : { id }' }, { status: 400 });
  }
  if (!id || typeof id !== 'string') return NextResponse.json({ error: 'id de demande manquant' }, { status: 400 });

  const { data: demande, error: errDemande } = await sb
    .from('demandes_travel')
    .select('id, prenom, trip_type, vibe, destination, destination_detail, duree_jours, budget_fourchette, mois_depart, nb_voyageurs, notes')
    .eq('id', id)
    .maybeSingle();
  if (errDemande) return NextResponse.json({ error: `Lecture de la demande : ${errDemande.message}` }, { status: 500 });
  if (!demande) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });

  const { liste: destinations, methode } = await destinationsProches(sb, demande as Demande);
  if (destinations.length === 0) {
    return NextResponse.json(
      { error: "Aucune destination de nos carnets ne correspond à cette demande — rien à proposer sans inventer." },
      { status: 422 }
    );
  }

  const prompt = construirePrompt(demande as Demande, destinations);
  let texte: string;
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const model = new GoogleGenerativeAI(process.env.GEMINI_API_KEY).getGenerativeModel({ model: MODEL });
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      // Bas : on veut du fidèle au matériau, pas de l'inspiré.
      generationConfig: { temperature: 0.4, maxOutputTokens: 4000 },
    });
    texte = result.response.text().trim();
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    await logAiRequest({
      apiKeyId: auth.ok ? auth.keyId : undefined,
      agentName,
      endpoint: '/api/ai/travel-plan',
      model: MODEL,
      promptPreview: `demande ${id}`,
      statusCode: 502,
      durationMs: Date.now() - debut,
      error: msg,
    });
    return NextResponse.json({ error: 'Gemini a échoué : ' + msg }, { status: 502 });
  }
  if (!texte) return NextResponse.json({ error: 'Réponse vide de Gemini' }, { status: 502 });

  const controle = validateGardeFous(texte, 'b2c');
  const proposition = {
    texte,
    destinations: destinations.map((d) => ({ slug: d.slug, title: d.title, similarity: d.similarity })),
    methode,
    modele: MODEL,
    score: controle.score,
    mots_bannis: controle.forbiddenFound,
    genere_le: new Date().toISOString(),
    par: agentName,
  };

  const { error: errMaj } = await sb
    .from('demandes_travel')
    .update({ proposition_ia: proposition, updated_at: new Date().toISOString() })
    .eq('id', id);
  const enregistre = !errMaj;
  if (errMaj) console.error('[travel-plan] enregistrement proposition_ia :', errMaj.message);

  await logAiRequest({
    apiKeyId: auth.ok ? auth.keyId : undefined,
    agentName,
    endpoint: '/api/ai/travel-plan',
    model: MODEL,
    promptPreview: `demande ${id} → ${destinations.map((d) => d.slug).join(', ')}`,
    statusCode: 200,
    durationMs: Date.now() - debut,
  });

  return NextResponse.json({ proposition, enregistre, duree_ms: Date.now() - debut });
}
