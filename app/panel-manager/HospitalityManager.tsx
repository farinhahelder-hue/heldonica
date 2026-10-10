'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bed, Plus, ShieldCheck, CheckCircle2, Clock, ExternalLink, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Accommodation, HospitalityStatus } from '@/lib/cms-hospitality';

export function HospitalityManager() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Formulaire d'ajout
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'chambre_hotes' as Accommodation['type'],
    capacity: 2,
    surface_m2: 30,
    price_per_night: 95,
    destination_slug: '',
    direct_booking_url: '',
    description: '',
    amenities: 'Literie lin naturel, Petit-déjeuner fermier bio, Vue forêt',
  });

  const fetchAccommodations = useCallback(async () => {
    setLoading(true);
    try {
      const url = filterStatus === 'all'
        ? '/api/cms/hospitality/accommodations'
        : `/api/cms/hospitality/accommodations?status=${filterStatus}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setAccommodations(data.accommodations || []);
      }
    } catch {
      // mode résilient
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchAccommodations();
  }, [fetchAccommodations]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionMsg(null);
    try {
      const payload: Accommodation = {
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        type: formData.type,
        capacity: Number(formData.capacity),
        surface_m2: Number(formData.surface_m2),
        price_per_night: Number(formData.price_per_night),
        destination_slug: formData.destination_slug || undefined,
        direct_booking_url: formData.direct_booking_url || undefined,
        description: formData.description,
        amenities: formData.amenities.split(',').map((s) => s.trim()).filter(Boolean),
        photos: [],
        status: 'draft',
      };

      const res = await fetch('/api/cms/hospitality/accommodations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur création');

      setActionMsg({ text: 'Hébergement créé en brouillon !', type: 'success' });
      setShowCreateModal(false);
      fetchAccommodations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur création';
      setActionMsg({ text: msg, type: 'error' });
    }
  };

  const handleWorkflowTransition = async (id: string, action: 'submit_review' | 'publish') => {
    try {
      const res = await fetch('/api/cms/hospitality/accommodations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Transition refusée');

      setActionMsg({
        text: action === 'publish' ? 'Hébergement validé et publié en ligne !' : 'Hébergement soumis à relecture.',
        type: 'success',
      });
      fetchAccommodations();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Action impossible';
      setActionMsg({ text: msg, type: 'error' });
    }
  };

  const getStatusBadge = (status: HospitalityStatus) => {
    switch (status) {
      case 'published':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"><CheckCircle2 size={12} /> Publié (En ligne)</span>;
      case 'waiting_review':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800"><Clock size={12} /> En relecture</span>;
      case 'approved':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800"><ShieldCheck size={12} /> Approuvé</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">Brouillon</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-teal/10 text-teal rounded-lg"><Bed size={20} /></span>
            <h1 className="text-2xl font-bold text-stone-900">Hébergements & Offres B2B</h1>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            Modèles de contenu structurés pour gîtes, maisons d’hôtes et séjours slow travel direct sans commission.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAccommodations()}
            className="p-2 border border-stone-200 rounded-xl hover:bg-stone-50 text-stone-600 transition"
            title="Rafraîchir"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-[#2D8B7A] hover:bg-[#256b5e] text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm"
          >
            <Plus size={16} /> Nouvel hébergement
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-2 ${
          actionMsg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {actionMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {actionMsg.text}
        </div>
      )}

      {/* KPI / Proposition de valeur B2B */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="text-xs text-stone-500 font-medium">Hébergements référencés</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">{accommodations.length}</div>
          <div className="text-[11px] text-teal mt-1">🌿 Décrits sans données fictives</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="text-xs text-stone-500 font-medium">Économie commission estimée</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">18% à 25%</div>
          <div className="text-[11px] text-stone-500 mt-1">Préservés via lien direct propriétaire</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm">
          <div className="text-xs text-stone-500 font-medium">Workflow de publication</div>
          <div className="text-2xl font-bold text-stone-900 mt-1">À 2 niveaux</div>
          <div className="text-[11px] text-stone-500 mt-1">Relecture éditeur ➔ Validation admin</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-stone-500">Filtrer par statut :</span>
        {['all', 'draft', 'waiting_review', 'published'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
              filterStatus === st ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {st === 'all' ? 'Tous' : st === 'draft' ? 'Brouillons' : st === 'waiting_review' ? 'En relecture' : 'Publiés'}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="text-center py-12 text-sm text-stone-400">Chargement des hébergements…</div>
      ) : accommodations.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-dashed border-stone-300 text-center space-y-3">
          <Bed className="mx-auto text-stone-400" size={32} />
          <h3 className="text-base font-semibold text-stone-800">Aucun hébergement trouvé</h3>
          <p className="text-sm text-stone-500 max-w-md mx-auto">
            Créez votre première fiche d’hébergement partenaire pour alimenter la vitrine B2B (/expert-hotelier) et les carnets de voyage.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal hover:underline"
          >
            <Plus size={15} /> Ajouter un hébergement maintenant
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {accommodations.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4 hover:border-stone-300 transition">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{item.name}</h3>
                  <div className="text-xs text-stone-500 flex items-center gap-2 mt-0.5">
                    <span>{item.type.replace('_', ' ')}</span>
                    <span>•</span>
                    <span>{item.capacity} pers.</span>
                    {item.surface_m2 && <span>• {item.surface_m2} m²</span>}
                  </div>
                </div>
                <div>{getStatusBadge(item.status)}</div>
              </div>

              <p className="text-xs text-stone-600 line-clamp-2">{item.description}</p>

              {item.amenities && item.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {item.amenities.slice(0, 3).map((am, i) => (
                    <span key={i} className="px-2 py-0.5 bg-stone-50 border border-stone-100 rounded text-[11px] text-stone-600">
                      {am}
                    </span>
                  ))}
                  {item.amenities.length > 3 && (
                    <span className="text-[10px] text-stone-400 self-center">+{item.amenities.length - 3}</span>
                  )}
                </div>
              )}

              <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-stone-900 text-sm">{item.price_per_night || 0} €</span>
                  <span className="text-stone-500"> / nuit direct</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.status === 'draft' && item.id && (
                    <button
                      onClick={() => handleWorkflowTransition(item.id!, 'submit_review')}
                      className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
                    >
                      Soumettre à relecture
                    </button>
                  )}
                  {item.status === 'waiting_review' && item.id && (
                    <button
                      onClick={() => handleWorkflowTransition(item.id!, 'publish')}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition"
                    >
                      ✓ Approuver & Publier
                    </button>
                  )}
                  {item.direct_booking_url && (
                    <a
                      href={item.direct_booking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-400 hover:text-stone-700 p-1"
                      title="Ouvrir le lien de réservation direct"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Création */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-lg font-bold text-stone-900">Ajouter un hébergement</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Nom de l’établissement</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ex: Le Moulin de Conques"
                  className="w-full px-3 py-2 border rounded-xl focus:ring-1 focus:ring-teal outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-1 focus:ring-teal outline-none"
                  >
                    <option value="chambre_hotes">Chambre d’hôtes</option>
                    <option value="gite_charme">Gîte de charme</option>
                    <option value="hotel_independant">Hôtel indépendant</option>
                    <option value="cabane_insolite">Cabane insolite</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Capacité (personnes)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-1 focus:ring-teal outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Prix direct / nuit (€)</label>
                  <input
                    type="number"
                    value={formData.price_per_night}
                    onChange={(e) => setFormData({ ...formData, price_per_night: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-1 focus:ring-teal outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1">Superficie (m²)</label>
                  <input
                    type="number"
                    value={formData.surface_m2}
                    onChange={(e) => setFormData({ ...formData, surface_m2: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-1 focus:ring-teal outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Lien de réservation directe (HTTPS)</label>
                <input
                  type="url"
                  value={formData.direct_booking_url}
                  onChange={(e) => setFormData({ ...formData, direct_booking_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border rounded-xl focus:ring-1 focus:ring-teal outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Description / Atmosphère vécue</label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez le lieu de manière authentique..."
                  className="w-full px-3 py-2 border rounded-xl focus:ring-1 focus:ring-teal outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-stone-700 mb-1">Équipements (séparés par des virgules)</label>
                <input
                  value={formData.amenities}
                  onChange={(e) => setFormData({ ...formData, amenities: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-1 focus:ring-teal outline-none"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-xl text-stone-600 hover:bg-stone-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2D8B7A] text-white rounded-xl font-semibold hover:bg-[#256b5e]"
                >
                  Enregistrer en brouillon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HospitalityManager;
