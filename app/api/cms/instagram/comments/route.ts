import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { createClient } from '@supabase/supabase-js';
import { replyToInstagramComment, toggleHideComment } from '@/lib/instagram';
import { generateAiCompletion } from '@/lib/ai-provider';
import { HELDONICA_B2C_PROMPT, validateGardeFous } from '@/lib/brand-voice';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // La cle service seulement. Le repli sur la cle anon fonctionnait tant que
  // ces tables etaient sans RLS ; une fois RLS actif il aurait transforme une
  // variable d'environnement manquante en ecritures qui echouent sans bruit.
  // Mieux vaut ne pas avoir de client du tout : le garde en aval repond alors.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * GET: Liste des commentaires Instagram à modérer
 */
export async function GET(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'all';

  let query = (supabase as any).from('instagram_comments').select('*').order('created_at', { ascending: false }).limit(50);

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments: data || [] });
}

/**
 * POST: Actions de modération (Approuver & Répondre, Modifier, Rejeter, Régénérer)
 */
export async function POST(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { action, commentId, igCommentId, replyMessage, customInstruction } = body;

    if (!igCommentId || !action) {
      return NextResponse.json({ error: 'igCommentId et action requis' }, { status: 400 });
    }

    if (action === 'reply') {
      // 1. Publication de la réponse sur Instagram
      const igRes = await replyToInstagramComment(igCommentId, replyMessage);
      if (!igRes) {
        return NextResponse.json({ error: 'Échec de la réponse via Instagram Graph API' }, { status: 502 });
      }

      // 2. Mise à jour du statut en base
      const { error: erreurApprobation } = await (supabase as any).from('instagram_comments').update({
        status: 'approved',
        reply_published: replyMessage,
        replied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('ig_comment_id', igCommentId);
      if (erreurApprobation) {
        // La reponse est deja partie chez Instagram : on ne peut plus la
        // retenir. Mais dire success alors que le statut n'a pas bouge ferait
        // reproposer le meme commentaire a la prochaine relecture.
        console.error('[cms/instagram/comments] statut non enregistre :', erreurApprobation.message);
        return NextResponse.json(
          { error: "Réponse publiée, mais le statut n'a pas pu être enregistré." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, igReplyId: igRes.id });
    }

    if (action === 'reject') {
      const { error: erreurRejet } = await (supabase as any).from('instagram_comments').update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      }).eq('ig_comment_id', igCommentId);
      if (erreurRejet) {
        console.error('[cms/instagram/comments] rejet non enregistre :', erreurRejet.message);
        return NextResponse.json({ error: "Le rejet n'a pas pu être enregistré." }, { status: 500 });
      }

      return NextResponse.json({ success: true, status: 'rejected' });
    }

    if (action === 'hide') {
      const hidden = await toggleHideComment(igCommentId, true);
      return NextResponse.json({ success: hidden });
    }

    if (action === 'regenerate_draft') {
      const { data: comment } = await (supabase as any).from('instagram_comments').select('*').eq('ig_comment_id', igCommentId).single();
      if (!comment) {
        return NextResponse.json({ error: 'Commentaire introuvable' }, { status: 404 });
      }

      const prompt = `${HELDONICA_B2C_PROMPT}

Un voyageur (@${comment.username}) a écrit : "${comment.text}".
${customInstruction ? `Consigne particulière : ${customInstruction}` : ''}

Rédige une proposition de réponse directe, sobre et complice (2-3 phrases max) :`;

      const aiRes = await generateAiCompletion({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      });

      const newDraft = aiRes.content.trim();
      const audit = validateGardeFous(newDraft, 'b2c');

      const { error: erreurBrouillon } = await (supabase as any).from('instagram_comments').update({
        ai_draft: newDraft,
        ai_confidence: audit.passed ? 0.95 : 0.75,
        updated_at: new Date().toISOString(),
      }).eq('ig_comment_id', igCommentId);
      if (erreurBrouillon) {
        // Le brouillon a coute une completion IA. Le rendre quand meme evite de
        // la repayer, mais on dit qu'il n'est pas enregistre.
        console.error('[cms/instagram/comments] brouillon non enregistre :', erreurBrouillon.message);
        return NextResponse.json(
          { success: false, ai_draft: newDraft, auditScore: audit.score, error: 'Brouillon généré mais non enregistré.' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, ai_draft: newDraft, auditScore: audit.score });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
