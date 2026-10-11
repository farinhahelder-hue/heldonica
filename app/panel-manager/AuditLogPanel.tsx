'use client';

/**
 * AuditLogPanel — journal d'audit du CMS.
 *
 * Affiche les dernières modifications enregistrées dans `cms_audit_log`
 * (qui, quoi, quand, avec le diff). S'appuie sur `getRecentAuditLogs()` de
 * `lib/cms-audit.ts` : aucune donnée n'est fabriquée, le panneau ne rend que
 * ce que la base renvoie. En l'absence de base (environnement local), le
 * panneau affiche un état vide explicite plutôt que des entrées fictives.
 */

import { useCallback, useEffect, useState } from 'react';
import { getRecentAuditLogs, type CmsAuditLogItem } from '@/lib/cms-audit';

const DEFAULT_LIMIT = 50;

const ACTION_LABELS: Record<string, string> = {
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  publish: 'Publication',
  unpublish: 'Dépublication',
  login: 'Connexion',
};

function formatDate(value: string): string {
  const d = new Date(value);
  if (isNaN(d.valueOf())) return value;
  return d.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function describeDiff(item: CmsAuditLogItem): string {
  const keys = Object.keys(item.diff || {});
  if (keys.length === 0) return '—';
  return keys.join(', ');
}

export default function AuditLogPanel() {
  const [items, setItems] = useState<CmsAuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const logs = await getRecentAuditLogs(DEFAULT_LIMIT);
      setItems(logs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement du journal.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Journal d’audit</h2>
        <button
          type="button"
          onClick={() => void load()}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
        >
          Rafraîchir
        </button>
      </div>

      {loading && <p className="text-sm text-gray-500">Chargement du journal…</p>}

      {error && !loading && (
        <p className="text-sm text-red-600">Erreur : {error}</p>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-sm text-gray-500">
          Aucune entrée d’audit enregistrée pour le moment.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Utilisateur</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Entité</th>
                <th className="px-3 py-2">Champs modifiés</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-2 text-gray-600">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-3 py-2 text-gray-800">
                    {item.user_email || item.user_id || '—'}
                  </td>
                  <td className="px-3 py-2 text-gray-800">
                    {ACTION_LABELS[item.action] || item.action}
                  </td>
                  <td className="px-3 py-2 text-gray-600">
                    {item.entity}
                    {item.entity_id ? ` #${item.entity_id}` : ''}
                  </td>
                  <td className="px-3 py-2 text-gray-600">{describeDiff(item)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
