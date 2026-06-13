'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Globe, Palette, Share2, Search, FileText, Wrench, RefreshCw } from 'lucide-react';

type Setting = { key: string; value: string };

type FieldDef = {
  key: string;
  label: string;
  type: 'text' | 'url' | 'email' | 'color' | 'textarea' | 'toggle' | 'select';
  placeholder?: string;
  options?: string[];
};

type GroupDef = {
  id: string;
  label: string;
  icon: React.ReactNode;
  fields: FieldDef[];
};

const GROUPS: GroupDef[] = [
  {
    id: 'general',
    label: 'Général',
    icon: <Globe size={16} />,
    fields: [
      { key: 'site_name',        label: 'Nom du site',          type: 'text',     placeholder: 'Heldonica' },
      { key: 'site_url',         label: 'URL du site',          type: 'url',      placeholder: 'https://www.heldonica.fr' },
      { key: 'site_tagline',     label: 'Slogan',               type: 'text',     placeholder: 'Vivre, découvrir, partager.' },
      { key: 'site_description', label: 'Description courte',   type: 'textarea', placeholder: 'Blog slow travel & conseil hôtelier' },
      { key: 'contact_email',    label: 'Email de contact',     type: 'email',    placeholder: 'bonjour@heldonica.fr' },
      { key: 'contact_phone',    label: 'Téléphone',            type: 'text',     placeholder: '+33 6 00 00 00 00' },
      { key: 'logo_url',         label: 'URL du logo',          type: 'url',      placeholder: 'https://...' },
      { key: 'favicon_url',      label: 'URL du favicon',       type: 'url',      placeholder: 'https://...' },
    ],
  },
  {
    id: 'apparence',
    label: 'Apparence',
    icon: <Palette size={16} />,
    fields: [
      { key: 'primary_color',     label: 'Couleur principale',  type: 'color' },
      { key: 'secondary_color',   label: 'Couleur secondaire',  type: 'color' },
      { key: 'font_heading',      label: 'Police titres',       type: 'text',     placeholder: 'Playfair Display' },
      { key: 'font_body',         label: 'Police corps',        type: 'text',     placeholder: 'Inter' },
      { key: 'hero_banner_url',   label: 'Image hero bannière', type: 'url',      placeholder: 'https://...' },
      { key: 'primary_cta_label', label: 'Label CTA principal', type: 'text',     placeholder: 'Planifier mon voyage' },
      { key: 'primary_cta_url',   label: 'URL CTA principal',   type: 'url',      placeholder: '/travel-planning' },
    ],
  },
  {
    id: 'social',
    label: 'Réseaux sociaux',
    icon: <Share2 size={16} />,
    fields: [
      { key: 'social_instagram', label: 'Instagram',           type: 'url', placeholder: 'https://instagram.com/heldonica' },
      { key: 'social_facebook',  label: 'Facebook',            type: 'url', placeholder: 'https://facebook.com/heldonica' },
      { key: 'social_linkedin',  label: 'LinkedIn',            type: 'url', placeholder: 'https://linkedin.com/company/heldonica' },
      { key: 'social_pinterest', label: 'Pinterest',           type: 'url', placeholder: 'https://pinterest.com/heldonica' },
      { key: 'social_tiktok',    label: 'TikTok',              type: 'url', placeholder: 'https://tiktok.com/@heldonica' },
      { key: 'instagram_url',    label: 'Instagram (legacy)',  type: 'url', placeholder: 'https://instagram.com/heldonica' },
      { key: 'site_instagram',   label: 'Instagram (site)',    type: 'url', placeholder: 'https://instagram.com/heldonica' },
      { key: 'site_facebook',    label: 'Facebook (site)',     type: 'url', placeholder: '' },
      { key: 'site_linkedin',    label: 'LinkedIn (site)',     type: 'url', placeholder: '' },
      { key: 'site_pinterest',   label: 'Pinterest (site)',    type: 'url', placeholder: '' },
      { key: 'site_tiktok',      label: 'TikTok (site)',       type: 'url', placeholder: '' },
    ],
  },
  {
    id: 'seo',
    label: 'SEO',
    icon: <Search size={16} />,
    fields: [
      { key: 'meta_title',               label: 'Meta title',              type: 'text',     placeholder: 'Heldonica — Slow Travel & Conseil Hôtelier' },
      { key: 'meta_description',         label: 'Meta description',        type: 'textarea', placeholder: '160 caractères max' },
      { key: 'meta_og_image',            label: 'OG Image URL',            type: 'url',      placeholder: 'https://...' },
      { key: 'seo_title',                label: 'SEO Title par défaut',    type: 'text',     placeholder: 'Heldonica' },
      { key: 'seo_description',          label: 'SEO Description',         type: 'textarea', placeholder: '' },
      { key: 'seo_default_title',        label: 'Titre SEO global',        type: 'text',     placeholder: '' },
      { key: 'seo_default_description',  label: 'Description SEO globale', type: 'textarea', placeholder: '' },
      { key: 'seo_og_image',             label: 'OG Image SEO',            type: 'url',      placeholder: '' },
      { key: 'seo_robots',               label: 'Robots',                  type: 'text',     placeholder: 'index, follow' },
      { key: 'seo_sitemap_url',          label: 'Sitemap URL',             type: 'url',      placeholder: '/sitemap.xml' },
      { key: 'seo_google_verification',  label: 'Google Search Console',   type: 'text',     placeholder: 'google-site-verification=...' },
      { key: 'google_analytics_id',      label: 'Google Analytics ID',     type: 'text',     placeholder: 'G-XXXXXXXXXX' },
    ],
  },
  {
    id: 'footer',
    label: 'Footer',
    icon: <FileText size={16} />,
    fields: [
      { key: 'footer_text',      label: 'Texte footer',        type: 'text',     placeholder: '© 2026 Heldonica' },
      { key: 'footer_copyright', label: 'Copyright',           type: 'text',     placeholder: '© 2026 Heldonica' },
      { key: 'footer_tagline',   label: 'Tagline footer',      type: 'text',     placeholder: 'Vivre, découvrir, partager.' },
      { key: 'footer_legal',     label: 'Mention légale',      type: 'text',     placeholder: 'Heldonica – Blog Slow Travel' },
      { key: 'footer_cta_label', label: 'Label CTA footer',    type: 'text',     placeholder: 'Écrire à Heldonica' },
      { key: 'footer_cta_url',   label: 'URL CTA footer',      type: 'url',      placeholder: 'mailto:contact@heldonica.fr' },
      { key: 'footer_links',     label: 'Liens footer (JSON)', type: 'textarea', placeholder: '[{"label":"Blog","url":"/blog"}]' },
    ],
  },
  {
    id: 'maintenance',
    label: 'Maintenance',
    icon: <Wrench size={16} />,
    fields: [
      { key: 'maintenance_mode',     label: 'Mode maintenance actif', type: 'toggle' },
      { key: 'maintenance_message',  label: 'Message affiché',        type: 'textarea', placeholder: 'On revient très vite avec de nouvelles pépites ! 🌿' },
      { key: 'maintenance_end_date', label: 'Date de fin (optionnel)', type: 'text',     placeholder: '2026-07-01' },
    ],
  },
];

export default function CmsSettingsPanel() {
  const [activeGroup, setActiveGroup] = useState('general');
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valuesRef = useRef(values);

  const doSave = useCallback(async (data: Record<string, string>) => {
    setSaving(true);
    setError('');
    try {
      const res = await fetch('/api/cms/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Échec de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  }, []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cms/settings', { cache: 'no-store' });
      const data = await res.json();
      console.log('[CmsSettings] API response:', data);
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const flat: Record<string, string> = {};
        if (Array.isArray(data.settings)) {
          data.settings.forEach((s: Setting) => { flat[s.key] = s.value ?? ''; });
        }
        Object.entries(data).forEach(([k, v]) => {
          if (k !== 'settings') flat[k] = String(v ?? '');
        });
        console.log('[CmsSettings] Parsed values:', flat);
        setValues(flat);
        valuesRef.current = flat;
      }
    } catch (e) {
      console.error('[CmsSettings] Fetch error:', e);
      setError('Impossible de charger les paramètres.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleChange = (key: string, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    valuesRef.current = next;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => doSave(next), 2000);
  };

  const handleSave = async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    await doSave(values);
  };

  const currentGroup = GROUPS.find(g => g.id === activeGroup)!;

  return (
    <div className="flex gap-6 h-full">
      {/* Sidebar navigation */}
      <nav className="w-48 shrink-0">
        <ul className="space-y-1">
          {GROUPS.map(group => (
            <li key={group.id}>
              <button
                onClick={() => setActiveGroup(group.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeGroup === group.id
                    ? 'bg-[#2D8B7A] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {group.icon}
                {group.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main panel */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              {currentGroup.icon}
              {currentGroup.label}
            </h2>
            <button
              onClick={loadSettings}
              disabled={loading}
              title="Recharger"
              className="p-1.5 text-gray-400 hover:text-gray-600 disabled:opacity-40 transition-colors"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading && (
            <div className="text-xs text-gray-400 mb-4 flex items-center gap-2">
              <RefreshCw size={12} className="animate-spin" /> Chargement…
            </div>
          )}

          {/* Champs TOUJOURS visibles, même pendant le chargement */}
          <div className="space-y-4">
            {currentGroup.fields.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {field.label}
                  <span className="ml-1 text-xs text-gray-400 font-mono">({field.key})</span>
                </label>

                {field.type === 'toggle' ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={values[field.key] === 'true'}
                      onChange={e => handleChange(field.key, e.target.checked ? 'true' : 'false')}
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#2D8B7A] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-5" />
                    <span className="ml-3 text-sm text-gray-600">
                      {values[field.key] === 'true' ? 'Activé' : 'Désactivé'}
                    </span>
                  </label>
                ) : field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={values[field.key] ?? ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A] resize-y"
                  />
                ) : field.type === 'color' ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={values[field.key] || '#000000'}
                      onChange={e => handleChange(field.key, e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={values[field.key] ?? ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder="#2D8B7A"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                    />
                  </div>
                ) : (
                  <input
                    type={field.type}
                    value={values[field.key] ?? ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]"
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-600">{error}</p>
          )}

          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#C4714A] text-white rounded-lg text-sm font-medium hover:bg-[#b05f3a] disabled:opacity-50 transition-colors"
            >
              <Save size={16} />
              {saving ? 'Sauvegarde…' : 'Sauvegarder'}
            </button>
            {saved && (
              <span className="text-sm text-green-600 font-medium">✓ Paramètres sauvegardés</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
