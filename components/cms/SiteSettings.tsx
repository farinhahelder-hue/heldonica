'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// CMS settings uses dynamic keys from Supabase - using any is intentional
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SettingsData = any;

export default function SiteSettings({ data, onSave }: { data?: SettingsData; onSave?: (data: SettingsData) => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [settings, setSettings] = useState<SettingsData>(data?.site || {});
  const [newCategory, setNewCategory] = useState('');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (field: string, value: any) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleSave = () => {
    if (onSave) {
      onSave({
        ...data,
        site: settings,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-serif font-bold text-mahogany mb-6">⚙️ Paramètres du Site</h2>

      <div className="max-w-2xl space-y-6">
        {/* Titre */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Titre du Site</label>
          <Input
            value={settings.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Description</label>
          <Textarea
            value={settings.description || ''}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
          />
        </div>

        {/* Couleurs */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Couleur Primaire
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.primaryColor || '#8B4513'}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <Input
                value={settings.primaryColor || ''}
                onChange={(e) => handleChange('primaryColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Couleur Secondaire
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={settings.secondaryColor || '#2D5016'}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <Input
                value={settings.secondaryColor || ''}
                onChange={(e) => handleChange('secondaryColor', e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Presets de couleurs */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Presets de Couleurs
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { name: 'Terre', primary: '#8B4513', secondary: '#2D5016' },
              { name: 'Océan', primary: '#0E4D64', secondary: '#1A6B7C' },
              { name: 'Forêt', primary: '#1B4D3E', secondary: '#3D7A5C' },
              { name: 'Coucher', primary: '#9C4B2A', secondary: '#C97B4B' },
              { name: 'Minéral', primary: '#5C5C5C', secondary: '#8B7355' },
              { name: 'Lavande', primary: '#6B4E71', secondary: '#9B7B95' },
            ].map((preset) => (
              <button
                key={preset.name}
                onClick={() => {
                  handleChange('primaryColor', preset.primary);
                  handleChange('secondaryColor', preset.secondary);
                }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border hover:shadow-md transition-all"
                style={{ borderColor: preset.primary }}
              >
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: preset.primary }}
                />
                <div
                  className="w-4 h-4 rounded-full"
                  style={{ background: preset.secondary }}
                />
                <span className="text-xs">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Catégories personnalisées */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">
            Catégories du Blog
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(settings.customCategories || ['Découvertes locales', 'Carnets de voyage', 'Coulisses', 'Expert hôtelier']).map((cat: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-sm"
              >
                {cat}
                <button
                  onClick={() => {
                    const cats = (settings.customCategories || ['Découvertes locales', 'Carnets de voyage', 'Coulisses', 'Expert hôtelier']).filter((_: string, i: number) => i !== idx);
                    handleChange('customCategories', cats);
                  }}
                  className="ml-1 text-teal-600 hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newCategory || ''}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="Nouvelle catégorie"
              className="flex-1"
            />
            <Button
              onClick={() => {
                if (newCategory?.trim()) {
                  const cats = [...(settings.customCategories || ['Découvertes locales', 'Carnets de voyage', 'Coulisses', 'Expert hôtelier']), newCategory.trim()];
                  handleChange('customCategories', cats);
                  setNewCategory('');
                }
              }}
            >
              +
            </Button>
          </div>
        </div>

        {/* Logo */}
        <div>
          <label className="block text-sm font-medium text-charcoal mb-2">Logo</label>
          <Input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                  handleChange('logo', event.target?.result as string);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
          {settings.logo && (
            <div className="mt-4">
              <img
                src={settings.logo}
                alt="Logo"
                className="h-20 rounded"
              />
            </div>
          )}
        </div>

{/* SEO & Geo Localization */}
        <div className="border-t pt-6">
          <h3 className="font-bold text-mahogany mb-4 flex items-center gap-2">
            🌍 SEO & Géolocalisation
          </h3>
          <div className="space-y-4">
            {/* Default language */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Langue par défaut</label>
              <select
                value={settings.defaultLocale || 'fr-FR'}
                onChange={(e) => handleChange('defaultLocale', e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="fr-FR">🇫🇷 Français (France)</option>
                <option value="fr-CH">🇨🇭 Français (Suisse)</option>
                <option value="fr-BE">🇧🇪 Français (Belgique)</option>
                <option value="fr-CA">🇨🇦 Français (Canada)</option>
                <option value="de-DE">🇩🇪 Allemand</option>
                <option value="en-GB">🇬🇧 Anglais</option>
              </select>
            </div>

            {/* Hreflang URLs */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                URLs hreflang (une par ligne)
              </label>
              <Textarea
                value={settings.hreflangUrls || ''}
                onChange={(e) => handleChange('hreflangUrls', e.target.value)}
                rows={4}
                placeholder="https://www.heldonica.fr/chemin|fr-FR
https://www.heldonica.ch/chemin|fr-CH
https://heldonica.be/chemin|fr-BE
https://heldonica.ca/chemin|fr-CA
https://heldonica.com/path|en-US"
                className="font-mono text-xs"
              />
              <p className="text-xs text-gray-500 mt-1">
                Format: URL|lang-code (ex: fr-FR, fr-CH, en-US)
              </p>
            </div>

            {/* Meta keywords */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Mots-clés SEO
              </label>
              <Input
                value={settings.metaKeywords || ''}
                onChange={(e) => handleChange('metaKeywords', e.target.value)}
                placeholder="hôtel luxe, voyage Portugal, consultant hôtelier..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Séparés par virgules, max 10 mots-clés
              </p>
            </div>

            {/* Robots directives */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Robot directives</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.indexSite ?? true}
                    onChange={(e) => handleChange('indexSite', e.target.checked)}
                  />
                  <span className="text-sm">Indexable</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.followLinks ?? true}
                    onChange={(e) => handleChange('followLinks', e.target.checked)}
                  />
                  <span className="text-sm">Follow links</span>
                </label>
              </div>
            </div>

            {/* Geo targeting */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Régions cibles
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { code: 'FR', name: '🇫🇷 France' },
                  { code: 'CH', name: '🇨🇭 Suisse' },
                  { code: 'BE', name: '🇧🇪 Belgique' },
                  { code: 'CA', name: '🇨🇦 Canada' },
                  { code: 'LU', name: '🇱🇺 Luxembourg' },
                  { code: 'GB', name: '🇬🇧 UK' },
                ].map(({ code, name }) => (
                  <label key={code} className="flex items-center gap-1 px-2 py-1 border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={settings.targetCountries?.includes(code)}
                      onChange={(e) => {
                        const current = settings.targetCountries || ['FR']
                        const updated = e.target.checked
                          ? [...current, code]
                          : current.filter((c: string) => c !== code)
                        handleChange('targetCountries', updated)
                      }}
                    />
                    <span className="text-sm">{name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* OG Image fallback */}
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Image OG par défaut
              </label>
              <Input
                value={settings.ogImage || ''}
                onChange={(e) => handleChange('ogImage', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        {/* Instagram */}
        <div className="border-t pt-6">
          <h3 className="font-bold text-mahogany mb-4 flex items-center gap-2">
            📸 Paramètres Instagram
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Nom d’utilisateur</label>
              <Input
                value={settings.instagramUsername || ''}
                onChange={(e) => handleChange('instagramUsername', e.target.value)}
                placeholder="heldonica"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">Nombre de posts a afficher</label>
              <Input
                type="number"
                min={1}
                max={12}
                value={settings.instagramPostCount || 6}
                onChange={(e) => handleChange('instagramPostCount', parseInt(e.target.value) || 6)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Posts (un par ligne, format: image|url|legende)
              </label>
              <Textarea
                value={settings.instagramPosts || ''}
                onChange={(e) => handleChange('instagramPosts', e.target.value)}
                rows={5}
                placeholder="https://images.unsplash.com/...|https://instagram.com/p/ABC123|Legende"
                className="font-mono text-xs"
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Ajoutez vos posts Instagram (image URL, permalien, légende)
                </p>
                {typeof window !== 'undefined' && (
                  <button
                    type="button"
                    onClick={async () => {
                      const lines = (settings.instagramPosts || '').split('\n').filter(Boolean)
                      const validated = await Promise.all(
                        lines.map(async (line: string) => {
                          const [, url] = line.split('|')
                          if (!url?.includes('instagram.com')) return line + '|⚠️URL invalide'
                          try {
                            const res = await fetch(`https://api.instagram.com/oembed/?url=${url.trim()}`)
                            if (res.ok) return line + '|✅OK'
                            return line + '|⚠️Post introuvable'
                          } catch {
                            return line + '|⚠️Erreur'
                          }
                        })
                      )
                      handleChange('instagramPosts', validated.join('\n'))
                    }}
                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    ✅ Valider URLs
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-bold text-mahogany mb-3">📝 Informations</h3>
          <div className="space-y-3 text-sm">
            <p>
              <strong>Titre du site :</strong> Utilisé dans les onglets du navigateur et les
              résultats de recherche
            </p>
            <p>
              <strong>Description :</strong> Affichée dans les résultats de recherche Google
            </p>
            <p>
              <strong>Couleurs :</strong> Utilisées pour le thème du site
            </p>
            <p>
              <strong>Logo :</strong> Affiché dans la barre de navigation
            </p>
          </div>
        </div>

        {/* Boutons d’action */}
        <div className="flex gap-4 pt-4">
          <Button onClick={handleSave} className="bg-mahogany hover:bg-red-900">
            💾 Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
}
