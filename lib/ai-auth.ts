import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export interface AiAgentContext {
  ok: boolean;
  agentName?: string;
  keyId?: string;
  status?: number;
  error?: string;
  response?: NextResponse;
}

// Aucun jeton n'est écrit dans le code : le 16/09/2026 quatre jetons
// d'amorçage codés ici (et acceptés en repli plus bas) se sont retrouvés dans
// le dépôt public ; ils ont été révoqués. Une clé n'existe que sous forme de
// hash dans `api_keys` — voir scripts/seed_agent_keys.mjs pour en créer.

export function hashApiKey(token: string): string {
  return crypto.createHash('sha256').update(token.trim()).digest('hex');
}

function getSupabaseService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

/**
 * Extrait le token API des en-têtes de la requête (x-api-key ou Authorization: Bearer).
 */
export function extractApiKey(req: NextRequest): string | null {
  const xApiKey = req.headers.get('x-api-key')?.trim();
  if (xApiKey) return xApiKey;

  const authHeader = req.headers.get('authorization')?.trim();
  if (authHeader) {
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7).trim();
    }
    if (authHeader.startsWith('hld_')) {
      return authHeader;
    }
  }

  return null;
}

/**
 * Vérifie l'authentification de l'agent appelant :
 * 1. Par clé API agent (`x-api-key` ou `Bearer hld_...`)
 * 2. Par clé maître d'environnement `AI_AGENT_API_KEY`
 * 3. Par session CMS active (`requireCmsAuth`)
 */
export async function verifyAiAuth(req: NextRequest): Promise<AiAgentContext> {
  const token = extractApiKey(req);
  const masterKey = process.env.AI_AGENT_API_KEY?.trim();

  // 1. Authentification par Clé API fournie
  if (token) {
    // Vérification clé maître
    if (masterKey && token === masterKey) {
      return { ok: true, agentName: 'master_key', keyId: 'master' };
    }

    const tokenHash = hashApiKey(token);

    // Vérification table Supabase `api_keys`
    const sb = getSupabaseService();
    if (sb) {
      const { data, error } = await sb
        .from('api_keys')
        .select('id, name, rate_limit, is_active')
        .eq('key_hash', tokenHash)
        .maybeSingle();

      if (error) {
        // Table possiblement non migrée (PGRST205) — journalisé pour diagnostic
        if (error.code !== 'PGRST205' && error.code !== '42P01') {
          console.warn('[ai-auth] Erreur lecture api_keys :', error.message);
        }
      } else if (data) {
        if (!data.is_active) {
          return {
            ok: false,
            status: 403,
            error: 'Clé API désactivée',
            response: NextResponse.json({ error: 'Clé API désactivée' }, { status: 403 }),
          };
        }

        // Rate limiting par clé (fenêtre 1 heure)
        const rl = checkRateLimit(data.id, {
          limit: data.rate_limit || 100,
          prefix: 'ai_agent',
          windowMs: 3600_000,
        });

        if (!rl.success) {
          return {
            ok: false,
            status: 429,
            error: 'Limite de requêtes atteinte pour cette clé API (100 req/h)',
            response: NextResponse.json(
              { error: 'Limite de requêtes atteinte pour cette clé API' },
              {
                status: 429,
                headers: {
                  'X-RateLimit-Limit': String(rl.limit),
                  'X-RateLimit-Remaining': String(rl.remaining),
                  'X-RateLimit-Reset': String(rl.reset),
                },
              }
            ),
          };
        }

        // Mise à jour de last_used_at (non-bloquante pour la réponse)
        void (async () => {
          try {
            const { error: updateErr } = await sb
              .from('api_keys')
              .update({ last_used_at: new Date().toISOString() })
              .eq('id', data.id);
            if (updateErr) {
              console.warn('[ai-auth] Erreur mise à jour last_used_at:', updateErr.message);
            }
          } catch (err: unknown) {
            console.warn('[ai-auth] Exception last_used_at:', err);
          }
        })();

        return {
          ok: true,
          agentName: data.name,
          keyId: data.id,
        };
      }
    }

    // Token fourni mais inconnu
    return {
      ok: false,
      status: 401,
      error: 'Clé API invalide',
      response: NextResponse.json({ error: 'Clé API invalide' }, { status: 401 }),
    };
  }

  // 2. Pas de clé API : tentative d'authentification par session CMS
  const refusCms = await requireCmsAuth(req);
  if (!refusCms) {
    // Authentifié via session CMS
    const ip = getClientIp(req);
    const rl = checkRateLimit(ip, {
      limit: 100,
      prefix: 'ai_cms',
      windowMs: 3600_000,
    });
    if (!rl.success) {
      return {
        ok: false,
        status: 429,
        error: 'Trop de requêtes',
        response: NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 }),
      };
    }
    return {
      ok: true,
      agentName: 'cms_session',
      keyId: 'cms',
    };
  }

  // Refus complet
  return {
    ok: false,
    status: 401,
    error: 'Authentification requise (en-tête x-api-key ou session CMS)',
    response: NextResponse.json(
      { error: 'Authentification requise. Fournir une clé via x-api-key ou Authorization: Bearer <clé>' },
      { status: 401 }
    ),
  };
}

/**
 * Journalise une requête IA dans la table `ai_requests_log`.
 * Respecte strictement le garde-fou `check:erreurs-avalees`.
 */
export async function logAiRequest(params: {
  apiKeyId?: string;
  agentName: string;
  endpoint: string;
  model: string;
  promptPreview?: string;
  statusCode: number;
  durationMs: number;
  error?: string | null;
}): Promise<void> {
  const sb = getSupabaseService();
  if (!sb) return;

  const preview = (params.promptPreview || '').slice(0, 300);
  const isValidUuid = params.apiKeyId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(params.apiKeyId);

  const { error } = await sb.from('ai_requests_log').insert({
    api_key_id: isValidUuid ? params.apiKeyId : null,
    agent_name: params.agentName,
    endpoint: params.endpoint,
    model: params.model,
    prompt_preview: preview,
    status_code: params.statusCode,
    duration_ms: params.durationMs,
    error: params.error || null,
  });

  if (error) {
    if (error.code !== 'PGRST205' && error.code !== '42P01') {
      console.warn('[ai-auth] Journalisation non enregistrée dans ai_requests_log :', error.message);
    }
  }
}
