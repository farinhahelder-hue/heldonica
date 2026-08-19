'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/admin/Toast';
import { RefreshCw, Save, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react';

type BlockDef = { id: string; label: string; active: boolean };

type LayoutConfig = {
  article: BlockDef[];
  destination: BlockDef[];
};

const DEFAULT_LAYOUTS: LayoutConfig = {
  article: [
    { id: 'hero', label: 'En-tête (Hero Image & Titre)', active: true },
    { id: 'content', label: 'Contenu principal (Texte & Images)', active: true },
    { id: 'map', label: 'Carte interactive', active: true },
    { id: 'voice_notes', label: 'Détail terrain (Voice notes)', active: true },
    { id: 'tags', label: 'Tags', active: true },
    { id: 'related_articles', label: 'Articles similaires', active: true },
  ],
  destination: [
    { id: 'hero', label: 'En-tête (Hero Image & Titre)', active: true },
    { id: 'info_cards', label: 'Cartes Infos Pratiques', active: true },
    { id: 'description', label: 'Description (On y est allés)', active: true },
    { id: 'sub_destinations', label: 'Sous-destinations', active: true },
    { id: 'tips', label: 'Nos Tips Recommandés', active: true },
    { id: 'verdict', label: 'Verdict', active: true },
    { id: 'cta', label: 'Appel à l\'action (Travel Planning)', active: true },
    { id: 'quiz', label: 'Quiz Slow Travel', active: true },
    { id: 'related_articles', label: 'Articles similaires', active: true },
  ]
};

export default function LayoutManager() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [layouts, setLayouts] = useState<LayoutConfig>(DEFAULT_LAYOUTS);
  const [activeTab, setActiveTab] = useState<'article' | 'destination'>('article');

  const fetchLayouts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/settings');
      if (res.ok) {
        const data = await res.json();
        const settings = data.settings || {};
        if (settings.layouts) {
          try {
            const parsed = JSON.parse(settings.layouts);
            setLayouts({ ...DEFAULT_LAYOUTS, ...parsed });
          } catch {
            // keep defaults
          }
        }
      }
    } catch {
      toast('Impossible de charger les layouts', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLayouts();
  }, [fetchLayouts]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/cms/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          updates: { layouts: JSON.stringify(layouts) }
        })
      });
      if (!res.ok) throw new Error('Erreur de sauvegarde');
      toast('Layouts sauvegardés avec succès', 'success');
    } catch {
      toast('Échec de la sauvegarde', 'error');
    } finally {
      setSaving(false);
    }
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    const newLayouts = { ...layouts };
    const currentList = [...newLayouts[activeTab]];
    if (direction === 'up' && index > 0) {
      const temp = currentList[index - 1];
      currentList[index - 1] = currentList[index];
      currentList[index] = temp;
    } else if (direction === 'down' && index < currentList.length - 1) {
      const temp = currentList[index + 1];
      currentList[index + 1] = currentList[index];
      currentList[index] = temp;
    }
    newLayouts[activeTab] = currentList;
    setLayouts(newLayouts);
  };

  const toggleBlock = (index: number) => {
    const newLayouts = { ...layouts };
    const currentList = [...newLayouts[activeTab]];
    currentList[index].active = !currentList[index].active;
    newLayouts[activeTab] = currentList;
    setLayouts(newLayouts);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-stone-800">Modèles de Pages (Layouts)</h2>
          <p className="text-sm text-stone-500">Réorganisez l'ordre des sections pour vos articles et destinations.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchLayouts} className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
            <RefreshCw className={`w-5 h-5 text-stone-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 bg-eucalyptus text-white rounded-lg hover:bg-eucalyptus/90 transition-colors shadow-sm font-medium text-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> Sauvegarder
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-stone-200">
          <button
            onClick={() => setActiveTab('article')}
            className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'article' ? 'bg-stone-50 text-eucalyptus border-b-2 border-eucalyptus' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Modèle Article
          </button>
          <button
            onClick={() => setActiveTab('destination')}
            className={`px-6 py-3 font-medium text-sm focus:outline-none transition-colors ${activeTab === 'destination' ? 'bg-stone-50 text-eucalyptus border-b-2 border-eucalyptus' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Modèle Destination
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center text-stone-500 py-10">Chargement...</div>
          ) : (
            <div className="space-y-3 max-w-2xl">
              {layouts[activeTab].map((block, index) => (
                <div key={block.id} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${block.active ? 'bg-white border-stone-200' : 'bg-stone-50 border-stone-100 opacity-60'}`}>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-1">
                      <button onClick={() => moveBlock(index, 'up')} disabled={index === 0} className="p-1 text-stone-400 hover:text-stone-600 disabled:opacity-30 disabled:hover:text-stone-400"><ArrowUp className="w-4 h-4" /></button>
                      <button onClick={() => moveBlock(index, 'down')} disabled={index === layouts[activeTab].length - 1} className="p-1 text-stone-400 hover:text-stone-600 disabled:opacity-30 disabled:hover:text-stone-400"><ArrowDown className="w-4 h-4" /></button>
                    </div>
                    <div>
                      <p className="font-semibold text-stone-800">{block.label}</p>
                      <p className="text-xs text-stone-500 font-mono">{block.id}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBlock(index)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${block.active ? 'bg-stone-100 text-stone-700 hover:bg-stone-200' : 'bg-stone-200 text-stone-500 hover:bg-stone-300'}`}
                  >
                    {block.active ? <><Eye className="w-4 h-4" /> Visible</> : <><EyeOff className="w-4 h-4" /> Masqué</>}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
