'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Save, RefreshCw, Palette, Type, Image, FileText, Smartphone, Monitor } from 'lucide-react';
import { DESIGN_PRESETS } from '@/lib/design-presets';
import LivePreview from './LivePreview';

const TABS = [
  { id: 'presets', label: 'Themes' },
  { id: 'colors', label: 'Couleurs' },
  { id: 'fonts', label: 'Polices' },
  { id: 'texts', label: 'Textes' },
  { id: 'logo', label: 'Logo' },
] as const;

type TabId = typeof TABS[number]['id'];

const COLOR_FIELDS = [
  { key: 'primary_color', label: 'Couleur principale', fallback: '#006D77' },
  { key: 'secondary_color', label: 'Couleur secondaire', fallback: '#83C5BE' },
  { key: 'color_accent', label: "Couleur d'accent", fallback: '#E29578' },
  { key: 'color_background', label: 'Fond de page', fallback: '#F8F5F0' },
  { key: 'color_text', label: 'Texte principal', fallback: '#1A1A1A' },
] as const;

const TEXT_FIELDS = [
  { key: 'site_name', label: 'Nom du site', type: 'text', fallback: 'Heldonica' },
  { key: 'site_tagline', label: 'Slogan / Tagline', type: 'text', fallback: 'Slow travel vecu, conçu juste.' },
  { key: 'site_description', label: 'Description courte', type: 'textarea', fallback: '' },
  { key: 'primary_cta_label', label: 'Bouton CTA (Header)', type: 'text', fallback: 'Planifier mon voyage' },
  { key: 'primary_cta_url', label: 'Lien CTA (Header)', type: 'text', fallback: '/travel-planning' },
  { key: 'footer_text', label: 'Texte du footer', type: 'text', fallback: '' },
  { key: 'footer_copyright', label: 'Copyright', type: 'text', fallback: '' },
  { key: 'footer_tagline', label: 'Tagline footer', type: 'text', fallback: '' },
  { key: 'contact_email', label: 'Email de contact', type: 'text', fallback: 'contact@heldonica.fr' },
] as const;

const FONT_OPTIONS = [
  'Playfair Display', 'DM Sans', 'Inter', 'Lora', 'Cormorant',
  'Cormorant Garamond', 'Libre Baskerville', 'Raleway', 'Source Sans 3',
  'Montserrat', 'Nunito', 'Poppins', 'Merriweather', 'EB Garamond',
  'DM Serif Display', 'Josefin Sans',
];

const FONT_SIZES = ['14px', '15px', '16px', '17px', '18px', '20px'];

export default function DesignEditor() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<TabId>('presets');
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const tabIcons: Record<TabId, React.ReactNode> = useMemo(() => ({
    presets: <Palette size={14} />,
    colors: <Palette size={14} />,
    fonts: <Type size={14} />,
    texts: <FileText size={14} />,
    logo: <Image size={14} />,
  }), []);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/cms/settings', { cache: 'no-store' });
      const data = await res.json();
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        const flat: Record<string, string> = {};
        if (Array.isArray(data.settings)) {
          data.settings.forEach((s: Record<string, string>) => { flat[s.key] = s.value ?? ''; });
        }
        for (const [k, v] of Object.entries(data)) {
          if (k !== 'settings') flat[k] = String(v ?? '');
        }
        setValues(flat);
      }
    } catch {
      setError('Impossible de charger les parametres.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const update = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }));
  };

  const applyPreset = (preset: typeof DESIGN_PRESETS[number]) => {
    setValues(prev => ({
      ...prev,
      ...preset.colors,
      font_heading: preset.fonts.font_heading,
      font_body: preset.fonts.font_body,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const res = await fetch('/api/cms/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError('Echec de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const currentPreset = DESIGN_PRESETS.find(p =>
    p.colors.primary_color === values.primary_color &&
    p.colors.secondary_color === values.secondary_color &&
    p.fonts.font_heading === values.font_heading &&
    p.fonts.font_body === values.font_body
  );

  const v = (key: string, fallback = '') => values[key] || fallback;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 p-8">
        <RefreshCw size={14} className="animate-spin" /> Chargement...
      </div>
    );
  }

  const renderPresets = () => (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">Themes predefinis</h3>
      <p className="text-xs text-gray-500 mb-4">
        Applique une combinaison complete de couleurs et polices.
      </p>
      <div className="grid grid-cols-2 gap-3">
        {DESIGN_PRESETS.map(preset => {
          const isActive = currentPreset?.id === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className={`relative text-left p-3 rounded-xl border-2 transition-all ${
                isActive ? 'border-[#2D8B7A] bg-[#2D8B7A]/5' : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              {isActive && (
                <span className="absolute top-1.5 right-1.5 text-[10px] bg-[#2D8B7A] text-white px-1.5 py-0.5 rounded-full font-bold">
                  Actif
                </span>
              )}
              <div className="flex gap-1 mb-2">
                <div className="w-5 h-5 rounded-full" style={{ background: preset.colors.primary_color }} />
                <div className="w-5 h-5 rounded-full" style={{ background: preset.colors.secondary_color }} />
                <div className="w-5 h-5 rounded-full" style={{ background: preset.colors.color_accent }} />
                <div className="w-5 h-5 rounded-full" style={{ background: preset.colors.color_background }} />
              </div>
              <p className="text-sm font-semibold text-gray-900">{preset.name}</p>
              <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{preset.description}</p>
              <p className="text-[10px] text-gray-400 mt-1">{preset.fonts.font_heading} + {preset.fonts.font_body}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderColors = () => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Couleurs personnalisees</h3>
      {COLOR_FIELDS.map(field => (
        <div key={field.key}>
          <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
          <div className="flex items-center gap-2">
            <input type="color" value={v(field.key, field.fallback)} onChange={e => update(field.key, e.target.value)} className="w-9 h-9 rounded border border-gray-300 cursor-pointer p-0.5 shrink-0" />
            <input type="text" value={v(field.key, field.fallback)} onChange={e => update(field.key, e.target.value)} className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-mono" />
          </div>
        </div>
      ))}
    </div>
  );

  const renderFonts = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Polices</h3>
      {[{ key: 'font_heading', label: 'Police des titres', fallback: 'Playfair Display' }, { key: 'font_body', label: 'Police du corps', fallback: 'DM Sans' }].map(field => (
        <div key={field.key}>
          <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
          <select value={v(field.key, field.fallback)} onChange={e => update(field.key, e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
            {FONT_OPTIONS.map(font => <option key={font} value={font}>{font}</option>)}
          </select>
          <p className="mt-1 text-xs text-gray-400" style={{ fontFamily: `"${v(field.key, field.fallback)}", serif` }}>
            Apercu: Lorem ipsum dolor sit amet
          </p>
        </div>
      ))}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Taille de base</label>
        <select value={v('font_size_base', '16px')} onChange={e => update('font_size_base', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
          {FONT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  );

  const renderTexts = () => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-gray-900">Textes du site</h3>
      {TEXT_FIELDS.map(field => (
        <div key={field.key}>
          <label className="block text-xs font-medium text-gray-700 mb-1">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea rows={2} value={v(field.key)} onChange={e => update(field.key, e.target.value)} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm resize-none" />
          ) : (
            <input type="text" value={v(field.key)} onChange={e => update(field.key, e.target.value)} placeholder={field.fallback} className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
          )}
        </div>
      ))}
    </div>
  );

  const renderLogo = () => (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-900">Logo &amp; Favicon</h3>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">URL du logo</label>
        <input type="url" value={v('logo_url')} onChange={e => update('logo_url', e.target.value)} placeholder="https://votresite.com/logo.png" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
        {v('logo_url') && <img src={v('logo_url')} alt="" className="mt-2 h-12 rounded border border-gray-200 object-contain" />}
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">URL du favicon</label>
        <input type="url" value={v('favicon_url')} onChange={e => update('favicon_url', e.target.value)} placeholder="https://votresite.com/favicon.ico" className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm" />
      </div>
      <div className="border-t pt-4">
        <h4 className="text-xs font-semibold text-gray-700 mb-2">Compatibilite des cles</h4>
        <p className="text-[11px] text-gray-500 mb-2">Synchronise aussi avec les anciennes cles (site_logo, site_favicon).</p>
        <label className="flex items-center gap-2 text-xs text-gray-600">
          <input type="checkbox" checked readOnly className="w-3 h-3" />
          Copier logo_url vers site_logo a la sauvegarde
        </label>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'presets': return renderPresets();
      case 'colors': return renderColors();
      case 'fonts': return renderFonts();
      case 'texts': return renderTexts();
      case 'logo': return renderLogo();
    }
  };

  return (
    <div className="flex gap-6">
      <div className="w-96 shrink-0 space-y-4">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tabIcons[tab.id]}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4 max-h-[600px] overflow-y-auto">
          {renderTabContent()}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C4714A] text-white rounded-lg text-sm font-medium hover:bg-[#b05f3a] disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Sauvegarde...' : 'Appliquer les changements'}
        </button>
        {saved && <p className="text-sm text-green-600 font-medium text-center">✓ Changements appliques</p>}

        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setViewMode('desktop')} className={`p-2 rounded-lg ${viewMode === 'desktop' ? 'bg-gray-200 text-gray-900' : 'text-gray-400'}`}><Monitor size={16} /></button>
          <button onClick={() => setViewMode('mobile')} className={`p-2 rounded-lg ${viewMode === 'mobile' ? 'bg-gray-200 text-gray-900' : 'text-gray-400'}`}><Smartphone size={16} /></button>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className={`bg-gray-50 rounded-xl border border-gray-200 p-4 ${viewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
          <LivePreview
            siteName={v('site_name', 'Heldonica')}
            tagline={v('site_tagline', 'Slow travel vecu, conçu juste.')}
            primaryColor={v('primary_color', '#006D77')}
            secondaryColor={v('secondary_color', '#83C5BE')}
            fontHeading={v('font_heading', 'Playfair Display')}
            fontBody={v('font_body', 'DM Sans')}
            logoUrl={v('logo_url')}
            ctaLabel={v('primary_cta_label', 'Planifier mon voyage')}
            footerText={v('footer_text', '')}
            copyright={v('footer_copyright', '')}
          />
          <p className="text-xs text-gray-400 text-center mt-3">
            Apercu en temps reel.
          </p>
        </div>
      </div>
    </div>
  );
}
