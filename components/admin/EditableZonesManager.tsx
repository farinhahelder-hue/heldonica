'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/admin/Toast';
import { Search, Save, Edit2, Check, X, RefreshCw, History, Clock } from 'lucide-react';
import type { CmsZone, CmsZonesData } from '@/lib/content-loader';

export default function EditableZonesManager() {
  const { toast } = useToast();
  const [zones, setZones] = useState<CmsZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  
  const [historyModal, setHistoryModal] = useState<{page: string, key: string} | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchZones = useCallback(async () => {
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
      toast('Impossible de charger les zones', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

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

  const loadHistory = async (page: string, key: string) => {
    setHistoryModal({ page, key });
    setHistoryData([]);
    setHistoryLoading(true);
    try {
      const res = await fetch(`/api/cms/zone-history?page=${page}&zone_key=${key}`);
      if (res.ok) {
        const data = await res.json();
        setHistoryData(data.history || []);
      }
    } catch {
      toast('Impossible de charger l\'historique', 'error');
    } finally {
      setHistoryLoading(false);
    }
  };

  const restoreHistory = async (page: string, key: string, value: string) => {
    if (!confirm('Restaurer cette version ?')) return;
    try {
      const res = await fetch('/api/cms/zone-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, zone_key: key, value })
      });
      if (res.ok) {
        toast({ title: 'Restauré', description: 'Zone restaurée avec succès' });
        setHistoryModal(null);
        fetchZones();
      }
    } catch {
      toast({ title: 'Erreur', description: 'Échec de la restauration', variant: 'danger' });
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
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingKey(`${zone.page}__${zone.zone_key}`);
                              setEditValue(zone.value);
                            }}
                            className="p-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors flex items-center gap-2"
                          >
                            <Edit2 className="w-4 h-4" /> <span className="text-xs font-semibold">Éditer</span>
                          </button>
                          <button
                            onClick={() => loadHistory(zone.page, zone.zone_key)}
                            className="p-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                            title="Historique"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {historyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Historique : {historyModal.page} / {historyModal.key}
              </h3>
              <button onClick={() => setHistoryModal(null)} className="p-1 hover:bg-stone-200 rounded">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              {historyLoading ? (
                <div className="text-center text-stone-500">Chargement de l'historique...</div>
              ) : historyData.length === 0 ? (
                <div className="text-center text-stone-500">Aucun historique pour cette zone.</div>
              ) : (
                <div className="space-y-4">
                  {historyData.map(record => (
                    <div key={record.id} className="border border-stone-200 rounded-xl overflow-hidden">
                      <div className="bg-stone-50 px-4 py-2 border-b border-stone-200 flex justify-between items-center text-xs text-stone-600">
                        <span>Modifié le {new Date(record.changed_at).toLocaleString('fr-FR')}</span>
                        <button 
                          onClick={() => restoreHistory(historyModal.page, historyModal.key, record.new_value)}
                          className="px-3 py-1 bg-eucalyptus text-white font-medium rounded hover:bg-eucalyptus/90 transition-colors"
                        >
                          Restaurer cette version
                        </button>
                      </div>
                      <div className="p-4 grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-[10px] font-bold text-red-400 uppercase mb-1">Ancienne Valeur</div>
                          <div className="bg-red-50 p-3 rounded text-sm text-stone-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {record.old_value || <em className="text-stone-400">N/A (création)</em>}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] font-bold text-green-500 uppercase mb-1">Nouvelle Valeur</div>
                          <div className="bg-green-50 p-3 rounded text-sm text-stone-700 whitespace-pre-wrap max-h-48 overflow-y-auto">
                            {record.new_value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
