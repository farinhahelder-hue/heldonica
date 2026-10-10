/**
 * Heldonica CMS — Journal d'audit (Audit Log) & Traçabilité des modifications.
 *
 * Enregistre qui a modifié quoi, à quelle heure, avec le diff JSONB précis.
 * Règle AGENTS.md : résilience totale (aucune écriture en base sans vérification d'erreur).
 */

import { supabase } from '@/lib/supabase-client';
import type { CmsAction, CmsEntity, CmsUser } from './cms-access';

export interface CmsAuditEntry {
  user: CmsUser;
  action: CmsAction;
  entity: CmsEntity;
  entityId?: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  metadata?: Record<string, unknown>;
}

export interface CmsAuditLogItem {
  id: string;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  action: string;
  entity: string;
  entity_id: string | null;
  diff: Record<string, { before: unknown; after: unknown }>;
  metadata: Record<string, unknown>;
  created_at: string;
}

/**
 * Calcule la différence exacte entre l'état précédent et l'état nouveau d'une ressource.
 * Exclut les champs techniques identiques pour ne conserver que les changements réels.
 */
export function calculateDiff(
  before: Record<string, unknown> | null | undefined,
  after: Record<string, unknown> | null | undefined
): Record<string, { before: unknown; after: unknown }> {
  const diff: Record<string, { before: unknown; after: unknown }> = {};

  const b = before || {};
  const a = after || {};

  const allKeys = new Set([...Object.keys(b), ...Object.keys(a)]);

  for (const key of allKeys) {
    // Ignorer les horodatages techniques s'ils sont les seuls à varier
    if (key === 'updated_at' || key === 'last_modified') continue;

    const valBefore = b[key];
    const valAfter = a[key];

    // Comparaison profonde par sérialisation JSON
    if (JSON.stringify(valBefore) !== JSON.stringify(valAfter)) {
      diff[key] = {
        before: valBefore === undefined ? null : valBefore,
        after: valAfter === undefined ? null : valAfter,
      };
    }
  }

  return diff;
}

/**
 * Enregistre un événement dans la table cms_audit_log.
 * Conçu pour être résilient et ne jamais interrompre le flux principal si la base est inaccessible.
 */
export async function logCmsAudit(entry: CmsAuditEntry): Promise<boolean> {
  const diff = calculateDiff(entry.before, entry.after);

  const payload = {
    user_id: entry.user.id,
    user_email: entry.user.email,
    user_role: entry.user.role,
    action: entry.action,
    entity: entry.entity,
    entity_id: entry.entityId || null,
    diff,
    metadata: entry.metadata || {},
  };

  try {
    if (!supabase) {
      console.warn('[cms-audit] Supabase non disponible, audit log ignoré en environnement local');
      return false;
    }

    const { error } = await supabase.from('cms_audit_log').insert(payload);

    if (error) {
      console.error('[cms-audit] Erreur écriture audit log:', error.message);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[cms-audit] Exception lors de l audit log:', err);
    return false;
  }
}

/**
 * Récupère les entrées récentes du journal d'audit pour l'interface d'administration.
 */
export async function getRecentAuditLogs(
  limit = 50,
  entity?: CmsEntity
): Promise<CmsAuditLogItem[]> {
  try {
    if (!supabase) return [];

    let query = supabase
      .from('cms_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (entity) {
      query = query.eq('entity', entity);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[cms-audit] Erreur lecture logs audit:', error.message);
      return [];
    }

    return (data as CmsAuditLogItem[]) || [];
  } catch (err) {
    console.error('[cms-audit] Exception lors de la lecture des logs:', err);
    return [];
  }
}
