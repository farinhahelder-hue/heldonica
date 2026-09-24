'use client';

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/components/admin/Toast';
import { RefreshCw, Plus, Edit2, Trash2, Check, X, Save } from 'lucide-react';

type Redirect = {
  id: number;
  from_path: string;
  to_path: string;
  redirect_type: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
};

export default function RedirectsManager() {
  const { toast } = useToast();
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingId, setEditingId] = useState<number | 'new' | null>(null);
  const [formData, setFormData] = useState<Partial<Redirect>>({
    from_path: '',
    to_path: '',
    redirect_type: 301,
    active: true
  });

  const fetchRedirects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/cms/redirects');
      if (res.ok) {
        const data = await res.json();
        setRedirects(data.redirects || []);
      }
    } catch {
      toast('Impossible de charger les redirections', 'error');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchRedirects();
  }, [fetchRedirects]);

  const handleSave = async () => {
    if (!formData.from_path || !formData.to_path) {
      toast({ title: 'Erreur', description: 'Les chemins source et destination sont requis', variant: 'danger' });
      return;
    }

    try {
      const method = editingId === 'new' ? 'POST' : 'PATCH';
      const body = editingId === 'new' ? formData : { ...formData, id: editingId };
      
      const res = await fetch('/api/cms/redirects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (!res.ok) throw new Error('API Error');
      
      toast({ title: 'Succès', description: 'Redirection sauvegardée' });
      setEditingId(null);
      fetchRedirects();
    } catch {
      toast({ title: 'Erreur', description: 'Échec de la sauvegarde', variant: 'danger' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cette redirection ?')) return;
    try {
      const res = await fetch('/api/cms/redirects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      
      if (!res.ok) throw new Error('API Error');
      
      toast({ title: 'Succès', description: 'Redirection supprimée' });
      fetchRedirects();
    } catch {
      toast({ title: 'Erreur', description: 'Échec de la suppression', variant: 'danger' });
    }
  };

  const startEdit = (r: Redirect) => {
    setFormData({
      from_path: r.from_path,
      to_path: r.to_path,
      redirect_type: r.redirect_type,
      active: r.active
    });
    setEditingId(r.id);
  };

  const startNew = () => {
    setFormData({
      from_path: '',
      to_path: '',
      redirect_type: 301,
      active: true
    });
    setEditingId('new');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif text-stone-800">Redirections</h2>
          <p className="text-sm text-stone-500">Gérez les redirections 301/302 du site</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchRedirects} className="p-2 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors">
            <RefreshCw className={`w-5 h-5 text-stone-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={startNew} className="flex items-center gap-2 px-4 py-2 bg-eucalyptus text-white rounded-lg hover:bg-eucalyptus/90 transition-colors shadow-sm font-medium text-sm">
            <Plus className="w-4 h-4" /> Nouvelle redirection
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        {loading && redirects.length === 0 ? (
          <div className="p-10 text-center text-stone-500">Chargement...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-stone-600">
              <thead className="bg-stone-50 text-stone-500 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 font-semibold w-1/4">Chemin Source</th>
                  <th className="px-6 py-4 font-semibold w-1/4">Chemin Destination</th>
                  <th className="px-6 py-4 font-semibold w-1/6">Type</th>
                  <th className="px-6 py-4 font-semibold w-1/6">Statut</th>
                  <th className="px-6 py-4 font-semibold text-right w-1/6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {editingId === 'new' && (
                  <tr className="bg-eucalyptus/5">
                    <td className="px-6 py-4">
                      <input type="text" value={formData.from_path} onChange={e => setFormData({...formData, from_path: e.target.value})} placeholder="/ancien-lien" className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none font-mono text-xs" />
                    </td>
                    <td className="px-6 py-4">
                      <input type="text" value={formData.to_path} onChange={e => setFormData({...formData, to_path: e.target.value})} placeholder="/nouveau-lien" className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none font-mono text-xs" />
                    </td>
                    <td className="px-6 py-4">
                      <select value={formData.redirect_type} onChange={e => setFormData({...formData, redirect_type: Number(e.target.value)})} className="p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none w-full">
                        <option value={301}>301 (Permanent)</option>
                        <option value={302}>302 (Temporaire)</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-4 h-4 rounded text-eucalyptus focus:ring-eucalyptus" />
                        <span className="text-xs font-semibold">{formData.active ? 'Actif' : 'Inactif'}</span>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={handleSave} className="p-2 bg-eucalyptus text-white rounded-lg hover:bg-eucalyptus/90" title="Sauvegarder"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingId(null)} className="p-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300" title="Annuler"><X className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )}
                
                {redirects.map(r => editingId === r.id ? (
                  <tr key={r.id} className="bg-eucalyptus/5">
                    <td className="px-6 py-4">
                      <input type="text" value={formData.from_path} onChange={e => setFormData({...formData, from_path: e.target.value})} className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none font-mono text-xs" />
                    </td>
                    <td className="px-6 py-4">
                      <input type="text" value={formData.to_path} onChange={e => setFormData({...formData, to_path: e.target.value})} className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none font-mono text-xs" />
                    </td>
                    <td className="px-6 py-4">
                      <select value={formData.redirect_type} onChange={e => setFormData({...formData, redirect_type: Number(e.target.value)})} className="p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-eucalyptus outline-none w-full">
                        <option value={301}>301 (Permanent)</option>
                        <option value={302}>302 (Temporaire)</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={formData.active} onChange={e => setFormData({...formData, active: e.target.checked})} className="w-4 h-4 rounded text-eucalyptus focus:ring-eucalyptus" />
                        <span className="text-xs font-semibold">{formData.active ? 'Actif' : 'Inactif'}</span>
                      </label>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={handleSave} className="p-2 bg-eucalyptus text-white rounded-lg hover:bg-eucalyptus/90" title="Sauvegarder"><Check className="w-4 h-4" /></button>
                        <button onClick={() => setEditingId(null)} className="p-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300" title="Annuler"><X className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr key={r.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-stone-500">{r.from_path}</td>
                    <td className="px-6 py-4 font-mono text-xs text-stone-800 font-semibold">{r.to_path}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-xs font-medium">
                        {r.redirect_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {r.active ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Actif</span>
                      ) : (
                        <span className="px-2 py-1 bg-stone-100 text-stone-500 rounded text-xs font-medium">Inactif</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => startEdit(r)} className="p-2 border border-stone-200 text-stone-600 rounded-lg hover:bg-stone-100" title="Éditer">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(r.id)} className="p-2 text-red-500 rounded-lg hover:bg-red-50" title="Supprimer">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {redirects.length === 0 && editingId !== 'new' && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-stone-500">
                      Aucune redirection configurée.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
