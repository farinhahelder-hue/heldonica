'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function SiteSettings({ data, onSave }: any) {
  const [settings, setSettings] = useState(data?.site || {});

  const handleChange = (field: string, value: string) => {
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleSave = () => {
    onSave({
      ...data,
      site: settings,
    });
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

        {/* Boutons d'action */}
        <div className="flex gap-4 pt-4">
          <Button onClick={handleSave} className="bg-mahogany hover:bg-red-900">
            💾 Sauvegarder
          </Button>
        </div>
      </div>
    </div>
  );
}
