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
    const { destination, stages = [], photosCount = 50, mapsUrl, notes, coordinates = [] } = body;

    if (!destination) {
      return NextResponse.json({ error: 'Destination requise' }, { status: 400 });
    }

    const stageList = stages.length > 0 ? stages.join(', ') : 'Itinéraire complet sur les routes secondaires';

    const prompt = `${HELDONICA_B2C_PROMPT}

Rédige un carnet de route complet (1000 à 1200 mots) basé sur les données réelles de notre voyage en ${destination}.
Étapes GPS identifiées : ${stageList}.
${notes ? `Notes vécues du terrain : ${notes}` : ''}
${mapsUrl ? `Lien de la carte Google Maps : ${mapsUrl}` : ''}
Nombre de clichés et vidéos capturés : ${photosCount}.
Période : voyages vécus en 2025 et 2026.

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
