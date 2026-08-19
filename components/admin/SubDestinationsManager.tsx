'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/admin/Toast';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { SubDestinationInfo } from '@/lib/pillar-data';

export default function SubDestinationsManager() {
  const { toast } = useToast();
  const [items, setItems] = useState<SubDestinationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [parentSlug, setParentSlug] = useState('madere');
  
  const [editingItem, setEditingItem] = useState<Partial<SubDestinationInfo> | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/cms/sub-destinations?parent_slug=${parentSlug}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      toast('Impossible de charger les sous-destinations', 'error');
    } finally {
      setLoading(false);
    }
  }, [parentSlug, toast]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleSave = async () => {
    if (!editingItem) return;

    const method = isCreating ? 'POST' : 'PATCH';
    const payload = isCreating ? { ...editingItem, parent_slug: parentSlug } : editingItem;

    try {
      const res = await fetch('/api/cms/sub-destinations', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('API Error');

      toast({ title: 'Succès', description: 'Sous-destination sauvegardée.' });
      setEditingItem(null);
      setIsCreating(false);
      fetchItems();
    } catch (e) {
      toast({ title: 'Erreur', description: 'Échec de la sauvegarde', variant: 'danger' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Voulez-vous vraiment supprimer cette sous-destination ?')) return;

    try {
      const res = await fetch(`/api/cms/sub-destinations?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('API Error');
      
      toast({ title: 'Succès', description: 'Sous-destination supprimée.' });
      fetchItems();
    } catch (e) {
      toast({ title: 'Erreur', description: 'Échec de la suppression', variant: 'danger' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-stone-800">Sous-Destinations</h2>
          <p className="text-sm text-stone-500">Gérez les pépites de la région pour chaque pilier</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={parentSlug} 
            onChange={(e) => setParentSlug(e.target.value)}
            className="p-2 border border-stone-300 rounded-lg outline-none focus:ring-2 focus:ring-eucalyptus/20"
          >
            <option value="madere">Madère</option>
            <option value="roumanie">Roumanie</option>
            <option value="sicile">Sicile</option>
            <option value="sardaigne">Sardaigne</option>
            <option value="portugal">Portugal</option>
            <option value="colombie">Colombie</option>
            <option value="normandie">Normandie</option>
            <option value="montenegro">Monténégro</option>
          </select>
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingItem({ parentSlug, display_order: items.length });
            }}
            className="flex items-center gap-2 bg-eucalyptus text-white px-4 py-2 rounded-lg hover:bg-eucalyptus/90 transition-colors"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Ajouter</span>
          </button>
        </div>
      </div>

      {editingItem && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-200">
          <h3 className="text-lg font-bold mb-4">{isCreating ? 'Nouvelle sous-destination' : 'Modifier'}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Titre</label>
              <input
                type="text"
                value={editingItem.title || ''}
                onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                className="w-full p-2 border border-stone-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Slug</label>
              <input
                type="text"
                value={editingItem.slug || ''}
                onChange={e => setEditingItem({ ...editingItem, slug: e.target.value })}
                className="w-full p-2 border border-stone-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Emoji</label>
              <input
                type="text"
                value={editingItem.emoji || ''}
                onChange={e => setEditingItem({ ...editingItem, emoji: e.target.value })}
                className="w-full p-2 border border-stone-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Ordre</label>
              <input
                type="number"
                value={editingItem.display_order || 0}
                onChange={e => setEditingItem({ ...editingItem, display_order: Number(e.target.value) })}
                className="w-full p-2 border border-stone-300 rounded-md"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-stone-700 mb-1">Teaser (description courte)</label>
              <textarea
                value={editingItem.teaser || ''}
                onChange={e => setEditingItem({ ...editingItem, teaser: e.target.value })}
                className="w-full p-2 border border-stone-300 rounded-md"
                rows={2}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setEditingItem(null)} className="px-4 py-2 border rounded-md">Annuler</button>
            <button onClick={handleSave} className="px-4 py-2 bg-mahogany text-white rounded-md flex items-center gap-2">
              <Save size={16} /> Enregistrer
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-500">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-stone-500">Aucune sous-destination pour cette page.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 text-stone-600 text-sm">
                <th className="p-4 font-medium">Ordre</th>
                <th className="p-4 font-medium">Infos</th>
                <th className="p-4 font-medium">Teaser</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id} className="border-t border-stone-100 hover:bg-stone-50/50">
                  <td className="p-4 text-stone-500">{item.display_order}</td>
                  <td className="p-4">
                    <div className="font-bold flex items-center gap-2">
                      <span className="text-xl">{item.emoji}</span>
                      {item.title}
                    </div>
                    <div className="text-xs text-stone-400 font-mono mt-1">{item.slug}</div>
                  </td>
                  <td className="p-4 text-sm text-stone-600 max-w-xs truncate">{item.teaser}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => { setIsCreating(false); setEditingItem(item); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-md">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(item.id!)} className="p-2 text-red-600 hover:bg-red-50 rounded-md">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
