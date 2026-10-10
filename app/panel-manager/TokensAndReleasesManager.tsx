'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Key, Layers, Plus, Trash2, Copy, Check, Shield, Clock, AlertTriangle, Send, RefreshCw, Radio } from 'lucide-react';
import { CmsApiToken, CmsTokenScope } from '@/lib/cms-tokens';
import { CmsRelease } from '@/lib/cms-releases';

export function TokensAndReleasesManager() {
  const [activeTab, setActiveTab] = useState<'tokens' | 'releases'>('tokens');
  const [tokens, setTokens] = useState<CmsApiToken[]>([]);
  const [releases, setReleases] = useState<CmsRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Modal Token
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [tokenName, setTokenName] = useState('');
  const [tokenScopes, setTokenScopes] = useState<CmsTokenScope[]>(['read:content', 'write:draft']);
  const [tokenExpires, setTokenExpires] = useState<number>(90);
  const [generatedRawToken, setGeneratedRawToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Modal Release
  const [showReleaseModal, setShowReleaseModal] = useState(false);
  const [releaseTitle, setReleaseTitle] = useState('');
  const [releaseDesc, setReleaseDesc] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tokRes, relRes] = await Promise.all([
        fetch('/api/cms/tokens'),
        fetch('/api/cms/releases'),
      ]);

      if (tokRes.ok) {
        const data = await tokRes.json();
        setTokens(data.tokens || []);
      }
      if (relRes.ok) {
        const data = await relRes.json();
        setReleases(data.releases || []);
      }
    } catch {
      // mode silencieux
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cms/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tokenName,
          scopes: tokenScopes,
          expiresInDays: tokenExpires > 0 ? tokenExpires : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg({ text: data.error || 'Erreur création token', type: 'error' });
        return;
      }

      setGeneratedRawToken(data.rawToken);
      setTokenName('');
      fetchData();
    } catch {
      setMsg({ text: 'Erreur réseau lors de la création du token', type: 'error' });
    }
  };

  const handleRevokeToken = async (id: string) => {
    if (!confirm('Révoquer immédiatement ce jeton ? Tout agent l’utilisant sera bloqué.')) return;
    try {
      const res = await fetch(`/api/cms/tokens?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMsg({ text: 'Jeton révoqué avec succès.', type: 'success' });
        fetchData();
      } else {
        const data = await res.json();
        setMsg({ text: data.error || 'Erreur révocation', type: 'error' });
      }
    } catch {
      setMsg({ text: 'Erreur réseau lors de la révocation.', type: 'error' });
    }
  };

  const handleCreateRelease = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/cms/releases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: releaseTitle,
          description: releaseDesc,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg({ text: data.error || 'Erreur création release', type: 'error' });
        return;
      }

      setShowReleaseModal(false);
      setReleaseTitle('');
      setReleaseDesc('');
      setMsg({ text: 'Release créée avec succès.', type: 'success' });
      fetchData();
    } catch {
      setMsg({ text: 'Erreur réseau lors de la création de la release.', type: 'error' });
    }
  };

  const handlePublishRelease = async (id: string, title: string) => {
    if (!confirm(`Publier immédiatement la release "${title}" ? Tous les contenus associés passeront en production.`)) return;
    try {
      const res = await fetch(`/api/cms/releases/${id}/publish`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMsg({ text: data.message || 'Publication de la release terminée.', type: 'success' });
        fetchData();
      } else {
        setMsg({ text: data.error || 'Erreur publication', type: 'error' });
      }
    } catch {
      setMsg({ text: 'Erreur réseau lors de la publication.', type: 'error' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Navigation Onglets */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('tokens')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'tokens'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Key className="w-4 h-4" />
            Tokens Flotte IA & MCP
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-stone-700 text-stone-200">
              {tokens.filter((t) => !t.is_revoked).length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('releases')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'releases'
                ? 'bg-stone-900 text-white'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            Releases & Publications
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-stone-700 text-stone-200">
              {releases.length}
            </span>
          </button>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="p-2 text-stone-500 hover:text-stone-800 rounded-lg hover:bg-stone-100"
          title="Rafraîchir"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {msg && (
        <div
          className={`p-3 rounded-lg text-sm flex items-center justify-between ${
            msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{msg.text}</span>
          <button onClick={() => setMsg(null)} className="font-bold ml-2">×</button>
        </div>
      )}

      {/* ONGLET TOKENS */}
      {activeTab === 'tokens' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-stone-900 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                Endpoint MCP Actif : <code className="text-xs bg-stone-100 px-2 py-1 rounded text-stone-800">/api/mcp</code>
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Protocole standard Model Context Protocol JSON-RPC 2.0. Compatible Claude Desktop, Cursor, OpenCode et Perplexity.
              </p>
            </div>
            <button
              onClick={() => { setShowTokenModal(true); setGeneratedRawToken(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nouveau Jeton d’Agent
            </button>
          </div>

          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-stone-200 font-medium text-sm text-stone-800">
              Jetons d'accès enregistrés ({tokens.length})
            </div>
            {tokens.length === 0 ? (
              <div className="p-8 text-center text-sm text-stone-500">
                Aucun jeton d’API pour l’instant. Créez-en un pour autoriser vos agents IA.
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {tokens.map((token) => (
                  <div key={token.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-stone-50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-stone-900">{token.name}</span>
                        {token.is_revoked ? (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-red-100 text-red-700">
                            Révoqué
                          </span>
                        ) : (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                            Actif
                          </span>
                        )}
                        <code className="text-xs text-stone-500 font-mono">{token.token_prefix}</code>
                      </div>

                      <div className="flex flex-wrap gap-1 items-center mt-1">
                        {token.scopes.map((sc) => (
                          <span key={sc} className="text-[11px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono">
                            {sc}
                          </span>
                        ))}
                      </div>

                      <div className="text-[11px] text-stone-400 flex items-center gap-3">
                        <span>Créé le {new Date(token.created_at).toLocaleDateString('fr-FR')}</span>
                        {token.last_used_at && (
                          <span>Dernier usage : {new Date(token.last_used_at).toLocaleDateString('fr-FR')}</span>
                        )}
                      </div>
                    </div>

                    {!token.is_revoked && (
                      <button
                        onClick={() => handleRevokeToken(token.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Révoquer
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ONGLET RELEASES */}
      {activeTab === 'releases' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-stone-900">
                Releases & Publication Groupée (Pattern Strapi)
              </h2>
              <p className="text-xs text-stone-600 mt-1">
                Regroupez plusieurs carnets, hébergements et guides pour une mise en production simultanée et sans friction.
              </p>
            </div>
            <button
              onClick={() => setShowReleaseModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Créer une Release
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {releases.map((rel) => (
              <div key={rel.id} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-stone-900">{rel.title}</h3>
                    {rel.description && <p className="text-xs text-stone-500 mt-0.5">{rel.description}</p>}
                  </div>
                  <span
                    className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                      rel.status === 'published'
                        ? 'bg-emerald-100 text-emerald-700'
                        : rel.status === 'scheduled'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-stone-100 text-stone-700'
                    }`}
                  >
                    {rel.status}
                  </span>
                </div>

                <div className="text-xs text-stone-600 flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5" />
                  <span>{rel.items?.length || 0} document(s) rattaché(s)</span>
                </div>

                {rel.status !== 'published' && (
                  <button
                    onClick={() => handlePublishRelease(rel.id, rel.title)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Publier le lot maintenant
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL CRÉATION TOKEN */}
      {showTokenModal && (
        <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Key className="w-5 h-5 text-emerald-600" />
              Nouveau Jeton d’Accès Agent IA
            </h3>

            {generatedRawToken ? (
              <div className="space-y-4">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Ce jeton ne sera plus jamais affiché. Copiez-le dès maintenant et configurez-le dans votre client MCP ou script agent.
                  </span>
                </div>

                <div className="p-3 bg-stone-900 rounded-lg flex items-center justify-between text-white font-mono text-xs break-all">
                  <span>{generatedRawToken}</span>
                  <button
                    onClick={() => copyToClipboard(generatedRawToken)}
                    className="ml-2 p-1.5 bg-stone-800 hover:bg-stone-700 rounded text-stone-200"
                    title="Copier"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-xs text-stone-500 space-y-1">
                  <p className="font-semibold">Exemple d'en-tête HTTP :</p>
                  <code className="block bg-stone-100 p-2 rounded text-[11px] text-stone-700">
                    Authorization: Bearer {generatedRawToken}
                  </code>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => { setShowTokenModal(false); setGeneratedRawToken(null); }}
                    className="px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium"
                  >
                    J’ai bien copié mon jeton
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateToken} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nom de l’agent ou du service *
                  </label>
                  <input
                    type="text"
                    required
                    value={tokenName}
                    onChange={(e) => setTokenName(e.target.value)}
                    placeholder="Ex: OpenCode Bridge, Perplexity Assistant, Make Autopilot"
                    className="w-full text-sm border border-stone-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-2">
                    Permissions & Scopes autorisés
                  </label>
                  <div className="space-y-2 text-xs">
                    {(['read:content', 'write:draft', 'publish:content', 'admin:*'] as CmsTokenScope[]).map((scope) => (
                      <label key={scope} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tokenScopes.includes(scope)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTokenScopes([...tokenScopes, scope]);
                            } else {
                              setTokenScopes(tokenScopes.filter((s) => s !== scope));
                            }
                          }}
                          className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-mono text-stone-800">{scope}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Durée de validité
                  </label>
                  <select
                    value={tokenExpires}
                    onChange={(e) => setTokenExpires(Number(e.target.value))}
                    className="w-full text-sm border border-stone-300 rounded-lg p-2.5 outline-none"
                  >
                    <option value={30}>30 jours</option>
                    <option value={90}>90 jours</option>
                    <option value={365}>1 an</option>
                    <option value={0}>Illimité (non recommandé)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShowTokenModal(false)}
                    className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium"
                  >
                    Générer la clé API
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL CRÉATION RELEASE */}
      {showReleaseModal && (
        <div className="fixed inset-0 bg-stone-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-stone-700" />
              Nouvelle Release
            </h3>

            <form onSubmit={handleCreateRelease} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Titre du lot de publication *
                </label>
                <input
                  type="text"
                  required
                  value={releaseTitle}
                  onChange={(e) => setReleaseTitle(e.target.value)}
                  placeholder="Ex: Campagne Éco-Hôtellerie Automne 2026"
                  className="w-full text-sm border border-stone-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-stone-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Description / Objectif
                </label>
                <textarea
                  value={releaseDesc}
                  onChange={(e) => setReleaseDesc(e.target.value)}
                  rows={3}
                  placeholder="Notes sur les articles ou hébergements inclus dans cette publication..."
                  className="w-full text-sm border border-stone-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-stone-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setShowReleaseModal(false)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg text-sm"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-medium"
                >
                  Créer la release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
