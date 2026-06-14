'use client';

import { useState, useEffect, useCallback } from 'react';
import { Save, RefreshCw, AlertTriangle } from 'lucide-react';

export default function CustomCodeEditor() {
  const [customCss, setCustomCss] = useState('');
  const [customHtmlHead, setCustomHtmlHead] = useState('');
  const [customHtmlBody, setCustomHtmlBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cms/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data && typeof data === 'object') {
        const flat: Record<string, string> = {};
        if (Array.isArray(data.settings)) {
          data.settings.forEach((s: Record<string, string>) => { flat[s.key] = s.value ?? ''; });
        }
        for (const [k, v] of Object.entries(data)) {
          if (k !== 'settings') flat[k] = String(v ?? '');
        }
        setCustomCss(flat.custom_css || '');
        setCustomHtmlHead(flat.custom_html_head || '');
        setCustomHtmlBody(flat.custom_html_body || '');
      }
    } catch {
      setError('Impossible de charger le code personnalisé.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch('/api/cms/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ custom_css: customCss, custom_html_head: customHtmlHead, custom_html_body: customHtmlBody }),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Échec de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 p-4">
        <RefreshCw size={14} className="animate-spin" /> Chargement...
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">CSS personnalisé</h3>
            <p className="text-[11px] text-gray-500">Surcharge les styles du site. Les variables CSS du thème sont disponibles.</p>
          </div>
        </div>
        <textarea
          value={customCss}
          onChange={e => setCustomCss(e.target.value)}
          placeholder="/* Ajoute ton CSS ici */
body {
  background: var(--color-background);
}

h1, h2, h3 {
  letter-spacing: -0.02em;
}"
          rows={10}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">HTML &lt;head&gt;</h3>
            <p className="text-[11px] text-gray-500">Injecté avant &lt;/head&gt;. Utile pour metas, scripts analytics, fonts.</p>
          </div>
        </div>
        <textarea
          value={customHtmlHead}
          onChange={e => setCustomHtmlHead(e.target.value)}
          placeholder="<!-- Exemple : meta verification -->
<meta name=\"google-site-verification\" content=\"...\" />

<!-- Exemple : script analytics -->
<script async src=\"https://...\"></script>"
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">HTML &lt;body&gt; (début)</h3>
            <p className="text-[11px] text-gray-500">Injecté après &lt;body&gt;. Idéal pour bannières, annonces, popups.</p>
          </div>
        </div>
        <textarea
          value={customHtmlBody}
          onChange={e => setCustomHtmlBody(e.target.value)}
          placeholder="<!-- Exemple : banniere d'annonce -->
<div style=\"background: var(--color-primary); color: white; text-align: center; padding: 0.75rem;\">
  🌍 Nouveau guide : Decouvrez Madere hors des sentiers battus
</div>"
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm font-mono leading-relaxed resize-y focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
        />
      </div>

      <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
        <p className="text-xs text-amber-700">
          Le HTML personnalisé est injecté sans sanitization. Assure-toi que le code est fiable. 
          Un code invalide peut casser l&apos;affichage du site.
        </p>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 bg-[#C4714A] text-white rounded-lg text-sm font-medium hover:bg-[#b05f3a] disabled:opacity-50 transition-colors"
      >
        <Save size={16} />
        {saving ? 'Sauvegarde...' : 'Sauvegarder le code personnalisé'}
      </button>
      {saved && <p className="text-sm text-green-600 font-medium">✓ Code sauvegardé</p>}
    </div>
  );
}
