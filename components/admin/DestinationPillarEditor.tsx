'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/admin/Toast';
import { Save, RefreshCw, Code, LayoutList, Plus, Trash2 } from 'lucide-react';
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

  const fetchPillars = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/pillar-pages');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.pages) {
          setPillars(data.pages);
        }
      }
    } catch {
      toast('Impossible de charger les destinations', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPillars();
  }, [fetchPillars]);

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
                    
                    <div className="space-y-4 pt-4 border-t border-stone-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-stone-800">Introduction (Paragraphes)</h4>
                        <button
                          onClick={() => setFormData({...formData, intro: [...(formData.intro || []), '']})}
                          className="p-1.5 bg-eucalyptus/10 text-eucalyptus rounded hover:bg-eucalyptus/20 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(formData.intro || []).map((p, i) => (
                          <div key={i} className="flex gap-2">
                            <textarea
                              value={p}
                              onChange={e => {
                                const newIntro = [...formData.intro];
                                newIntro[i] = e.target.value;
                                setFormData({...formData, intro: newIntro});
                              }}
                              className="flex-1 p-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-eucalyptus outline-none min-h-[80px]"
                            />
                            <button
                              onClick={() => {
                                const newIntro = formData.intro.filter((_, idx) => idx !== i);
                                setFormData({...formData, intro: newIntro});
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg self-start"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-stone-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-stone-800">Itinéraire</h4>
                        <button
                          onClick={() => setFormData({...formData, itinerary: [...(formData.itinerary || []), { day: (formData.itinerary?.length || 0) + 1, title: '', activities: [] }]})}
                          className="p-1.5 bg-eucalyptus/10 text-eucalyptus rounded hover:bg-eucalyptus/20 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        {(formData.itinerary || []).map((day, i) => (
                          <div key={i} className="p-4 bg-stone-50 border border-stone-200 rounded-xl relative">
                            <button
                              onClick={() => {
                                const newItin = formData.itinerary.filter((_, idx) => idx !== i);
                                setFormData({...formData, itinerary: newItin});
                              }}
                              className="absolute top-4 right-4 p-1.5 text-red-500 hover:bg-red-100 rounded-md"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3 pr-8">
                              <div>
                                <label className="text-xs font-semibold text-stone-600">Jour</label>
                                <input type="number" value={day.day} onChange={e => {
                                  const newItin = [...formData.itinerary];
                                  newItin[i].day = Number(e.target.value);
                                  setFormData({...formData, itinerary: newItin});
                                }} className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none" />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-stone-600">Titre</label>
                                <input type="text" value={day.title} onChange={e => {
                                  const newItin = [...formData.itinerary];
                                  newItin[i].title = e.target.value;
                                  setFormData({...formData, itinerary: newItin});
                                }} className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-semibold text-stone-600">Activités (une par ligne)</label>
                              </div>
                              <textarea
                                value={(day.activities || []).join('\n')}
                                onChange={e => {
                                  const newItin = [...formData.itinerary];
                                  newItin[i].activities = e.target.value.split('\n').filter(Boolean);
                                  setFormData({...formData, itinerary: newItin});
                                }}
                                className="w-full p-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-eucalyptus outline-none min-h-[80px]"
                                placeholder="Activité 1&#10;Activité 2"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-stone-200">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-stone-800">FAQ</h4>
                        <button
                          onClick={() => setFormData({...formData, faq: [...(formData.faq || []), { q: '', a: '' }]})}
                          className="p-1.5 bg-eucalyptus/10 text-eucalyptus rounded hover:bg-eucalyptus/20 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        {(formData.faq || []).map((faq, i) => (
                          <div key={i} className="flex gap-2 items-start p-3 bg-stone-50 border border-stone-200 rounded-lg">
                            <div className="flex-1 space-y-2">
                              <input
                                type="text"
                                placeholder="Question..."
                                value={faq.q}
                                onChange={e => {
                                  const newFaq = [...formData.faq];
                                  newFaq[i].q = e.target.value;
                                  setFormData({...formData, faq: newFaq});
                                }}
                                className="w-full p-2 font-medium border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-eucalyptus outline-none"
                              />
                              <textarea
                                placeholder="Réponse..."
                                value={faq.a}
                                onChange={e => {
                                  const newFaq = [...formData.faq];
                                  newFaq[i].a = e.target.value;
                                  setFormData({...formData, faq: newFaq});
                                }}
                                className="w-full p-2 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-eucalyptus outline-none min-h-[60px]"
                              />
                            </div>
                            <button
                              onClick={() => {
                                const newFaq = formData.faq.filter((_, idx) => idx !== i);
                                setFormData({...formData, faq: newFaq});
                              }}
                              className="p-2 text-red-500 hover:bg-red-100 rounded-lg mt-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
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
