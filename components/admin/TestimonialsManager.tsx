'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, Plus, Edit2, Trash2, Save, X, GripVertical } from 'lucide-react';

type Testimonial = {
  id?: string;
  name: string;
  location: string;
  quote: string;
  destination: string;
  rating: number;
  avatar_url?: string;
  source?: string;
  display_order?: number;
  is_active?: boolean;
};

const SOURCES = ['manual', 'google', 'trustpilot'];

export default function TestimonialsManager() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadTestimonials = useCallback(async () => {
    try {
      const res = await fetch('/api/cms/testimonials');
      const data = await res.json();
      if (res.ok) {
        setTestimonials(data.testimonials || []);
      }
    } catch (e) {
      console.error('Error loading testimonials:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTestimonials(); }, [loadTestimonials]);

  const handleSave = async () => {
    if (!editing) return;
    if (!editing.name?.trim() || !editing.quote?.trim()) {
      setError('Nom et citation sont requis');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const method = editing.id ? 'PUT' : 'POST';
      const url = editing.id ? '/api/cms/testimonials' : '/api/cms/testimonials';
      const body = editing.id ? { ...editing } : editing;
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setEditing(null);
      setIsNew(false);
      loadTestimonials();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce témoignage ?')) return;
    try {
      const res = await fetch(`/api/cms/testimonials?id=${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      loadTestimonials();
    } catch (e) {
      console.error('Error deleting:', e);
    }
  };

  const startNew = () => {
    setEditing({
      name: '',
      location: '',
      quote: '',
      destination: '',
      rating: 5,
      source: 'manual',
      display_order: testimonials.length + 1
    });
    setIsNew(true);
  };

  const startEdit = (t: Testimonial) => {
    setEditing({ ...t });
    setIsNew(false);
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Témoignages Clients</h2>
        <button
          onClick={startNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#C4714A] text-white rounded-lg hover:bg-[#b05f3a] transition"
        >
          <Plus size={16} />
          Nouveau témoignage
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Formulaire création/edit */}
      {(editing || isNew) && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">
              {isNew ? 'Nouveau témoignage' : 'Modifier'}
            </h3>
            <button onClick={() => { setEditing(null); setIsNew(false); }} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom *</label>
              <input
                type="text"
                value={editing?.name || ''}
                onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : null)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D8B7A]"
                placeholder="Sophie & Marc"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Localisation</label>
              <input
                type="text"
                value={editing?.location || ''}
                onChange={e => setEditing(p => p ? { ...p, location: e.target.value } : null)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D8B7A]"
                placeholder="Lyon"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Destination</label>
              <input
                type="text"
                value={editing?.destination || ''}
                onChange={e => setEditing(p => p ? { ...p, destination: e.target.value } : null)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D8B7A]"
                placeholder="Madère"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                value={editing?.source || 'manual'}
                onChange={e => setEditing(p => p ? { ...p, source: e.target.value } : null)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D8B7A]"
              >
                {SOURCES.map(s => (
                  <option key={s} value={s}>{s === 'manual' ? 'Manuel' : s === 'google' ? 'Google' : 'Trustpilot'}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setEditing(p => p ? { ...p, rating: n } : null)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      size={20}
                      className={n <= (editing?.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                    />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordre d'affichage</label>
              <input
                type="number"
                value={editing?.display_order || 0}
                onChange={e => setEditing(p => p ? { ...p, display_order: parseInt(e.target.value) || 0 } : null)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D8B7A]"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Citation *</label>
            <textarea
              value={editing?.quote || ''}
              onChange={e => setEditing(p => p ? { ...p, quote: e.target.value } : null)}
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#2D8B7A]"
              placeholder="Le témoignage..."
            />
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
        {testimonials.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucun témoignage. Cliquez sur "Nouveau témoignage" pour en ajouter.
          </div>
        ) : (
          testimonials.map(t => (
            <div key={t.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4 hover:shadow-sm transition">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{t.name}</span>
                  {t.location && <span className="text-gray-500 text-sm">· {t.location}</span>}
                  {t.destination && <span className="text-eucalyptus text-sm">· {t.destination}</span>}
                </div>
                <div className="flex items-center gap-1 mb-2">
                  {t.source && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{t.source}</span>}
                  <div className="flex">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} size={14} className={n <= t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm italic">"{t.quote}"</p>
              </div>
              <div className="flex flex-col gap-2">
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
          ))
        )}
      </div>
    </div>
  );
}