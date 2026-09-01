import { NextRequest, NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { generateAiCompletion } from '@/lib/ai-provider';
import { HELDONICA_B2C_PROMPT, validateGardeFous } from '@/lib/brand-voice';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/**
 * Meta signe chaque livraison avec HMAC-SHA256 du corps brut, clé = secret de
 * l'application. Sans ce contrôle, l'URL suffit à injecter de faux
 * commentaires : leur texte alimente ensuite le prompt du brouillon IA, qu'un
 * humain approuve « en un clic » — donc une publication sur le vrai compte.
 */
function signatureValide(brut: string, entete: string | null): boolean {
  const secret = process.env.FACEBOOK_APP_SECRET?.trim()
    || process.env.META_APP_SECRET?.trim();

  // Sans secret configuré, on refuse : accepter faute de mieux reviendrait à
  // laisser l'endpoint ouvert tout en le croyant protégé.
  if (!secret || !entete?.startsWith('sha256=')) return false;

  const attendu = createHmac('sha256', secret).update(brut, 'utf8').digest('hex');
  const recu = entete.slice('sha256='.length);

  const a = Buffer.from(attendu, 'hex');
  const b = Buffer.from(recu, 'hex');
  // timingSafeEqual exige des longueurs égales ; une signature tronquée doit
  // échouer sans lever d'exception.
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * GET: Vérification du webhook Meta (Handshake / Challenge)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  // Pas de repli codé en dur : le dépôt est public, un jeton écrit ici serait
  // lisible par tous et n'authentifierait plus rien.
  const verifyToken = (process.env.WEBHOOK_VERIFY_TOKEN
    || process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN)?.trim();

  if (!verifyToken) {
    return NextResponse.json(
      { error: 'Webhook non configuré : WEBHOOK_VERIFY_TOKEN manquant.' },
      { status: 503 }
    );
  }

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Instagram Webhook] Challenge validé avec succès.');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification token mismatch' }, { status: 403 });
}

/**
 * POST: Réception des événements en temps réel (Commentaires & Messages)
 */
export async function POST(req: NextRequest) {
  try {
    // Le corps est lu en texte : la signature porte sur les octets exacts reçus,
    // qu'un aller-retour JSON.parse/stringify ne restituerait pas à l'identique.
    const brut = await req.text();

    if (!signatureValide(brut, req.headers.get('x-hub-signature-256'))) {
      return NextResponse.json({ error: 'Signature invalide' }, { status: 401 });
    }

    const body = JSON.parse(brut);
    const supabase = getSupabase();

    // 1. Log webhook
    if (supabase) {
      await (supabase as any).from('instagram_webhook_logs').insert({
        event_type: body.object || 'instagram',
        payload: body,
        processed: true,
        created_at: new Date().toISOString(),
      }).catch(() => {});
    }

    if (body.object === 'instagram') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          const { field, value } = change;

          // Traitement des commentaires
          if (field === 'comments' && value) {
            const { id: commentId, media, text, from, parent_id } = value;
            const username = from?.username || 'voyageur';
            const mediaId = media?.id || value.media_id;

            if (text && commentId) {
              // 2. Génération du brouillon de réponse IA
              const prompt = `${HELDONICA_B2C_PROMPT}

Un voyageur (@${username}) a laissé ce commentaire sur l'une de nos publications Instagram :
"${text}"

RÈGLES ABSOLUES :
1. "On n'invente rien. On raconte ce qu'on a vécu." Si la question demande un renseignement très précis que tu ignores, invite chaleureusement à envoyer un message ou à consulter le carnet complet sur heldonica.fr.
2. PRONOMS : Tutoiement complice "tu" pour le voyageur, "on" pour le duo.
3. TON : Bienveillant, direct, poétique et sobre. Maximum 2 à 3 phrases.
4. ZÉRO MOT BANNI : Pas de (bon plan, incontournable, tips, magnifique, incroyable, spot, optimiser, paradis).

Rédige la proposition de réponse directe :`;

              const aiRes = await generateAiCompletion({
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                max_tokens: 300,
              }).catch(() => null);

              const aiDraft = aiRes?.content?.trim() || 'Merci pour ton mot ! On a partagé tous nos repères détaillés dans nos carnets sur le site. N\'hésite pas si tu as des questions !';
              const audit = validateGardeFous(aiDraft, 'b2c');

              // 3. Sauvegarde dans Supabase pour validation 1-clic
              if (supabase) {
                await (supabase as any).from('instagram_comments').upsert(
                  {
                    ig_comment_id: commentId,
                    media_id: mediaId,
                    parent_id: parent_id || null,
                    username,
                    text,
                    status: 'pending_review',
                    ai_draft: aiDraft,
                    ai_confidence: audit.passed ? 0.95 : 0.75,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  },
                  { onConflict: 'ig_comment_id' }
                );
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ status: 'EVENT_RECEIVED' }, { status: 200 });
  } catch (error: any) {
    console.error('[Instagram Webhook Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
