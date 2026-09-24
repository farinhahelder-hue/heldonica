import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAiAuth } from '@/lib/ai-auth';

export const dynamic = 'force-dynamic';

function getSupabaseService() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function echapperCsv(valeur: string | number | null | undefined): string {
  if (valeur === null || valeur === undefined) return '""';
  const str = String(valeur).replace(/"/g, '""');
  return `"${str}"`;
}

type ApiKeyRow = {
  id: string;
  name: string;
  key_prefix: string;
  created_at: string;
  last_used_at: string | null;
  rate_limit: number;
  is_active: boolean;
};

type AiLogEntry = {
  id: string;
  api_key_id: string | null;
  agent_name: string;
  endpoint: string;
  model: string;
  prompt_preview: string | null;
  status_code: number;
  duration_ms: number;
  error: string | null;
  created_at: string;
};

export async function GET(req: NextRequest) {
  // 1. Authentification stricte (session CMS ou clé API valide)
  const auth = await verifyAiAuth(req);
  if (!auth.ok) {
    return auth.response;
  }

  const sb = getSupabaseService();
  if (!sb) {
    return NextResponse.json(
      { error: 'Service Supabase indisponible' },
      { status: 503 }
    );
  }

  const urlObj = (req as NextRequest).nextUrl || new URL(req.url);
  const agentFilter = urlObj.searchParams.get('agent')?.trim() || null;
  const endpointFilter = urlObj.searchParams.get('endpoint')?.trim() || null;
  const limitParam = parseInt(urlObj.searchParams.get('limit') || '100', 10);
  const limit = Math.min(Math.max(limitParam, 1), 500);
  const isExportCsv = urlObj.searchParams.get('export') === 'csv';

  try {
    // 2. Récupération des clés API configurées
    const { data: keysData, error: eKeys } = await sb
      .from('api_keys')
      .select('id, name, key_prefix, created_at, last_used_at, rate_limit, is_active')
      .order('created_at', { ascending: true });

    if (eKeys) {
      console.warn('[ai-analytics] Erreur lecture api_keys :', eKeys.message);
    }

    const apiKeys: ApiKeyRow[] = (keysData as ApiKeyRow[]) || [];

    // 3. Récupération des logs de requêtes récents
    let query = sb
      .from('ai_requests_log')
      .select('id, api_key_id, agent_name, endpoint, model, prompt_preview, status_code, duration_ms, error, created_at')
      .order('created_at', { ascending: false });

    if (agentFilter && agentFilter !== 'all') {
      query = query.eq('agent_name', agentFilter);
    }

    if (endpointFilter && endpointFilter !== 'all') {
      query = query.eq('endpoint', endpointFilter);
    }

    const { data: logsData, error: eLogs } = await query.limit(limit);

    if (eLogs) {
      console.warn('[ai-analytics] Erreur lecture ai_requests_log :', eLogs.message);
    }

    const logs: AiLogEntry[] = (logsData as AiLogEntry[]) || [];

    // 4. Si export CSV demandé
    if (isExportCsv) {
      const csvEnTetes = [
        'ID',
        'Date UTC',
        'Agent',
        'Endpoint',
        'Modèle',
        'Code Statut',
        'Durée (ms)',
        'Prompt Aperçu',
        'Erreur',
      ];

      const csvLignes = logs.map((l: AiLogEntry) => [
        echapperCsv(l.id),
        echapperCsv(l.created_at),
        echapperCsv(l.agent_name),
        echapperCsv(l.endpoint),
        echapperCsv(l.model),
        echapperCsv(l.status_code),
        echapperCsv(l.duration_ms),
        echapperCsv(l.prompt_preview),
        echapperCsv(l.error),
      ].join(','));

      const csvContenu = [csvEnTetes.join(','), ...csvLignes].join('\r\n');

      return new NextResponse(csvContenu, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="heldonica-ai-logs-${new Date().toISOString().slice(0, 10)}.csv"`,
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    }

    // 5. Calcul des métriques globales
    const totalRequests = logs.length;
    const successRequests = logs.filter((l: AiLogEntry) => l.status_code >= 200 && l.status_code < 400).length;
    const errorRequests = logs.filter((l: AiLogEntry) => l.status_code >= 400).length;
    const successRate = totalRequests > 0 ? Math.round((successRequests / totalRequests) * 1000) / 10 : 100;

    const totalDuration = logs.reduce((acc: number, l: AiLogEntry) => acc + (l.duration_ms || 0), 0);
    const avgDurationMs = totalRequests > 0 ? Math.round(totalDuration / totalRequests) : 0;

    // Calcul des requêtes des dernières 24h
    const now = Date.now();
    const ilYADernieres24h = now - 24 * 60 * 60 * 1000;
    const requestsLast24h = logs.filter(
      (l: AiLogEntry) => l.created_at && new Date(l.created_at).getTime() >= ilYADernieres24h
    ).length;

    // Ventilation par agent
    const agentMap = new Map<string, {
      name: string;
      quota: number;
      isActive: boolean;
      lastUsedAt: string | null;
      requestsCount: number;
      errorsCount: number;
      totalDurationMs: number;
    }>();

    // Initialiser avec les clés déclarées
    for (const key of apiKeys) {
      agentMap.set(key.name, {
        name: key.name,
        quota: key.rate_limit || 100,
        isActive: key.is_active ?? true,
        lastUsedAt: key.last_used_at,
        requestsCount: 0,
        errorsCount: 0,
        totalDurationMs: 0,
      });
    }

    // Agréger depuis les logs
    for (const log of logs) {
      const name = log.agent_name || 'inconnu';
      if (!agentMap.has(name)) {
        agentMap.set(name, {
          name,
          quota: 100,
          isActive: true,
          lastUsedAt: log.created_at,
          requestsCount: 0,
          errorsCount: 0,
          totalDurationMs: 0,
        });
      }
      const item = agentMap.get(name)!;
      item.requestsCount += 1;
      if (log.status_code >= 400) {
        item.errorsCount += 1;
      }
      item.totalDurationMs += log.duration_ms || 0;
      if (!item.lastUsedAt || new Date(log.created_at) > new Date(item.lastUsedAt)) {
        item.lastUsedAt = log.created_at;
      }
    }

    const agentsList = Array.from(agentMap.values()).map((a) => ({
      ...a,
      avgDurationMs: a.requestsCount > 0 ? Math.round(a.totalDurationMs / a.requestsCount) : 0,
    }));

    // Ventilation par endpoint
    const endpointMap = new Map<string, {
      endpoint: string;
      count: number;
      errors: number;
      totalDurationMs: number;
    }>();

    for (const log of logs) {
      const ep = log.endpoint || '/api/ai/*';
      if (!endpointMap.has(ep)) {
        endpointMap.set(ep, { endpoint: ep, count: 0, errors: 0, totalDurationMs: 0 });
      }
      const item = endpointMap.get(ep)!;
      item.count += 1;
      if (log.status_code >= 400) item.errors += 1;
      item.totalDurationMs += log.duration_ms || 0;
    }

    const endpointsList = Array.from(endpointMap.values()).map((e) => ({
      endpoint: e.endpoint,
      count: e.count,
      errors: e.errors,
      avgDurationMs: e.count > 0 ? Math.round(e.totalDurationMs / e.count) : 0,
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      summary: {
        totalRequests,
        successRequests,
        errorRequests,
        successRate,
        avgDurationMs,
        requestsLast24h,
        activeKeysCount: apiKeys.filter((k: ApiKeyRow) => k.is_active).length,
      },
      agents: agentsList,
      endpoints: endpointsList,
      recentLogs: logs,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[ai-analytics] Exception :', errorMsg);
    return NextResponse.json(
      { error: 'Erreur interne lors de la récupération des analytics', details: errorMsg },
      { status: 500 }
    );
  }
}
