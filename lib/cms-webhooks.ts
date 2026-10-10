/**
 * Heldonica CMS — Webhooks Sortants Signés HMAC (Intégration Flotte IA, n8n, Discord)
 *
 * Implémenté pour la Phase 5 du CMS (Pattern Strapi Webhooks).
 * Permet de notifier instantanément les services externes et agents lors d'événements :
 * - `article.published`
 * - `article.created`
 * - `accommodation.published`
 * - `release.published`
 *
 * Sécurité & Règle AGENTS.md :
 * - Chaque payload peut être signé par HMAC-SHA256 (header `X-Heldonica-Signature: sha256=...`).
 * - Journalisation de chaque livraison dans `cms_webhook_deliveries`.
 * - Résilience totale : un webhook défaillant ne bloque jamais l'opération CMS.
 */

import { createHmac } from 'node:crypto';
import { supabase } from '@/lib/supabase-client';

export type CmsWebhookEvent =
  | 'article.published'
  | 'article.created'
  | 'accommodation.published'
  | 'release.published';

export interface CmsWebhook {
  id: string;
  name: string;
  url: string;
  events: CmsWebhookEvent[];
  secret?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WebhookDeliveryResult {
  webhookId: string;
  url: string;
  success: boolean;
  statusCode?: number;
  error?: string;
}

/**
 * Calcule la signature HMAC-SHA256 d'un payload JSON.
 */
export function signWebhookPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Enregistre un nouveau webhook dans la base.
 */
export async function createCmsWebhook(params: {
  name: string;
  url: string;
  events: CmsWebhookEvent[];
  secret?: string;
}): Promise<{ success: boolean; webhook?: CmsWebhook; error?: string }> {
  const { name, url, events, secret } = params;

  if (!name || !name.trim()) return { success: false, error: 'Nom requis.' };
  if (!url || !url.startsWith('https://')) return { success: false, error: 'URL HTTPS valide requise.' };
  if (!events || events.length === 0) return { success: false, error: 'Au moins un événement requis.' };

  if (!supabase) return { success: false, error: 'Supabase non configuré.' };

  const payload = {
    name: name.trim(),
    url: url.trim(),
    events,
    secret: secret?.trim() || null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('cms_webhooks')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('[CmsWebhooks] Erreur création webhook:', error);
    return { success: false, error: error.message };
  }

  return { success: true, webhook: data as CmsWebhook };
}

/**
 * Récupère la liste des webhooks configurés.
 */
export async function listCmsWebhooks(): Promise<{ success: boolean; webhooks: CmsWebhook[]; error?: string }> {
  if (!supabase) return { success: false, webhooks: [], error: 'Supabase non configuré.' };

  const { data, error } = await supabase
    .from('cms_webhooks')
    .select('id, name, url, events, is_active, created_at, updated_at')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[CmsWebhooks] Erreur lecture webhooks:', error);
    return { success: false, webhooks: [], error: error.message };
  }

  return { success: true, webhooks: (data || []) as CmsWebhook[] };
}

/**
 * Supprime un webhook par son identifiant.
 */
export async function deleteCmsWebhook(id: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: 'Supabase non configuré.' };

  const { error } = await supabase
    .from('cms_webhooks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[CmsWebhooks] Erreur suppression webhook:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Déclenche l'envoi asynchrone des webhooks souscrits à un événement.
 */
export async function triggerCmsWebhooks(
  event: CmsWebhookEvent,
  payload: Record<string, unknown>
): Promise<WebhookDeliveryResult[]> {
  if (!supabase) return [];

  const { data: webhooks, error: listErr } = await supabase
    .from('cms_webhooks')
    .select('*')
    .eq('is_active', true);

  if (listErr || !webhooks) {
    console.error('[CmsWebhooks] Erreur récupération webhooks actifs:', listErr?.message);
    return [];
  }

  // Filtrer les webhooks qui écoutent cet événement
  const targets = (webhooks as CmsWebhook[]).filter((w) => w.events.includes(event));
  if (targets.length === 0) return [];

  const bodyString = JSON.stringify({
    event,
    timestamp: new Date().toISOString(),
    data: payload,
  });

  const results: WebhookDeliveryResult[] = [];

  for (const hook of targets) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Heldonica-CMS-Webhooks/1.0',
      'X-Heldonica-Event': event,
    };

    if (hook.secret) {
      const signature = signWebhookPayload(bodyString, hook.secret);
      headers['X-Heldonica-Signature'] = `sha256=${signature}`;
    }

    try {
      const response = await fetch(hook.url, {
        method: 'POST',
        headers,
        body: bodyString,
        signal: AbortSignal.timeout(6000), // timeout 6s
      });

      const resText = await response.text().catch(() => '');
      const success = response.ok;

      // Journalisation de la livraison
      const { error: logErr } = await supabase
        .from('cms_webhook_deliveries')
        .insert([
          {
            webhook_id: hook.id,
            event,
            payload,
            status_code: response.status,
            response_body: resText.slice(0, 1000), // limite 1000 chars
            success,
            delivered_at: new Date().toISOString(),
          },
        ]);

      if (logErr) {
        console.warn('[CmsWebhooks] Impossible de logger la livraison:', logErr.message);
      }

      results.push({
        webhookId: hook.id,
        url: hook.url,
        success,
        statusCode: response.status,
      });
    } catch (deliveryErr: unknown) {
      const errMsg = deliveryErr instanceof Error ? deliveryErr.message : String(deliveryErr);
      console.warn(`[CmsWebhooks] Échec d'envoi vers ${hook.url}:`, errMsg);

      const { error: logErr } = await supabase
        .from('cms_webhook_deliveries')
        .insert([
          {
            webhook_id: hook.id,
            event,
            payload,
            status_code: 0,
            response_body: `Erreur: ${errMsg}`,
            success: false,
            delivered_at: new Date().toISOString(),
          },
        ]);

      if (logErr) {
        console.warn('[CmsWebhooks] Impossible de logger l’échec:', logErr.message);
      }

      results.push({
        webhookId: hook.id,
        url: hook.url,
        success: false,
        error: errMsg,
      });
    }
  }

  return results;
}
