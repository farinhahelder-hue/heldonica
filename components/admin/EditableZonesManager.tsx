'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/admin/Toast';
import { Search, Save, Edit2, Check, X, RefreshCw, History, Clock, Plus, Image as ImageIcon } from 'lucide-react';
import type { CmsZone, CmsZonesData } from '@/lib/content-loader';
import {
  buildFramingWrites,
  readFraming,
  EMPTY_FRAMING,
  type ImageFraming,
} from '@/lib/image-framing';

/** Types de zone acceptés par `cms_editable_zones` (cf. colonne `zone_type`). */
const ZONE_TYPES = ['text', 'textarea', 'html', 'image', 'icon', 'cta'] as const;

export default function EditableZonesManager() {
  const { toast } = useToast();
  const [zones, setZones] = useState<CmsZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  // Création d'une zone neuve. Sans ce formulaire, le CMS ne pouvait pas
  // accueillir une clé qui n'existait pas déjà dans le code : c'est ce qui
  // obligeait à passer par un développeur pour ajouter un texte ou un lien.
  const [creating, setCreating] = useState(false);
  const [newPage, setNewPage] = useState('global');
  const [newKey, setNewKey] = useState('');
  const [newType, setNewType] = useState<string>('text');
  const [newValue, setNewValue] = useState('');
  const [savingNew, setSavingNew] = useState(false);
  
  const [historyModal, setHistoryModal] = useState<{page: string, key: string} | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Cadrage d'une photo. Une zone `image` ne porte pas son cadrage : il vit dans
  // trois zones compagnes, invisibles dans la liste. Ce panneau est le seul
  // endroit d'où on peut les régler sans écrire de SQL.
  const [framingFor, setFramingFor] = useState<CmsZone | null>(null);
  const [framing, setFraming] = useState<ImageFraming>(EMPTY_FRAMING);
  const [savingFraming, setSavingFraming] = useState(false);

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

  /**
   * Crée une zone neuve (ou écrase la valeur d'une zone existante de même clé).
   * Le type est contraint à `ZONE_TYPES` : une valeur libre ferait échouer la
   * lecture côté `EditableZone`, qui choisit son rendu sur `zone_type`.
   */
  const handleCreate = async () => {
    const page = newPage.trim();
    const zoneKey = newKey.trim();
    if (!page || !zoneKey) {
      toast({ title: 'Champs requis', description: 'Page et clé sont obligatoires', variant: 'danger' });
      return;
    }
    setSavingNew(true);
    try {
      const res = await fetch('/api/cms/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page,
          zone_key: zoneKey,
          value: newValue,
          zone_type: newType,
          is_active: true,
        }),
      });
      if (!res.ok) throw new Error('Erreur API');
      toast({ title: 'Créée', description: `Zone ${page} / ${zoneKey} enregistrée` });
      setCreating(false);
      setNewKey('');
      setNewValue('');
      fetchZones();
    } catch {
      toast({ title: 'Erreur', description: 'Échec de la création', variant: 'danger' });
    } finally {
      setSavingNew(false);
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

  /** Ouvre le panneau de cadrage en préremplissant les zones compagnes existantes. */
  const openFraming = (zone: CmsZone) => {
    const byKey: Record<string, { value?: string }> = {};
    for (const z of zones) byKey[`${z.page}__${z.zone_key}`] = { value: z.value };
    setFraming(readFraming(byKey, zone.page, zone.zone_key));
    setFramingFor(zone);
  };

  const saveFraming = async () => {
    if (!framingFor) return;
    const { writes, errors } = buildFramingWrites(framingFor.page, framingFor.zone_key, framing);
    if (errors.length > 0) {
      toast({ title: 'Réglage refusé', description: errors.join(' '), variant: 'danger' });
      return;
    }
    setSavingFraming(true);
    try {
      for (const w of writes) {
        const res = await fetch('/api/cms/zones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(w),
        });
        if (!res.ok) throw new Error('Erreur API');
      }
      toast({ title: 'Cadrage enregistré', description: `${framingFor.page} / ${framingFor.zone_key}` });
      setFramingFor(null);
      fetchZones();
    } catch {
      toast({ title: 'Erreur', description: 'Échec de l\'enregistrement du cadrage', variant: 'danger' });
    } finally {
      setSavingFraming(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-stone-800">Zones Éditables</h2>
          <p className="text-sm text-stone-500">Gérez les textes configurables du site</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCreating((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 bg-eucalyptus text-white rounded-lg hover:bg-eucalyptus/90 transition-colors text-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Nouvelle zone
          </button>
          <button onClick={fetchZones} className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
            <RefreshCw className={`w-5 h-5 text-stone-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {creating && (
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-stone-800">Créer une zone</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Page</label>
              <input
                type="text"
                value={newPage}
                onChange={(e) => setNewPage(e.target.value)}
                placeholder="global, home, blog…"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus/20 focus:border-eucalyptus outline-none font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Clé</label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="nav_item_6_label"
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus/20 focus:border-eucalyptus outline-none font-mono text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-600 mb-1">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus/20 focus:border-eucalyptus outline-none text-sm"
              >
                {ZONE_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-stone-600 mb-1">Valeur</label>
            <textarea
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder="Texte, URL d'image, nom d'icône…"
              className="w-full p-3 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus/20 focus:border-eucalyptus outline-none min-h-[80px]"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={savingNew}
              className="px-4 py-2 bg-eucalyptus text-white rounded-lg hover:bg-eucalyptus/90 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              {savingNew ? 'Enregistrement…' : 'Créer la zone'}
            </button>
            <button
              onClick={() => setCreating(false)}
              className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors text-sm"
            >
              Annuler
            </button>
          </div>
          <p className="text-xs text-stone-500">
            Une zone n&apos;apparaît sur le site que si un composant la lit. Pour le menu,
            utilisez les clés <code className="font-mono">nav_item_&lt;n&gt;_label</code> et{' '}
            <code className="font-mono">nav_item_&lt;n&gt;_url</code>.
          </p>
        </div>
      )}

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
                      {zone.label && zone.label !== zone.zone_key && (
                        <div className="text-sm font-semibold text-stone-800">{zone.label}</div>
                      )}
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
                      ) : zone.value?.trim() ? (
                        <div className="line-clamp-3 bg-stone-100 p-3 rounded-lg border border-stone-200 whitespace-pre-wrap">
                          {zone.value}
                        </div>
                      ) : (
                        <div>
                          <div className="bg-stone-100 p-3 rounded-lg border border-dashed border-stone-300 text-stone-400 italic">
                            Vide — repli du code
                          </div>
                          {zone.description && (
                            <p className="mt-1 text-xs text-stone-500">{zone.description}</p>
                          )}
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
                          {zone.zone_type === 'image' && (
                            <button
                              onClick={() => openFraming(zone)}
                              className="p-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                              title="Cadrage de la photo (remplissage, proportions, position)"
                            >
                              <ImageIcon className="w-4 h-4" />
                            </button>
                          )}
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

      {framingFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 flex justify-between items-center bg-stone-50">
              <h3 className="font-semibold text-stone-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Cadrage de la photo
              </h3>
              <button onClick={() => setFramingFor(null)} className="p-1 hover:bg-stone-200 rounded">
                <X className="w-5 h-5 text-stone-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-xs text-stone-500">
                Zone <code className="font-mono">{framingFor.page} / {framingFor.zone_key}</code>.
                Un champ laissé vide retire le réglage.
              </p>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Remplissage (object-fit)</label>
                <input
                  type="text"
                  value={framing.fit}
                  onChange={(e) => setFraming({ ...framing, fit: e.target.value })}
                  placeholder="cover"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus/20 focus:border-eucalyptus outline-none font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Proportions (aspect-ratio)</label>
                <input
                  type="text"
                  value={framing.ratio}
                  onChange={(e) => setFraming({ ...framing, ratio: e.target.value })}
                  placeholder="16 / 9"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus/20 focus:border-eucalyptus outline-none font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-600 mb-1">Position (object-position)</label>
                <input
                  type="text"
                  value={framing.position}
                  onChange={(e) => setFraming({ ...framing, position: e.target.value })}
                  placeholder="center"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus/20 focus:border-eucalyptus outline-none font-mono text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={saveFraming}
                  disabled={savingFraming}
                  className="px-4 py-2 bg-eucalyptus text-white rounded-lg hover:bg-eucalyptus/90 transition-colors text-sm font-semibold disabled:opacity-50"
                >
                  {savingFraming ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <button
                  onClick={() => setFramingFor(null)}
                  className="px-4 py-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-50 transition-colors text-sm"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
