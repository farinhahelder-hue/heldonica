'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  RefreshCw,
  Download,
  Bot,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Zap,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface AgentStat {
  name: string;
  quota: number;
  isActive: boolean;
  lastUsedAt: string | null;
  requestsCount: number;
  errorsCount: number;
  avgDurationMs: number;
}

interface EndpointStat {
  endpoint: string;
  count: number;
  errors: number;
  avgDurationMs: number;
}

interface LogEntry {
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
}

interface AnalyticsData {
  success: boolean;
  summary: {
    totalRequests: number;
    successRequests: number;
    errorRequests: number;
    successRate: number;
    avgDurationMs: number;
    requestsLast24h: number;
    activeKeysCount: number;
  };
  agents: AgentStat[];
  endpoints: EndpointStat[];
  recentLogs: LogEntry[];
}

function formatDuree(ms: number): string {
  if (ms < 1000) return `${ms} ms`;
  return `${(ms / 1000).toFixed(1)} s`;
}

function formatRelativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Jamais utilisé';
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'À l’instant';
  if (minutes < 60) return `Il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `Il y a ${heures} h`;
  const jours = Math.floor(heures / 24);
  return `Il y a ${jours} j`;
}

function badgeAgent(agentName: string) {
  switch (agentName?.toLowerCase()) {
    case 'antigravity':
      return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', icon: '⚡' };
    case 'claude':
      return { bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: '🧠' };
    case 'pencode':
      return { bg: 'bg-purple-50 text-purple-800 border-purple-200', icon: '✍️' };
    case 'mobile_apk':
      return { bg: 'bg-sky-50 text-sky-800 border-sky-200', icon: '📱' };
    case 'cms_session':
      return { bg: 'bg-stone-100 text-stone-700 border-stone-300', icon: '👤' };
    default:
      return { bg: 'bg-stone-50 text-stone-600 border-stone-200', icon: '🤖' };
  }
}

export default function AiAnalyticsDashboard({ embedded = false }: { embedded?: boolean }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'error'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);

  const chargerDonnees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/ai/analytics?limit=150');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: Échec de chargement des statistiques`);
      }
      const json: AnalyticsData = await res.json();
      setData(json);
      setLastRefreshedAt(new Date());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur réseau');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    chargerDonnees();
  }, [chargerDonnees]);

  // Auto-refresh toutes les 30s
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      chargerDonnees();
    }, 30000);
    return () => clearInterval(interval);
  }, [autoRefresh, chargerDonnees]);

  // Filtrage des logs
  const logsFiltres = useMemo(() => {
    if (!data?.recentLogs) return [];
    return data.recentLogs.filter((log) => {
      if (selectedAgent !== 'all' && log.agent_name !== selectedAgent) {
        return false;
      }
      if (statusFilter === 'success' && (log.status_code < 200 || log.status_code >= 400)) {
        return false;
      }
      if (statusFilter === 'error' && log.status_code < 400) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const inPrompt = log.prompt_preview?.toLowerCase().includes(query);
        const inEp = log.endpoint.toLowerCase().includes(query);
        const inAgent = log.agent_name.toLowerCase().includes(query);
        const inErr = log.error?.toLowerCase().includes(query);
        if (!inPrompt && !inEp && !inAgent && !inErr) return false;
      }
      return true;
    });
  }, [data?.recentLogs, selectedAgent, statusFilter, searchQuery]);

  return (
    <div className={`space-y-6 ${embedded ? 'p-0' : 'max-w-7xl mx-auto px-4 sm:px-6 py-8'}`}>
      {/* ── En-tête ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-[#6B2D1F] flex items-center gap-2">
              <BarChart3 className="text-[#2D8B7A]" size={26} />
              <span>Conso & Analytics IA Heldonica</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Supabase
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Supervision en temps réel des quotas agents, latences Gemini 2.5 Flash et logs d&apos;appels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Auto-Refresh */}
          <button
            type="button"
            onClick={() => setAutoRefresh((v) => !v)}
            className={`text-xs px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition-colors ${
              autoRefresh
                ? 'bg-[#2D8B7A]/15 border-[#2D8B7A] text-[#2D8B7A]'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
            title="Rafraîchir automatiquement toutes les 30s"
          >
            <Activity size={13} className={autoRefresh ? 'animate-spin' : ''} />
            <span>Auto (30s) : {autoRefresh ? 'Activé' : 'Désactivé'}</span>
          </button>

          {/* Bouton Actualiser */}
          <button
            type="button"
            onClick={() => chargerDonnees()}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-700 font-medium flex items-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin text-[#2D8B7A]' : ''} />
            <span>Actualiser</span>
          </button>

          {/* Bouton Export CSV */}
          <a
            href="/api/ai/analytics?export=csv"
            download
            className="text-xs px-3 py-1.5 rounded-lg border border-stone-200 bg-white hover:border-[#2D8B7A] hover:text-[#2D8B7A] text-stone-700 font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download size={13} />
            <span>Export CSV</span>
          </a>

          {/* Lien vers Copilote */}
          <Link
            href="/panel-manager/copilote"
            className="text-xs px-3 py-1.5 rounded-lg bg-[#6B2D1F] hover:bg-[#522116] text-white font-medium flex items-center gap-1.5 transition-all shadow-xs"
          >
            <Bot size={13} />
            <span>Ouvrir Copilote</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700 text-xs">
          <AlertTriangle size={18} className="shrink-0" />
          <div className="flex-1 font-medium">{error}</div>
          <button
            type="button"
            onClick={() => chargerDonnees()}
            className="underline hover:no-underline text-xs"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* ── 4 Cartes KPIs Principales ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Requêtes */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Requêtes</span>
            <Activity size={18} className="text-[#2D8B7A]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-800">
            {loading && !data ? '...' : data?.summary.totalRequests ?? 0}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
            <span>Dernières 24h :</span>
            <span className="font-semibold text-stone-600">{data?.summary.requestsLast24h ?? 0}</span>
          </div>
        </div>

        {/* Taux de Succès */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Taux de Succès</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
            {loading && !data ? '...' : `${data?.summary.successRate ?? 100}%`}
          </div>
          <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-medium">{data?.summary.successRequests ?? 0} OK</span>
            <span>·</span>
            <span className={data?.summary.errorRequests ? 'text-red-600 font-semibold' : 'text-stone-400'}>
              {data?.summary.errorRequests ?? 0} erreurs
            </span>
          </div>
        </div>

        {/* Latence Moyenne */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Latence Moyenne</span>
            <Clock size={18} className="text-[#C4714A]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-800">
            {loading && !data ? '...' : formatDuree(data?.summary.avgDurationMs ?? 0)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Gemini 2.5 Flash + garde-fous
          </div>
        </div>

        {/* Clés & Agents Actifs */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Agents Actifs</span>
            <ShieldCheck size={18} className="text-[#6B2D1F]" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-stone-800">
            {loading && !data ? '...' : `${data?.summary.activeKeysCount ?? 0} clés`}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">
            Antigravity, Claude, Mobile, Pencode
          </div>
        </div>
      </div>

      {/* ── Section Agents & Quotas ─────────────────────────────────────────── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-stone-800 flex items-center gap-2">
              <Bot size={18} className="text-[#2D8B7A]" />
              <span>Agents IA & Quotas Autorisés</span>
            </h2>
            <p className="text-xs text-stone-500">
              Quotas glissants configurés dans <code className="text-stone-700 bg-stone-100 px-1 py-0.5 rounded">api_keys</code>
            </p>
          </div>
          {selectedAgent !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedAgent('all')}
              className="text-xs text-stone-500 hover:text-stone-800 underline"
            >
              Réinitialiser le filtre agent
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {data?.agents.map((agent) => {
            const b = badgeAgent(agent.name);
            const isSelected = selectedAgent === agent.name;
            return (
              <button
                key={agent.name}
                type="button"
                onClick={() => setSelectedAgent(isSelected ? 'all' : agent.name)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-[#2D8B7A] bg-[#2D8B7A]/5 ring-2 ring-[#2D8B7A]/30 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 hover:bg-stone-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${b.bg}`}>
                    <span>{b.icon}</span>
                    <span className="font-mono">{agent.name}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                    {agent.quota} req/h
                  </span>
                </div>

                <div className="flex items-baseline justify-between mt-3">
                  <span className="text-xl font-bold text-stone-800">{agent.requestsCount}</span>
                  <span className="text-[11px] text-stone-400">
                    {agent.errorsCount > 0 ? (
                      <span className="text-red-500 font-semibold">{agent.errorsCount} err</span>
                    ) : (
                      '0 err'
                    )}
                  </span>
                </div>

                <div className="mt-2 pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Dernier appel :</span>
                  <span className="font-medium text-stone-600">{formatRelativeTime(agent.lastUsedAt)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Section Ventilation Endpoints & Modèle ──────────────────────────── */}
      {data?.endpoints && data.endpoints.length > 0 && (
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-2xs">
          <h2 className="text-sm sm:text-base font-bold text-stone-800 mb-1 flex items-center gap-2">
            <Zap size={18} className="text-[#C4714A]" />
            <span>Répartition par Endpoint Universel</span>
          </h2>
          <p className="text-xs text-stone-500 mb-4">
            Volume de requêtes et latences moyennes par route d&apos;API IA
          </p>

          <div className="space-y-3">
            {data.endpoints.map((ep) => {
              const maxCount = Math.max(...data.endpoints.map((e) => e.count), 1);
              const pct = Math.round((ep.count / maxCount) * 100);
              return (
                <div key={ep.endpoint} className="border border-stone-100 rounded-xl p-3 bg-stone-50/40">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-mono font-bold text-stone-700">{ep.endpoint}</span>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="font-semibold text-stone-800">{ep.count} req</span>
                      <span className="text-stone-400">~{formatDuree(ep.avgDurationMs)}</span>
                      {ep.errors > 0 && (
                        <span className="text-red-600 font-semibold text-[11px]">{ep.errors} err</span>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#2D8B7A] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Section Journal des Requêtes en Direct (`ai_requests_log`) ───────── */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-stone-800 flex items-center gap-2">
              <Clock size={18} className="text-stone-600" />
              <span>Journal des Requêtes IA en Direct</span>
              <span className="text-xs font-normal text-stone-400">
                ({logsFiltres.length} résultat{logsFiltres.length > 1 ? 's' : ''})
              </span>
            </h2>
            <p className="text-xs text-stone-500">
              Historique récent stocké dans la table Supabase <code className="text-stone-700 bg-stone-100 px-1 py-0.5 rounded">ai_requests_log</code>
            </p>
          </div>

          {/* Filtres & Recherche */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Input recherche */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Rechercher prompt..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#2D8B7A]"
              />
            </div>

            {/* Sélecteur Agent */}
            <select
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="text-xs px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#2D8B7A]"
            >
              <option value="all">Tous les agents</option>
              {data?.agents.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>

            {/* Sélecteur Statut */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'success' | 'error')}
              className="text-xs px-2.5 py-1.5 border border-stone-300 rounded-lg bg-white text-stone-700 focus:outline-none focus:ring-1 focus:ring-[#2D8B7A]"
            >
              <option value="all">Tous statuts</option>
              <option value="success">✓ Succès (2xx)</option>
              <option value="error">✗ Erreurs (4xx / 5xx)</option>
            </select>
          </div>
        </div>

        {/* Tableau des logs */}
        <div className="overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-left text-xs text-stone-600">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Agent</th>
                <th className="py-2.5 px-3">Endpoint</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3">Durée</th>
                <th className="py-2.5 px-3">Aperçu du prompt</th>
                <th className="py-2.5 px-3 text-right">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {logsFiltres.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-stone-400">
                    {loading ? 'Chargement des logs...' : 'Aucune requête trouvée pour ces critères.'}
                  </td>
                </tr>
              ) : (
                logsFiltres.map((log) => {
                  const b = badgeAgent(log.agent_name);
                  const isOk = log.status_code >= 200 && log.status_code < 400;
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <React.Fragment key={log.id}>
                      <tr
                        className={`hover:bg-stone-50/70 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-stone-50' : ''
                        }`}
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                      >
                        <td className="py-2.5 px-3 whitespace-nowrap text-stone-500 font-mono text-[11px]">
                          {new Date(log.created_at).toLocaleTimeString('fr-FR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono border ${b.bg}`}>
                            <span>{b.icon}</span>
                            <span>{log.agent_name}</span>
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-[11px] text-stone-700">
                          {log.endpoint}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isOk ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                            }`}
                          >
                            {log.status_code}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap text-stone-500 font-mono text-[11px]">
                          {formatDuree(log.duration_ms)}
                        </td>
                        <td className="py-2.5 px-3 max-w-xs truncate text-stone-700">
                          {log.prompt_preview || <span className="text-stone-300 italic">—</span>}
                        </td>
                        <td className="py-2.5 px-3 text-right whitespace-nowrap text-stone-400">
                          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </td>
                      </tr>

                      {/* Ligne dépliée pour détails */}
                      {isExpanded && (
                        <tr className="bg-stone-50/90 border-b border-stone-200">
                          <td colSpan={7} className="p-4 space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div>
                                <span className="font-semibold text-stone-700 block mb-1">
                                  Notes de terrain / Contexte transmis :
                                </span>
                                <div className="p-3 bg-white rounded-lg border border-stone-200 font-mono text-[11px] text-stone-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                                  {log.prompt_preview || 'Aucun aperçu disponible'}
                                </div>
                              </div>
                              <div>
                                <span className="font-semibold text-stone-700 block mb-1">Métadonnées :</span>
                                <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-1 text-[11px] font-mono">
                                  <div>
                                    <span className="text-stone-400">ID Requête :</span> {log.id}
                                  </div>
                                  <div>
                                    <span className="text-stone-400">Modèle IA :</span> {log.model}
                                  </div>
                                  <div>
                                    <span className="text-stone-400">Date complète :</span> {log.created_at}
                                  </div>
                                  {log.error && (
                                    <div className="text-red-600 font-semibold pt-1 border-t border-red-100">
                                      <span className="text-red-400">Erreur :</span> {log.error}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {lastRefreshedAt && (
          <div className="text-right text-[11px] text-stone-400">
            Dernière synchronisation : {lastRefreshedAt.toLocaleTimeString('fr-FR')}
          </div>
        )}
      </div>
    </div>
  );
}
