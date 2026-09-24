import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

/**
 * File d'attente des publications Instagram.
 *
 * Cette route n'avait aucune vérification, alors qu'elle travaille avec la clé
 * service — qui contourne les règles de sécurité de la base. N'importe qui
 * pouvait donc lire la file, y ajouter une publication, ou passer une entrée en
 * « scheduled » : le cron l'aurait ensuite publiée sur le compte Instagram réel.
 * Le trou était masqué par l'absence de la table, qui faisait échouer chaque
 * appel ; il devenait exploitable dès sa création.
 *
 * Les messages d'erreur de la base ne sont plus renvoyés tels quels : ils
 * décrivent le schéma à qui les lit.
 */

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/** Journalise le détail et ne renvoie qu'un motif générique. */
function erreurBase(contexte: string, error: unknown) {
  console.error(`[instagram/scheduled] ${contexte}`, error);
  return NextResponse.json({ error: 'Opération refusée par la base' }, { status: 500 });
}

export async function GET(request: NextRequest) {
  const refus = await requireCmsAuth(request);
  if (refus) return refus;

  try {
    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    const { data, error } = await supabase
      .from('instagram_scheduled_posts')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (error) return erreurBase('lecture', error);

    return NextResponse.json({ posts: data || [] });
  } catch (e) {
    return erreurBase('lecture', e);
  }
}

export async function POST(request: NextRequest) {
  const refus = await requireCmsAuth(request);
  if (refus) return refus;

  try {
    const body = await request.json();
    // `metadata` porte le type de publication et, pour un carrousel, les URL de
    // toutes ses images. Sans elle, un carrousel arrivait dans la file comme une
    // image seule : les autres diapositives étaient déposées puis oubliées.
    const { image_url, caption, hashtags, scheduled_at, article_id, metadata } = body;

    if (!image_url) {
      return NextResponse.json({ error: 'image_url is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    const { data, error } = await supabase
      .from('instagram_scheduled_posts')
      .insert({
        image_url,
        caption,
        hashtags: hashtags || [],
        scheduled_at: scheduled_at || null,
        status: scheduled_at ? 'scheduled' : 'draft',
        article_id: article_id || null,
        metadata: metadata ?? null,
      })
      .select()
      .single();

    if (error) return erreurBase('creation', error);

    return NextResponse.json({ success: true, post: data });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  const refus = await requireCmsAuth(request);
  if (refus) return refus;

  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    const { data, error } = await supabase
      .from('instagram_scheduled_posts')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) return erreurBase('mise a jour', error);

    return NextResponse.json({ success: true, post: data });
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  const refus = await requireCmsAuth(request);
  if (refus) return refus;

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const supabase = getSupabase();
    if (!supabase) return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    const { error } = await supabase
      .from('instagram_scheduled_posts')
      .delete()
      .eq('id', id);

    if (error) return erreurBase('suppression', error);

    return NextResponse.json({ success: true });
  } catch (e) {
    return erreurBase('suppression', e);
  }
}
