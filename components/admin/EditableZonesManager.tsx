'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/admin/Toast';
import { Search, Save, Edit2, Check, X, RefreshCw } from 'lucide-react';
import type { CmsZone, CmsZonesData } from '@/lib/content-loader';

export default function EditableZonesManager() {
  const { toast } = useToast();
  const [zones, setZones] = useState<CmsZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const fetchZones = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/zones');
      if (res.ok) {
        const data: CmsZonesData = await res.json();
        if (data.zones) {
          // Convert map to array
          const arr = Object.values(data.zones).sort((a, b) => {
            if (a.page !== b.page) return a.page.localeCompare(b.page);
            return a.zone_key.localeCompare(b.zone_key);
          });
          setZones(arr);
        }
      }
    } catch (e) {
      console.error(e);
      toast({ title: 'Erreur', description: 'Impossible de charger les zones', variant: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZones();
  }, []);

  const handleSave = async (zone: CmsZone) => {
    try {
      const res = await fetch('/api/cms/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page: zone.page,
          zone_key: zone.zone_key,
          value: editValue,
          is_active: zone.is_active
        })
      });

      if (!res.ok) throw new Error('Erreur API');
      
      toast({ title: 'Succès', description: 'Zone mise à jour avec succès' });
      setEditingKey(null);
      fetchZones();
    } catch (e) {
      toast({ title: 'Erreur', description: 'Échec de la sauvegarde', variant: 'danger' });
    }
  };

  const filteredZones = zones.filter(z => 
    z.zone_key.toLowerCase().includes(search.toLowerCase()) || 
    z.value.toLowerCase().includes(search.toLowerCase()) ||
    z.page.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-stone-800">Zones Éditables</h2>
          <p className="text-sm text-stone-500">Gérez les textes configurables du site</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchZones} className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
            <RefreshCw className={`w-5 h-5 text-stone-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
        <input
          type="text"
          placeholder="Rechercher une zone (ex: header_title, Madère...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-xl focus:ring-2 focus:ring-eucalyptus/20 focus:border-eucalyptus outline-none"
        />
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-stone-500">Chargement des zones...</div>
        ) : filteredZones.length === 0 ? (
          <div className="p-10 text-center text-stone-500">Aucune zone trouvée.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 font-semibold w-1/4">Page & Clé</th>
                  <th className="px-6 py-4 font-semibold w-2/4">Valeur actuelle</th>
                  <th className="px-6 py-4 font-semibold w-1/4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredZones.map(zone => (
                  <tr key={`${zone.page}__${zone.zone_key}`} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-block px-2 py-1 text-xs font-medium text-eucalyptus bg-eucalyptus/10 rounded-md mb-1">
                        {zone.page}
                      </span>
                      <div className="font-mono text-xs text-stone-500">
                        {zone.zone_key}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {editingKey === `${zone.page}__${zone.zone_key}` ? (
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          className="w-full p-2 border border-eucalyptus/50 rounded-lg focus:ring-2 focus:ring-eucalyptus/20 focus:border-eucalyptus outline-none min-h-[80px]"
                        />
                      ) : (
                        <div className="line-clamp-3 bg-stone-100 p-3 rounded-lg border border-stone-200 whitespace-pre-wrap">
                          {zone.value}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {editingKey === `${zone.page}__${zone.zone_key}` ? (
                        <div className="flex gap-2">
                          <button onClick={() => handleSave(zone)} className="p-2 bg-eucalyptus text-white rounded-lg hover:bg-eucalyptus/90 transition-colors" title="Sauvegarder">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingKey(null)} className="p-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors" title="Annuler">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingKey(`${zone.page}__${zone.zone_key}`);
                            setEditValue(zone.value);
                          }}
                          className="p-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-2"
                        >
                          <Edit2 className="w-4 h-4" /> <span className="text-xs font-semibold">Éditer</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
