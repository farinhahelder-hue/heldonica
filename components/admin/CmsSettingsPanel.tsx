'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Save, Globe, Palette, Share2, Search, FileText, Wrench, RefreshCw } from 'lucide-react';
import ImagePicker from './ImagePicker';
import { PAGE_DEFAULTS } from '@/lib/cms-page-defaults';

type Setting = { key: string; value: string };

type FieldDef = {
  key: string;
  label: string;
  type: 'text' | 'url' | 'email' | 'color' | 'textarea' | 'toggle' | 'select' | 'image';
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
      { key: 'logo_url',         label: 'Logo du site',          type: 'image',    placeholder: 'https://...' },
      { key: 'favicon_url',      label: 'Favicon',               type: 'image',    placeholder: 'https://...' },
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
      { key: 'hero_banner_url',     label: 'Image hero bannière',      type: 'image',    placeholder: 'https://...' },
      { key: 'hero_video_url',      label: 'URL vidéo hero',           type: 'url',      placeholder: 'https://...mp4' },
      { key: 'hero_video_title',    label: 'Titre hero vidéo',         type: 'text',     placeholder: 'Découvrez le slow travel' },
      { key: 'hero_video_subtitle', label: 'Sous-titre hero vidéo',    type: 'text',     placeholder: 'Des voyages authentiques, conçus pour vous' },
      { key: 'hero_video_cta_label',label: 'Label CTA hero vidéo',     type: 'text',     placeholder: 'Planifier mon voyage' },
      { key: 'hero_video_cta_url',  label: 'URL CTA hero vidéo',       type: 'url',      placeholder: '/travel-planning' },
      { key: 'primary_cta_label',   label: 'Label CTA principal',      type: 'text',     placeholder: 'Planifier mon voyage' },
      { key: 'primary_cta_url',     label: 'URL CTA principal',        type: 'url',      placeholder: '/travel-planning' },
      { key: 'hero_fallback_images', label: 'Images hero par catégorie (JSON)', type: 'textarea', placeholder: '{"Carnets Voyage":"https://...","Guides Pratiques":"https://..."}' },
      { key: 'hero_page_images', label: 'Images hero par page (JSON)', type: 'textarea', placeholder: '{"home":"https://...","a-propos":"https://..."}' },
      { key: 'verdict_labels', label: 'Étiquettes verdict (JSON)', type: 'textarea', placeholder: '{"badge":"Notre verdict","scoreLabel":"Notre note slow travel"}' },
      { key: 'comparison_labels', label: 'Étiquettes comparateur (JSON)', type: 'textarea', placeholder: '{"emptyState":"Sélectionne des destinations","sortLabel":"Critère"}' },
      { key: 'quickanswers_templates', label: 'Templates réponses rapides (JSON)', type: 'textarea', placeholder: '{"heading":"Réponses rapides pour voyager à {name}","questions":[...]}' },
      { key: 'hero_fallback_default', label: 'Image fallback défaut (URL)', type: 'url', placeholder: 'https://images.unsplash.com/photo-...' },
      { key: 'leaflet_icon_urls', label: 'Icônes Leaflet (JSON)', type: 'textarea', placeholder: '{"iconUrl":"https://...marker-icon.png","iconRetinaUrl":"https://...marker-icon-2x.png"}' },
    ],
  },
  {
    id: 'destinations',
    label: 'Destinations',
    icon: <Globe size={16} />,
    fields: [
      // Le hero de /destinations (badge, titre, sous-titre) est désormais servi
      // par les zones CMS de la page, éditables en inline. Les champs
      // destinations_hub_* qui vivaient ici ne sont plus lus par personne :
      // les laisser afficherait un éditeur sans effet.
      { key: 'destinations_tabs_json',    label: 'Onglets (JSON)',   type: 'textarea', placeholder: '[{"value":"all","label":"Toutes","icon":"🌍"},{"value":"starred","label":"Coups de cœur","icon":"⭐"}]' },
    ],
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: <FileText size={16} />,
    fields: [
      { key: 'blog_category_labels',     label: 'Libellés catégories (JSON)',      type: 'textarea', placeholder: '{"Carnets Voyage":"Carnets","Découvertes Locales":"Pépites locales"}' },
      { key: 'blog_category_fallbacks',   label: 'Images fond par catégorie (JSON)', type: 'textarea', placeholder: '{"Carnets Voyage":"https://...","Guides Pratiques":"https://..."}' },
      { key: 'blog_category_gradients',  label: 'Gradients par catégorie (JSON)',  type: 'textarea', placeholder: '{"Carnets Voyage":"from-eucalyptus to-teal"}' },
      { key: 'blog_category_descriptions', label: 'Descriptions par catégorie (JSON)', type: 'textarea', placeholder: '{"Carnets Voyage":"Les récits qui..."}' },
      { key: 'home_slug_images',          label: 'Images slug accueil (JSON)',     type: 'textarea', placeholder: '{"madere-slow-travel-guide":"https://..."}' },
      { key: 'home_cat_images',           label: 'Images catégorie accueil (JSON)', type: 'textarea', placeholder: '{"Carnets Voyage":"https://...","Guides Pratiques":"https://..."}' },
      { key: 'home_cat_gradients',        label: 'Gradients catégorie accueil (JSON)', type: 'textarea', placeholder: '{"Carnets Voyage":"from-eucalyptus to-teal"}' },
      { key: 'home_cat_icons',            label: 'Icônes catégorie accueil (JSON)',  type: 'textarea', placeholder: '{"Carnets Voyage":"<path.../>"}' },
    ],
  },
  {
    id: 'social',
    label: 'Réseaux sociaux',
    icon: <Share2 size={16} />,
    fields: [
      { key: 'social_instagram',       label: 'Instagram',         type: 'url',      placeholder: 'https://instagram.com/heldonica' },
      { key: 'social_facebook',        label: 'Facebook',          type: 'url',      placeholder: 'https://facebook.com/heldonica' },
      { key: 'social_linkedin',        label: 'LinkedIn',          type: 'url',      placeholder: 'https://linkedin.com/company/heldonica' },
      { key: 'social_pinterest',       label: 'Pinterest',         type: 'url',      placeholder: 'https://pinterest.com/heldonica' },
      { key: 'social_tiktok',          label: 'TikTok',            type: 'url',      placeholder: 'https://tiktok.com/@heldonica' },
      { key: 'social_youtube',         label: 'YouTube',           type: 'url',      placeholder: 'https://youtube.com/@heldonica' },
      { key: 'instagram_stories_json', label: 'Stories Instagram (JSON)', type: 'textarea', placeholder: '[{"id":"story-1","title":"...","location":"...","permalink":"...","image":"..."}]' },
    ],
  },
  {
    id: 'seo',
    label: 'SEO',
    icon: <Search size={16} />,
    fields: [
      { key: 'meta_title',               label: 'Meta title',              type: 'text',     placeholder: 'Heldonica — Slow Travel & Conseil Hôtelier' },
      { key: 'meta_description',         label: 'Meta description',        type: 'textarea', placeholder: '160 caractères max' },
      { key: 'seo_title',                label: 'SEO Title par défaut',    type: 'text',     placeholder: 'Heldonica' },
      { key: 'seo_description',          label: 'SEO Description',         type: 'textarea', placeholder: '' },
      { key: 'seo_og_image',             label: 'OG Image SEO',            type: 'image',    placeholder: '' },
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
      { key: 'footer_links',             label: 'Liens footer (JSON)',      type: 'textarea', placeholder: '[{"label":"Blog","url":"/blog"}]' },
    ],
  },
  {
    id: 'navigation',
    label: 'Navigation',
    icon: <FileText size={16} />,
    fields: [
      { key: 'breadcrumb_home',                label: 'Accueil (fil d\'Ariane)',     type: 'text', placeholder: 'Accueil' },
    ],
  },
  {
    id: 'newsletter',
    label: 'Newsletter',
    icon: <FileText size={16} />,
    fields: [
      { key: 'newsletter_heading_default', label: 'Titre newsletter (article)', type: 'text',     placeholder: 'On t\'envoie ce qu\'on a vraiment trouvé.' },
      { key: 'newsletter_heading_blog',    label: 'Titre newsletter (blog)',    type: 'text',     placeholder: 'Ce qu\'on a vraiment trouvé, directement dans ta boîte mail' },
      { key: 'newsletter_badge',           label: 'Badge newsletter',           type: 'text',     placeholder: 'Chaque semaine' },
      { key: 'newsletter_desc',            label: 'Description newsletter',     type: 'textarea', placeholder: 'Une adresse, un timing, une erreur à éviter.' },
      { key: 'newsletter_cta',             label: 'Texte bouton',               type: 'text',     placeholder: 'Je m\'abonne' },
      { key: 'newsletter_placeholder',     label: 'Placeholder email',          type: 'text',     placeholder: 'ton@email.fr' },
      { key: 'newsletter_success_subtext', label: 'Texte succès',               type: 'text',     placeholder: 'Vérifie ta boîte mail, on arrive doucement.' },
      { key: 'newsletter_disclaimer',      label: 'Disclaimer',                 type: 'textarea', placeholder: 'En t\'inscrivant, tu acceptes de recevoir nos carnets de voyage.' },
      { key: 'newsletter_rgpd_label',      label: 'Texte RGPD',                 type: 'textarea', placeholder: 'J\'accepte de recevoir les e-mails de slow travel d\'Heldonica.' },
      { key: 'newsletter_rgpd_link',       label: 'Texte lien RGPD',            type: 'text',     placeholder: 'politique de confidentialité' },
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
      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error('Erreur lors du chargement' + (text ? `: ${text.slice(0, 100)}` : ''));
      }
      const data = await res.json();

      if (data && typeof data === 'object' && !Array.isArray(data)) {
        // Start with PAGE_DEFAULTS, then overlay DB values (DB wins)
        const flat: Record<string, string> = { ...PAGE_DEFAULTS };
        if (Array.isArray(data.settings)) {
          data.settings.forEach((s: Setting) => {
            if (s.key && s.value !== undefined) {
              flat[s.key] = s.value;
            }
          });
        }
        Object.entries(data).forEach(([k, v]) => {
          if (k !== 'settings' && v !== undefined) flat[k] = String(v);
        });
        setValues(flat);
        valuesRef.current = flat;
      }
    } catch (e: any) {
      console.error('[CmsSettings] Fetch error:', e);
      setError(e.message || 'Impossible de charger les paramètres.');
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
    <div className="flex gap-6 h-full font-sans">
      {/* Sidebar navigation */}
      <nav className="w-52 shrink-0">
        <ul className="space-y-1">
          {GROUPS.map(group => (
            <li key={group.id}>
              <button
                onClick={() => setActiveGroup(group.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeGroup === group.id
                    ? 'bg-[#2D8B7A] text-white shadow-sm shadow-[#2D8B7A]/20'
                    : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
                }`}
              >
                <span className={activeGroup === group.id ? 'text-white' : 'text-stone-400'}>
                  {group.icon}
                </span>
                {group.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main panel */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-stone-100">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2.5">
              <span className="text-[#2D8B7A]">{currentGroup.icon}</span>
              {currentGroup.label}
            </h2>
            <button
              onClick={loadSettings}
              disabled={loading}
              title="Recharger"
              className="p-1.5 text-stone-400 hover:text-stone-600 hover:bg-stone-50 rounded-lg disabled:opacity-40 transition-all"
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {loading && (
            <div className="text-xs text-stone-400 mb-4 flex items-center gap-2">
              <RefreshCw size={12} className="animate-spin" /> Chargement…
            </div>
          )}

          {/* Champs TOUJOURS visibles, même pendant le chargement */}
          <div className="space-y-5">
            {currentGroup.fields.map(field => (
              <div key={field.key} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-stone-700">
                    {field.label}
                  </label>
                  <span className="text-[10px] text-stone-400 font-mono select-all">
                    {field.key}
                  </span>
                </div>

                {field.type === 'toggle' ? (
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={values[field.key] === 'true'}
                      onChange={e => handleChange(field.key, e.target.checked ? 'true' : 'false')}
                    />
                    <div className="w-10 h-5 bg-stone-200 rounded-full peer peer-checked:bg-[#2D8B7A] transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                    <span className="ml-3 text-xs font-semibold text-stone-600">
                      {values[field.key] === 'true' ? 'Activé' : 'Désactivé'}
                    </span>
                  </label>
                ) : field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={values[field.key] ?? ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]/20 focus:border-[#2D8B7A] transition-all resize-y leading-relaxed"
                  />
                ) : field.type === 'image' ? (
                  <ImagePicker
                    value={values[field.key] ?? ''}
                    onChange={value => handleChange(field.key, value)}
                    placeholder={field.placeholder}
                  />
                ) : field.type === 'color' ? (
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={values[field.key] || '#000000'}
                      onChange={e => handleChange(field.key, e.target.value)}
                      className="w-9 h-9 rounded-lg border border-stone-200 cursor-pointer p-0.5"
                    />
                    <input
                      type="text"
                      value={values[field.key] ?? ''}
                      onChange={e => handleChange(field.key, e.target.value)}
                      placeholder="#2D8B7A"
                      className="flex-1 px-3 py-2 border border-stone-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]/20 focus:border-[#2D8B7A] transition-all"
                    />
                  </div>
                ) : (
                  <input
                    type={field.type}
                    value={values[field.key] ?? ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 border border-stone-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#2D8B7A]/20 focus:border-[#2D8B7A] transition-all"
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <p className="mt-4 text-xs font-semibold text-red-600">{error}</p>
          )}

          <div className="mt-6 pt-4 border-t border-stone-100 flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#C4714A] text-white rounded-xl text-xs font-semibold hover:bg-[#b05f3a] disabled:opacity-50 transition-colors shadow-sm"
            >
              <Save size={14} />
              {saving ? 'Sauvegarde…' : 'Sauvegarder les paramètres'}
            </button>
            {saved && (
              <span className="text-xs text-green-600 font-bold">✓ Paramètres sauvegardés</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
