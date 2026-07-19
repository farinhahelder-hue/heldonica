'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/admin/Toast';
import { Save, RefreshCw, Code, LayoutList } from 'lucide-react';
import type { PillarData } from '@/lib/pillar-types';

type PillarRecord = {
  destination_slug: string;
  content: PillarData;
  updated_at: string;
};

export default function DestinationPillarEditor() {
  const { toast } = useToast();
  const [pillars, setPillars] = useState<PillarRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  
  const [editMode, setEditMode] = useState<'form' | 'json'>('form');
  const [formData, setFormData] = useState<PillarData | null>(null);
  const [jsonText, setJsonText] = useState('');

  const fetchPillars = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/pillar-pages');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.pages) {
          setPillars(data.pages);
        }
      }
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de charger les destinations', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPillars();
  }, []);

  const handleSelect = (slug: string) => {
    const record = pillars.find(p => p.destination_slug === slug);
    if (record) {
      setSelectedSlug(slug);
      setFormData(record.content);
      setJsonText(JSON.stringify(record.content, null, 2));
    }
  };

  const handleSave = async () => {
    if (!selectedSlug || (!formData && editMode === 'form') || (!jsonText && editMode === 'json')) return;

    let contentToSave = formData;
    if (editMode === 'json') {
      try {
        contentToSave = JSON.parse(jsonText);
      } catch (e) {
        toast({ title: 'JSON Invalide', description: 'Vérifiez la syntaxe JSON avant de sauvegarder.', variant: 'danger' });
        return;
      }
    }

    try {
      const res = await fetch('/api/cms/pillar-pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination_slug: selectedSlug, content: contentToSave })
      });

      if (!res.ok) throw new Error('API Error');

      toast({ title: 'Succès', description: 'Destination mise à jour avec succès.' });
      fetchPillars();
    } catch (e) {
      toast({ title: 'Erreur', description: 'Échec de la sauvegarde', variant: 'danger' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-stone-800">Piliers de Destinations</h2>
          <p className="text-sm text-stone-500">Gérez le contenu riche des pages de destination</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchPillars} className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
            <RefreshCw className={`w-5 h-5 text-stone-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wider mb-4">Destinations</h3>
          {loading ? (
            <div className="text-sm text-stone-500">Chargement...</div>
          ) : pillars.map(p => (
            <button
              key={p.destination_slug}
              onClick={() => handleSelect(p.destination_slug)}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selectedSlug === p.destination_slug ? 'bg-eucalyptus text-white border-eucalyptus shadow-md' : 'bg-white border-stone-200 text-stone-700 hover:border-eucalyptus/50'}`}
            >
              <div className="font-semibold">{p.content.name || p.destination_slug}</div>
              <div className="text-xs opacity-80">{p.destination_slug}</div>
            </button>
          ))}
          {pillars.length === 0 && !loading && (
            <div className="text-sm text-stone-500">Aucune destination trouvée.</div>
          )}
        </div>

        <div className="md:col-span-3">
          {selectedSlug && formData ? (
            <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden flex flex-col h-[70vh]">
              <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex justify-between items-center">
                <h3 className="font-semibold text-stone-800">Édition : {formData.name}</h3>
                <div className="flex gap-2">
                  <div className="flex bg-stone-200 rounded-lg p-1 mr-4">
                    <button onClick={() => { setEditMode('form'); setFormData(JSON.parse(jsonText)); }} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${editMode === 'form' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>
                      <LayoutList className="w-3 h-3" /> Form
                    </button>
                    <button onClick={() => { setEditMode('json'); setJsonText(JSON.stringify(formData, null, 2)); }} className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1 ${editMode === 'json' ? 'bg-white shadow-sm text-stone-800' : 'text-stone-500 hover:text-stone-700'}`}>
                      <Code className="w-3 h-3" /> JSON
                    </button>
                  </div>
                  <button onClick={handleSave} className="px-4 py-2 bg-eucalyptus text-white rounded-lg hover:bg-eucalyptus/90 transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm">
                    <Save className="w-4 h-4" /> Sauvegarder
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {editMode === 'json' ? (
                  <textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className="w-full h-full min-h-[500px] p-4 font-mono text-sm bg-stone-900 text-stone-200 rounded-xl focus:ring-2 focus:ring-eucalyptus outline-none"
                    spellCheck="false"
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-600">Nom (ex: Madère)</label>
                        <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-600">Tagline</label>
                        <input type="text" value={formData.tagline || ''} onChange={e => setFormData({...formData, tagline: e.target.value})} className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-600">Budget (ex: 1200)</label>
                        <input type="number" value={formData.budget || 0} onChange={e => setFormData({...formData, budget: Number(e.target.value)})} className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-stone-600">Saison idéale</label>
                        <input type="text" value={formData.season || ''} onChange={e => setFormData({...formData, season: e.target.value})} className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none" />
                      </div>
                    </div>
                    
                    <div className="p-4 bg-yellow-50 text-yellow-800 text-sm rounded-lg border border-yellow-200">
                      <strong>Note:</strong> L'éditeur Formulaire ne gère pour l'instant que les champs simples. Pour modifier les itinéraires (Itinerary), les textes d'intro ou les budgets détaillés, veuillez passer en mode <strong>JSON</strong>.
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-stone-200 rounded-xl bg-stone-50">
              <p className="text-stone-500">Sélectionnez une destination à éditer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
