import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { HELDONICA_B2C_PROMPT, validateGardeFous } from '@/lib/brand-voice';
import { generateAiCompletion } from '@/lib/ai-provider';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export interface ImportTripRequest {
  destination: string;
  stages?: string[];
  photosCount?: number;
  mapsUrl?: string;
  notes?: string;
  coordinates?: Array<{ name: string; lat: number; lng: number; description?: string }>;
}

export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  try {
    const body: ImportTripRequest = await req.json();
    const { destination, stages = [], mapsUrl, notes, coordinates = [] } = body;

    if (!destination) {
      return NextResponse.json({ error: 'Destination requise' }, { status: 400 });
    }

    // Ce que la route sait réellement du voyage : les faits fournis. Tout le
    // reste est inconnu, et un carnet rédigé sur un lieu sans le vécu qui va
    // avec est une fiction — elle a la forme d'un article fini, ce qui la rend
    // indétectable ensuite. La route ne rédige donc que ce qu'on lui donne :
    // des notes vécues. Sans elles, elle prépare un squelette à remplir.
    const notesVecues = (notes || '').trim();
    const stagesFournis = stages.map((s) => s.trim()).filter(Boolean);
    const aDesNotes = notesVecues.length > 0;
    const aDesEtapes = stagesFournis.length > 0;
    const aDeLaMatiere = aDesNotes || aDesEtapes;

    const stageList = aDesEtapes
      ? stagesFournis.join(', ')
      : 'Étapes non renseignées';

    // Les étapes et coordonnées transmises sont des faits : on les reprend pour
    // ancrer le texte, sans rien y ajouter. Un point sans description n'en reçoit
    // pas : la route se tait plutôt que de nommer un lieu qu'elle ne connaît pas.
    const faitsGeographiques = coordinates
      .map((c) => (c.description ? `- ${c.name} : ${c.description}` : `- ${c.name}`))
      .join('\n');

    const prompt = `${HELDONICA_B2C_PROMPT}

${aDeLaMatiere
  ? `Rédige un carnet de route à partir des faits ci-dessous, et SEULEMENT d'eux.
Destination : ${destination}.
Étapes : ${stageList}.
${aDesNotes ? `Notes vécues du terrain (la seule source du récit) :\n---\n${notesVecues}\n---` : ''}
${faitsGeographiques ? `Points identifiés :\n${faitsGeographiques}` : ''}
${mapsUrl ? `Carte : ${mapsUrl}` : ''}

Tout ce qui n'est pas dans ces faits est inconnu : ne l'écris pas. Si le récit
manque d'un élément (une odeur, un prix, une rencontre, une difficulté), laisse
une balise [À TOI : ce qu'il faut préciser] à l'endroit exact où il manque —
c'est le duo fondateur qui la remplira. N'invente aucun prix, aucune durée,
aucune heure, aucun nom de lieu, aucune sensation.`
  : `Tu prépares un SQUELETTE de carnet de route, pas un carnet.
Destination : ${destination}.
Étapes : ${stageList}.
AUCUNE note vécue n'a été fournie : tu ne sais rien de ce voyage. Tu ne rédiges
donc AUCUN paragraphe de récit, aucune description de paysage, aucune anecdote.
Tu produis seulement la structure à remplir : un titre de travail, un slug, un
résumé à trous, et une liste de sections avec, sous chacune, une balise
[À TOI : …] qui dit précisément ce que le duo doit raconter à cet endroit.
La balise dit quoi écrire, jamais quoi ressentir.`}

RÈGLE D'OR : "On n'invente rien. On raconte ce qu'on a vécu."
PRONOMS OBLIGATOIRES : "on" (duo), "tu" (lecteur). Interdiction absolue de "je", "nous", "les voyageurs", "les touristes".
0 MOT BANNI : Aucun mot parmi (bon plan, incontournable, tips, magnifique, splendide, incroyable, spot, optimiser, paradis, aventure inoubliable).

Retourne UNIQUEMENT un objet JSON strict :
{
  "title": "Titre du carnet",
  "slug": "slug-url-optimise",
  "excerpt": "Résumé de 2-3 phrases",
  "content": "Contenu HTML complet (avec <h2>, <p>, <ul>, <li>, <em>)",
  "meta_title": "Titre SEO < 60 car | Heldonica",
  "meta_description": "Meta description < 160 car",
  "instagram_caption": "Légende Instagram prête à publier avec 6 hashtags ciblés"
}`;

    const aiRes = await generateAiCompletion({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
      jsonMode: true,
    });

    let article: any;
    try {
      article = JSON.parse(aiRes.content);
    } catch {
      const match = aiRes.content.match(/\{[\s\S]*\}/);
      if (match) article = JSON.parse(match[0]);
    }

    if (!article || !article.title) {
      return NextResponse.json({ error: 'Échec de la génération structurée' }, { status: 500 });
    }

    // Validation des 7 garde-fous
    const audit = validateGardeFous(`${article.title} ${article.excerpt} ${article.content}`, 'b2c');

    // Sauvegarde Supabase
    const supabase = getSupabase();
    if (supabase) {
      const slug = article.slug || destination.toLowerCase().replace(/\s+/g, '-');
      
      // 1. Sauvegarde article
      const { error: erreurArticle } = await (supabase as any).from('cms_blog_posts').upsert(
        {
          title: article.title,
          slug,
          excerpt: article.excerpt,
          content: article.content,
          category: 'Carnets Voyage',
          tags: [destination.toLowerCase(), 'slow-travel', 'roadtrip'],
          published: false,
          status: 'draft',
          meta_title: article.meta_title,
          meta_description: article.meta_description,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'slug' }
      );
      if (erreurArticle) {
        console.error('[import-trip] article non enregistre :', erreurArticle.message);
        return NextResponse.json(
          { error: "L'article n'a pas pu etre enregistre." },
          { status: 500 }
        );
      }

      // 2. Création de la trace / POIs de carte si des coordonnées sont fournies
      if (coordinates.length > 0) {
        const { data: route, error: erreurTrace } = await (supabase as any).from('article_map_routes').insert({
          content_slug: slug,
          name: `Itinéraire ${destination}`,
          description: `Tracé GPS du voyage ${destination}`,
          color: '#01696f',
          is_active: true,
          display_order: 0,
        }).select().single();

        if (erreurTrace) {
          console.error('[import-trip] trace non enregistree :', erreurTrace.message);
        }

        if (route?.id) {
          const pois = coordinates.map((coord, idx) => ({
            content_slug: slug,
            route_id: route.id,
            name: coord.name,
            description: coord.description || '',
            category: idx === 0 ? 'depart' : idx === coordinates.length - 1 ? 'arrivee' : 'point_vue',
            lat: coord.lat,
            lng: coord.lng,
            display_order: idx,
          }));

          const { error: erreurPois } = await (supabase as any).from('article_map_pois').insert(pois);
          if (erreurPois) {
            console.error('[import-trip] points de carte non enregistres :', erreurPois.message);
          }
        }
      }

      return NextResponse.json({
        success: true,
        article: {
          title: article.title,
          slug,
          excerpt: article.excerpt,
          meta_title: article.meta_title,
          meta_description: article.meta_description,
          instagram_caption: article.instagram_caption,
        },
        // `squelette` : aucune note vécue n'a été fournie, le contenu est une
        // structure à remplir, pas un carnet. L'appelant doit le dire à l'écran,
        // sinon un squelette passe pour un article fini.
        squelette: !aDeLaMatiere,
        auditScore: audit.score,
        auditPassed: audit.passed,
        provider: aiRes.provider,
      });
    }

    return NextResponse.json({
      success: true,
      article,
      auditScore: audit.score,
      auditPassed: audit.passed,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur interne' }, { status: 500 });
  }
}
