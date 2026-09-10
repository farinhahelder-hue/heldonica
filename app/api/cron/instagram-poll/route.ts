import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';
import { isInstagramConfigured, getMediaComments } from '@/lib/instagram';
import { generateAiCompletion } from '@/lib/ai-provider';
import { HELDONICA_B2C_PROMPT, validateGardeFous } from '@/lib/brand-voice';

export const dynamic = 'force-dynamic';

// Meme verrou que les autres routes cron : l'en-tete Bearer signe par
// CRON_SECRET, sinon une session CMS pour le declenchement manuel.
function isCron(req: NextRequest) {
  const auth = req.headers.get('Authorization');
  return auth === `Bearer ${process.env.CRON_SECRET}` && !!process.env.CRON_SECRET;
}

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function GET(req: NextRequest) {
  // Avant toute chose. Cette route interroge l'API Instagram puis demande une
  // completion IA par commentaire inconnu : laissee ouverte, elle se paie a
  // chaque appel. Et elle ecrit avec la cle service, qui ignore les regles de
  // la base. Le verrou passe donc avant la lecture de la configuration, pour
  // ne rien apprendre a un anonyme sur ce qui est branche.
  if (!isCron(req)) {
    const authResponse = await requireCmsAuth(req as any);
    if (authResponse) return authResponse;
  }

  if (!isInstagramConfigured()) {
    return NextResponse.json({ error: 'Instagram Graph API non configuré' }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 500 });
  }

  try {
    const businessId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;

    // 1. Récupère les 10 publications récentes
    const mediaRes = await fetch(
      `https://graph.facebook.com/${businessId}/media?fields=id,caption,permalink&limit=10&access_token=${token}`
    );
    if (!mediaRes.ok) {
      return NextResponse.json({ error: 'Échec de la récupération des médias récents' }, { status: 502 });
    }

    const mediaData = await mediaRes.json();
    const mediaList = mediaData.data || [];
    let newCommentsCount = 0;

    for (const media of mediaList) {
      const comments = await getMediaComments(media.id);
      for (const comment of comments) {
        // Vérifie si le commentaire existe déjà
        const { data: existing } = await (supabase as any)
          .from('instagram_comments')
          .select('id')
          .eq('ig_comment_id', comment.id)
          .maybeSingle();

        if (!existing && comment.text) {
          // Génération du brouillon IA
          const prompt = `${HELDONICA_B2C_PROMPT}

Un voyageur (@${comment.username}) a laissé ce commentaire : "${comment.text}".
RÈGLE D'OR : "On n'invente rien." Tutoiement complice "tu", bienveillant et sobre. 2 phrases max.
ZÉRO MOT BANNI.

Rédige la proposition de réponse :`;

          const aiRes = await generateAiCompletion({
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
            max_tokens: 300,
          }).catch(() => null);

          const aiDraft = aiRes?.content?.trim() || 'Merci pour ton mot ! N\'hésite pas à nous écrire en message si tu prépares ton prochain voyage.';
          const audit = validateGardeFous(aiDraft, 'b2c');

          await (supabase as any).from('instagram_comments').insert({
            ig_comment_id: comment.id,
            media_id: media.id,
            media_permalink: media.permalink,
            username: comment.username,
            text: comment.text,
            status: 'pending_review',
            ai_draft: aiDraft,
            ai_confidence: audit.passed ? 0.95 : 0.75,
            created_at: comment.timestamp || new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

          newCommentsCount++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      scanned_media: mediaList.length,
      new_comments_ingested: newCommentsCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
