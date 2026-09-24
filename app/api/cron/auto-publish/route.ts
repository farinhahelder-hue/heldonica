export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getCmsAuthStatus } from '@/lib/cms-auth';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Validation de l'authentification (Vercel Cron ou CMS Session)
 */
async function isAuthorized(req: Request): Promise<boolean> {
  // Vercel Cron : en-tête Bearer signé par CRON_SECRET.
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (cronSecret && req.headers.get('authorization') === `Bearer ${cronSecret}`) {
    return true;
  }

  // Appel manuel depuis le CMS. On délègue à getCmsAuthStatus, qui compare le
  // mot de passe en temps constant et vérifie la signature HMAC du cookie de
  // session.
  //
  // Les deux contrôles écrits ici auparavant étaient inopérants :
  //   · `process.env.CMS_PASSWORD || 'heldonica2026'` — repli codé en dur dans
  //     un dépôt public, donc connu de quiconque lit le code ;
  //   · `cookie.includes('heldonica_cms_session=true')` — une session réelle
  //     contient un jeton signé (`payload.signature`), jamais la chaîne `true`.
  //     Cette ligne ne reconnaissait donc aucune session légitime, mais laissait
  //     entrer quiconque posait ce cookie lui-même.
  return (await getCmsAuthStatus(req)) === 'ok';
}

/**
 * Cron Quotidien Heldonica — Générateur de Squelettes de Brouillons Bruts
 * RÈGLE ABSOLUE (AGENTS.md : "On n'invente rien") :
 * - ZÉRO appel LLM pour inventer un faux vécu.
 * - Statut STRICTEMENT 'draft' (published: false).
 * - Squelette neutre basé uniquement sur les métadonnées réelles du fichier.
 */
export async function GET(req: Request) {
  if (!await isAuthorized(req)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const sb = getSupabase();
  if (!sb) {
    return NextResponse.json({ error: 'Supabase non configuré' }, { status: 503 });
  }

  try {
    // 1. Recherche de médias réels déposés dans le bucket media/auto-publish
    const { data: files, error } = await sb.storage.from('media').list('auto-publish', {
      limit: 10,
      sortBy: { column: 'created_at', order: 'asc' },
    });

    if (error || !files || files.length === 0) {
      return NextResponse.json({
        message: 'Aucun média en attente dans auto-publish. Zéro brouillon créé (règle : on n\'invente rien).',
      });
    }

    const images = files.filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f.name));
    if (images.length === 0) {
      return NextResponse.json({ message: 'Aucune image valide trouvée dans auto-publish.' });
    }

    const file = images[0];
    const cleanName = file.name.replace(/\.[^/.]+$/, '');
    const { data: urlData } = sb.storage.from('media').getPublicUrl(`auto-publish/${file.name}`);
    const imageUrl = urlData.publicUrl;

    const title = `Brouillon Média : ${cleanName}`;
    const slug = `brouillon-media-${cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`;
    const excerpt = `Brouillon créé à partir du fichier ${file.name}. Récit et détails sensoriels réels à compléter par l'auteur.`;

    const content = `<h2>Étape documentée : ${cleanName}</h2>
<p><em>Photo capturée sur le terrain :</em></p>
<p><img src="${imageUrl}" alt="${cleanName}" /></p>

<h3>Ce qu'on a ressenti sur place</h3>
<p>[À TOI : Décris l'atmosphère, la lumière et les odeurs réelles constatées lors de cette étape.]</p>

<h3>Repères pratiques & budget</h3>
<ul>
  <li><strong>Accès & route :</strong> [À TOI : état de la route, virages, accès parking]</li>
  <li><strong>Budget réel :</strong> [À TOI : prix réels en €, tickets d'entrée constatés]</li>
  <li><strong>Temps de visite :</strong> [À TOI : durée de visite réelle]</li>
</ul>

<h3>Ce qu'on a moins aimé</h3>
<p>[À TOI : Note honnête sur ce qui était moins agréable — foule, météo, accès.]</p>`;

    // 2. Insertion en BROUILLON STRICT (published = false, status = 'draft')
    const { data: inserted, error: insertErr } = await (sb as any)
      .from('cms_blog_posts')
      .insert({
        title,
        slug,
        excerpt,
        content,
        category: 'Carnets Voyage',
        featured_image: imageUrl,
        published: false,
        status: 'draft',
        tags: ['squelette-brut', 'a-completer'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Squelette de brouillon brut créé avec succès (zéro texte inventé).',
      article_id: inserted.id,
      title: inserted.title,
      status: 'draft',
      published: false,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
