'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Shield, FileText, Code, Tag, BarChart3, Globe, Search, Zap, AlertTriangle, CheckCircle, XCircle, ChevronDown, ChevronRight } from 'lucide-react';

interface CheckResult {
  ok: boolean;
  detail: string;
  fix: string;
}

interface CategoryResult {
  score: number;
  max: number;
  checks: CheckResult[];
}

interface GeoAuditResponse {
  url: string;
  score: number;
  maxScore: number;
  percent: number;
  grade: string;
  breakdown: Record<string, { score: number; max: number; percent: number; grade: string }>;
  details: Record<string, CategoryResult>;
  recommendations: string[];
  timestamp: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  robots_txt: 'Robots.txt & AI Crawlers',
  llms_txt: 'llms.txt',
  schema: 'Schema JSON-LD',
  meta_tags: 'Meta Tags',
  content: 'Contenu',
  brand_entity: 'Marque & Entite',
  signals: 'Signaux techniques',
  ai_discovery: 'Decouverte IA',
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  robots_txt: <Shield size={14} />,
  llms_txt: <FileText size={14} />,
  schema: <Code size={14} />,
  meta_tags: <Tag size={14} />,
  content: <BarChart3 size={14} />,
  brand_entity: <Globe size={14} />,
  signals: <Zap size={14} />,
  ai_discovery: <Search size={14} />,
};

const GRADE_COLORS: Record<string, string> = {
  A: 'bg-emerald-500', B: 'bg-green-500', C: 'bg-yellow-500',
  D: 'bg-orange-500', E: 'bg-red-500',
};

const GRADE_TEXT: Record<string, string> = {
  A: 'text-emerald-600', B: 'text-green-600', C: 'text-yellow-600',
  D: 'text-orange-600', E: 'text-red-600',
};

export default function GeoAuditPanel() {
  const [data, setData] = useState<GeoAuditResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const runAudit = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cms/geo-audit');
      if (!res.ok) throw Error();
      const json = await res.json();
      setData(json);
    } catch {
      setError('Echec de l\'audit GEO');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { runAudit(); }, [runAudit]);

  const toggle = (key: string) => setExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  if (loading && !data) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 p-8">
        <RefreshCw size={14} className="animate-spin" /> Audit GEO en cours...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-red-500 mb-3">{error}</p>
        <button onClick={runAudit} className="px-4 py-2 text-sm bg-[#C4714A] text-white rounded-lg hover:bg-[#b05f3a]">Reessayer</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit GEO</h1>
          <p className="text-sm text-gray-400 mt-1">Visibilite sur les moteurs de recherche IA (ChatGPT, Perplexity, Google AI Overviews, Claude)</p>
        </div>
        <button onClick={runAudit} disabled={loading} className="flex items-center gap-2 px-4 py-2 text-sm border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 disabled:opacity-50">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Audit...' : 'Relancer'}
        </button>
      </div>

      <div className={`p-6 rounded-xl border ${data.percent >= 75 ? 'bg-emerald-50 border-emerald-200' : data.percent >= 50 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white ${GRADE_COLORS[data.grade] ?? 'bg-gray-400'}`}>
            {data.grade}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-gray-900">{data.percent}%</span>
              <span className="text-sm text-gray-400">/ 100</span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden mt-2">
              <div className={`h-full rounded-full transition-all ${GRADE_COLORS[data.grade] ?? 'bg-gray-400'}`} style={{ width: `${data.percent}%` }} />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {data.grade === 'A' ? 'Excellent : contenu optimise pour les moteurs de recherche IA.'
              : data.grade === 'B' ? 'Bon : quelques ajustements pour la visibilite IA.'
              : data.grade === 'C' ? 'Correct : plusieurs axes d\'amelioration pour l\'IA.'
              : data.grade === 'D' ? 'Faible : des optimisations IA importantes manquent.'
              : 'Critique : la plupart des signaux IA sont absents.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Object.entries(data.breakdown).map(([key, cat]) => (
          <div key={key} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
              {CATEGORY_ICONS[key]}
              <span>{CATEGORY_LABELS[key] ?? key}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-lg font-bold ${GRADE_TEXT[cat.grade] ?? 'text-gray-500'}`}>{cat.percent}%</span>
              <span className="text-xs text-gray-400">({cat.score}/{cat.max})</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
              <div className={`h-full rounded-full ${GRADE_COLORS[cat.grade] ?? 'bg-gray-400'}`} style={{ width: `${cat.percent}%` }} />
            </div>
          </div>
        ))}
      </div>

      {data.recommendations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-500" />
            Recommandations prioritaires
          </h3>
          <ul className="space-y-2">
            {data.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-amber-500 mt-0.5 shrink-0">!</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {Object.entries(data.details).map(([key, cat]) => (
          <div key={key}>
            <button onClick={() => toggle(key)} className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50">
              <div className="flex items-center gap-2">
                <span className={cat.score === cat.max ? 'text-emerald-500' : 'text-amber-500'}>
                  {cat.score === cat.max ? <CheckCircle size={16} /> : <XCircle size={16} />}
                </span>
                <span className="text-sm font-medium text-gray-900">{CATEGORY_LABELS[key] ?? key}</span>
                <span className={`text-xs font-semibold ${GRADE_TEXT[calculateGrade(cat.score, cat.max)] ?? 'text-gray-400'}`}>
                  {cat.score}/{cat.max}
                </span>
              </div>
              {expanded[key] ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
            </button>
            {expanded[key] && (
              <div className="px-5 pb-4 space-y-2">
                {cat.checks.map((check, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs">
                    <span className={check.ok ? 'text-emerald-500 shrink-0 mt-0.5' : 'text-red-400 shrink-0 mt-0.5'}>
                      {check.ok ? '✓' : '✗'}
                    </span>
                    <div>
                      <p className="text-gray-700">{check.detail}</p>
                      {!check.ok && check.fix && <p className="text-gray-400 mt-0.5">Fix: {check.fix}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Dernier audit: {new Date(data.timestamp).toLocaleString('fr-FR')} — Base: 47 methodes de recherche (KDD 2024, ICLR 2026)
      </p>
    </div>
  );
}

function calculateGrade(score: number, max: number): string {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  if (pct >= 90) return 'A';
  if (pct >= 75) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 40) return 'D';
  return 'E';
}
