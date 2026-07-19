'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/admin/Toast';
import { Plus, Edit2, Trash2, Save, X, RefreshCw } from 'lucide-react';

type GuideItem = {
  id: string;
  guide_slug: string;
  rank: number;
  title: string;
  type: string;
  description: string;
  secret: string;
  image_url: string;
  is_active: boolean;
};

export default function GuidesManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<GuideItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [guideSlug, setGuideSlug] = useState('top-10-pepites-madere');
  
  const [editingItem, setEditingItem] = useState<Partial<GuideItem> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cms/guide-items?guide_slug=${guideSlug}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (e) {
      toast({ title: 'Erreur', description: 'Impossible de charger les guides', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [guideSlug]);

  const handleSave = async () => {
    if (!editingItem) return;

    const method = isCreating ? 'POST' : 'PATCH';
    const payload = isCreating ? { ...editingItem, guide_slug: guideSlug } : editingItem;

    try {
      const res = await fetch('/api/cms/guide-items', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('API Error');

      toast({ title: 'Succès', description: 'Élément sauvegardé avec succès.' });
      setEditingItem(null);
      setIsCreating(false);
      fetchItems();
    } catch (e) {
      toast({ title: 'Erreur', description: 'Échec de la sauvegarde', variant: 'danger' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cet élément ?')) return;

    try {
      const res = await fetch(`/api/cms/guide-items?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('API Error');
      
      toast({ title: 'Succès', description: 'Élément supprimé avec succès.' });
      fetchItems();
    } catch (e) {
      toast({ title: 'Erreur', description: 'Échec de la suppression', variant: 'danger' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-stone-800">Gestion des Guides</h2>
          <p className="text-sm text-stone-500">Gérez vos listes Top 10 et pépites de terrain</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={guideSlug} 
            onChange={(e) => setGuideSlug(e.target.value)}
            className="p-2 border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-eucalyptus/20"
          >
            <option value="top-10-pepites-madere">Top 10 Madère</option>
            {/* Add more guide slugs here if needed */}
          </select>
          <button onClick={() => { setIsCreating(true); setEditingItem({ rank: items.length + 1 }); }} className="p-2 bg-eucalyptus text-white rounded-lg hover:bg-eucalyptus/90 transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm">
            <Plus className="w-4 h-4" /> Ajouter
          </button>
          <button onClick={fetchItems} className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
            <RefreshCw className={`w-5 h-5 text-stone-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {(editingItem !== null) && (
        <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-semibold text-stone-800">{isCreating ? 'Nouvel élément' : 'Éditer l\'élément'}</h3>
            <button onClick={() => { setEditingItem(null); setIsCreating(false); }} className="p-1 hover:bg-stone-200 rounded-full">
              <X className="w-5 h-5 text-stone-500" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-600">Rang (Ordre d'affichage)</label>
              <input type="number" value={editingItem.rank || ''} onChange={e => setEditingItem({...editingItem, rank: Number(e.target.value)})} className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-stone-600">Titre</label>
              <input type="text" value={editingItem.title || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value})} className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-stone-600">Type (ex: spot_secret, rando...)</label>
              <input type="text" value={editingItem.type || ''} onChange={e => setEditingItem({...editingItem, type: e.target.value})} className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none" />
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-stone-600">Image URL</label>
              <input type="text" value={editingItem.image_url || ''} onChange={e => setEditingItem({...editingItem, image_url: e.target.value})} className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none" />
            </div>
            <div className="space-y-1 md:col-span-3">
              <label className="text-xs font-semibold text-stone-600">Description</label>
              <textarea value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})} className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none min-h-[100px]" />
            </div>
            <div className="space-y-1 md:col-span-3">
              <label className="text-xs font-semibold text-stone-600">Le Secret (Info exclusive Heldonica)</label>
              <textarea value={editingItem.secret || ''} onChange={e => setEditingItem({...editingItem, secret: e.target.value})} className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none min-h-[80px]" />
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button onClick={handleSave} className="px-6 py-2 bg-eucalyptus text-white rounded-lg hover:bg-eucalyptus/90 transition-colors flex items-center gap-2 text-sm font-semibold shadow-sm">
              <Save className="w-4 h-4" /> Sauvegarder
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && !items.length ? (
          <div className="col-span-full p-10 text-center text-stone-500">Chargement des pépites...</div>
        ) : items.map(item => (
          <div key={item.id} className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm flex flex-col group hover:border-eucalyptus/30 transition-colors">
            {item.image_url ? (
              <div className="h-40 bg-stone-100 relative">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded-md">
                  #{item.rank}
                </div>
              </div>
            ) : (
              <div className="h-40 bg-stone-100 flex items-center justify-center text-stone-400">
                Aucune image
              </div>
            )}
            <div className="p-4 flex-1 flex flex-col">
              <div className="text-xs font-semibold text-eucalyptus uppercase tracking-wider mb-1">{item.type}</div>
              <h3 className="font-serif font-bold text-lg text-stone-800 mb-2 leading-tight">{item.title}</h3>
              <p className="text-sm text-stone-600 line-clamp-3 mb-4 flex-1">{item.description}</p>
              
              <div className="flex gap-2 justify-end pt-4 border-t border-stone-100 mt-auto">
                <button onClick={() => { setIsCreating(false); setEditingItem(item); }} className="p-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors" title="Éditer">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors" title="Supprimer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {items.length === 0 && !loading && (
          <div className="col-span-full p-10 text-center text-stone-500 border-2 border-dashed border-stone-200 rounded-xl">
            Aucun élément trouvé pour ce guide. Cliquez sur "Ajouter" pour créer une pépite.
          </div>
        )}
      </div>
    </div>
  );
}
