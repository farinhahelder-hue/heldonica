'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, Save, X, ChevronDown, ChevronUp } from 'lucide-react';

type ChecklistItem = {
  id: string;
  text: string;
  category: string;
};

type Template = {
  id?: string;
  template_key: string;
  template_name: string;
  description: string;
  items: ChecklistItem[];
};

const DEFAULT_CATEGORIES = ['documents', 'réservations', 'santé', 'équipement', 'divers'];

export default function ChecklistTemplatesManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Template | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [expandedItems, setExpandedItems] = useState(true);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/checklist-templates');
      const data = await res.json();
      if (res.ok) {
        setTemplates(data.templates || []);
      }
    } catch (e) {
      console.error('Error loading templates:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTemplates(); }, [loadTemplates]);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.template_key?.trim() || !editing.template_name?.trim()) {
      setError('Clé et nom sont requis');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const method = editing.id ? 'PUT' : 'POST';
      const res = await fetch('/api/cms/checklist-templates', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setEditing(null);
      setIsNew(false);
      loadTemplates();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce template ?')) return;
    try {
      const res = await fetch(`/api/cms/checklist-templates?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      loadTemplates();
    } catch (e) {
      console.error('Error deleting:', e);
    }
  };

  const startNew = () => {
    setEditing({
      template_key: '',
      template_name: '',
      description: '',
      items: []
    });
    setIsNew(true);
  };

  const startEdit = (t: Template) => {
    setEditing({
      ...t,
      items: Array.isArray(t.items) ? t.items : JSON.parse(t.items || '[]')
    });
    setIsNew(false);
  };

  const addItem = () => {
    if (!editing) return;
    setEditing({
      ...editing,
      items: [
        ...editing.items,
        { id: Date.now().toString(), text: '', category: 'divers' }
      ]
    });
  };

  const updateItem = (index: number, field: keyof ChecklistItem, value: string) => {
    if (!editing) return;
    const newItems = [...editing.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditing({ ...editing, items: newItems });
  };

  const removeItem = (index: number) => {
    if (!editing) return;
    setEditing({
      ...editing,
      items: editing.items.filter((_, i) => i !== index)
    });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Templates de Checklists</h2>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#C4714A] text-white rounded-lg hover:bg-[#b05f3a] transition"
        >
          <Plus size={16} />
          Nouveau template
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Formulaire */}
      {(editing || isNew) && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">
              {isNew ? 'Nouveau template' : 'Modifier'}
            </h3>
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clé unique *</label>
              <input
                type="text"
                value={editing?.template_key || ''}
                onChange={e => setEditing(p => p ? { ...p, template_key: e.target.value.toLowerCase().replace(/\s+/g, '-') } : null)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D8B7A]"
                placeholder="citybreak"
                disabled={!isNew}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                value={editing?.template_name || ''}
                onChange={e => setEditing(p => p ? { ...p, template_name: e.target.value } : null)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D8B7A]"
                placeholder="City Break"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={editing?.description || ''}
                onChange={e => setEditing(p => p ? { ...p, description: e.target.value } : null)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D8B7A]"
                placeholder="Pour les weekend ville"
              />
            </div>
          </div>

          {/* Items */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">Éléments de la checklist</label>
              <button
                type="button"
                onClick={() => setExpandedItems(!expandedItems)}
                className="text-sm text-gray-500 flex items-center gap-1"
              >
                {expandedItems ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {expandedItems ? 'Réduire' : 'Développer'}
              </button>
            </div>
            
            {expandedItems && editing?.items?.map((item, index) => (
              <div key={item.id} className="flex gap-2 items-start">
                <select
                  value={item.category}
                  onChange={e => updateItem(index, 'category', e.target.value)}
                  className="px-2 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#2D8B7A]"
                >
                  {DEFAULT_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="text"
                  value={item.text}
                  onChange={e => updateItem(index, 'text', e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#2D8B7A]"
                  placeholder="Élément..."
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addItem}
              className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition"
            >
              + Ajouter un élément
            </button>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => { setEditing(null); setIsNew(false); }}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-[#2D8B7A] text-white rounded-lg hover:bg-[#246b60] disabled:opacity-50 transition"
            >
              <Save size={16} />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      <div className="space-y-3">
        {templates.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucun template. Cliquez sur "Nouveau template" pour en ajouter.
          </div>
        ) : (
          templates.map(t => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{t.template_name}</span>
                    <code className="text-xs bg-gray-100 px-2 py-0.5 rounded">{t.template_key}</code>
                  </div>
                  {t.description && (
                    <p className="text-gray-500 text-sm mb-2">{t.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(t.items) && t.items.slice(0, 5).map((item, i) => (
                      <span key={item.id || i} className="text-xs bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        {item.text}
                      </span>
                    ))}
                    {Array.isArray(t.items) && t.items.length > 5 && (
                      <span className="text-xs text-gray-400">+{t.items.length - 5} autres</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => startEdit(t)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="Modifier"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(t.id!)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}