'use client';

import { useState, useMemo, useEffect, useCallback, useDeferredValue } from 'react';

type DemandeTravel = {
  id: string | number;
  prenom: string;
  nom: string;
  email?: string;
  telephone?: string;
  destination: string;
  budget_fourchette: string;
  nb_voyageurs?: number;
  dates_souhaitees?: string;
  message?: string;
  statut: string;
  notes_internes?: string;
  created_at: string;
  updated_at?: string;
  ca_estime?: number;
};

type TravelCRMPanelProps = {
  initialDemandes?: DemandeTravel[];
};

const STATUTS = {
  nouvelle_demande: { label: 'Nouvelle demande', badgeColor: '#3B82F6', textColor: '#fff' },
  en_cours: { label: 'En cours', badgeColor: '#F59E0B', textColor: '#fff' },
  devis_envoye: { label: 'Devis envoyé', badgeColor: '#F97316', textColor: '#fff' },
  confirme: { label: 'Confirmé', badgeColor: '#10B981', textColor: '#fff' },
  archive: { label: 'Archivé', badgeColor: '#6B7280', textColor: '#fff' },
};

type StatutKey = keyof typeof STATUTS;
const STATUT_LIST: StatutKey[] = ['nouvelle_demande', 'en_cours', 'devis_envoye', 'confirme', 'archive'];

function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
}

function parseBudget(budget: string): number {
  if (!budget) return 0;
  const match = budget.match(/(\d+)\s*(?:€|EUR)?/);
  return match ? parseInt(match[1], 10) * 1000 : 0;
}

function formatBudget(budget: string): string {
  if (!budget) return 'Non renseigné';
  return budget.replace(/€.*/g, ' €').trim();
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

// KPI Card Component
function KPICard({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) {
  return (
    <div style={{
      background: 'white', borderRadius: '1rem', padding: '1.25rem',
      boxShadow: '0 1px 4px rgba(0,0,0,.06)', flex: 1, minWidth: 140,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '.5rem' }}>
        <span style={{ fontSize: '1.4rem' }}>{icon}</span>
        <span style={{ fontSize: '.75rem', color: '#888', textTransform: 'uppercase', letterSpacing: '.05em', fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ fontSize: '1.75rem', fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

// Stats Bar Component
function StatsBar({ demandes }: { demandes: DemandeTravel[] }) {
  const stats = useMemo(() => {
    const total = demandes.length;
    const nouvelles = demandes.filter(d => d.statut === 'nouvelle_demande').length;
    const confirmees = demandes.filter(d => d.statut === 'confirme').length;
    const conversion = total > 0 ? Math.round((confirmees / total) * 100) : 0;
    const caTotal = demandes.reduce((sum, d) => sum + (d.ca_estime || parseBudget(d.budget_fourchette)), 0);
    const nouvelles48h = demandes.filter(d =>
      d.statut === 'nouvelle_demande' && getDaysSince(d.created_at) > 2
    ).length;

    return { total, nouvelles, confirmees, conversion, caTotal, nouvelles48h };
  }, [demandes]);

  return (
    <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
      <KPICard label="Total" value={stats.total} icon="📋" color="#6b2a1a" />
      <KPICard label="Nouvelles" value={stats.nouvelles} icon="🆕" color="#3B82F6" />
      <KPICard label="Conversion" value={`${stats.conversion}%`} icon="✅" color="#10B981" />
      <KPICard label="CA Potentiel" value={`${(stats.caTotal / 1000).toFixed(0)}k€`} icon="💰" color="#d4a574" />
    </div>
  );
}

// Badge Component
function StatusBadge({ statut }: { statut: string }) {
  const cfg = STATUTS[statut as keyof typeof STATUTS] || { label: statut, badgeColor: '#888', textColor: '#fff' };
  return (
    <span style={{
      display: 'inline-block', padding: '.2rem .6rem', borderRadius: '9999px',
      background: cfg.badgeColor, color: cfg.textColor,
      fontSize: '.72rem', fontWeight: 600,
    }}>
      {cfg.label}
    </span>
  );
}

// Table Row Component
function DemandeRow({
  demande,
  isSelected,
  onSelect,
  onClick,
}: {
  demande: DemandeTravel;
  isSelected: boolean;
  onSelect: () => void;
  onClick: () => void;
}) {
  const days = getDaysSince(demande.created_at);
  const isOld = demande.statut === 'nouvelle_demande' && days > 2;

  return (
    <tr
      onClick={onClick}
      style={{
        cursor: 'pointer', background: isSelected ? '#fdf0eb' : isOld ? '#fef3c7' : 'white',
        transition: 'background .15s',
      }}
    >
      <td style={{ padding: '.65rem .5rem', textAlign: 'center' }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={e => { e.stopPropagation(); onSelect(); }}
          onClick={e => e.stopPropagation()}
          style={{ cursor: 'pointer', accentColor: '#6b2a1a' }}
        />
      </td>
      <td style={{ padding: '.65rem .5rem' }}>
        <div style={{ fontWeight: 600, fontSize: '.85rem' }}>{demande.prenom} {demande.nom}</div>
        {demande.email && (
          <div style={{ fontSize: '.72rem', color: '#888' }}>{demande.email}</div>
        )}
      </td>
      <td style={{ padding: '.65rem .5rem' }}>
        <span style={{ fontSize: '.8rem', color: '#01696f' }}>📍 {demande.destination || '—'}</span>
      </td>
      <td style={{ padding: '.65rem .5rem' }}>
        <StatusBadge statut={demande.statut} />
      </td>
      <td style={{ padding: '.65rem .5rem' }}>
        <span style={{ fontSize: '.8rem', color: '#d4a574', fontWeight: 600 }}>
          {formatBudget(demande.budget_fourchette)}
        </span>
      </td>
      <td style={{ padding: '.65rem .5rem' }}>
        <span style={{ fontSize: '.8rem', color: days > 2 ? '#dc2626' : '#888', fontWeight: days > 2 ? 600 : 400 }}>
          {formatDate(demande.created_at)}
          {isOld && <span style={{ marginLeft: 4, fontSize: '.7rem' }}>⚠️</span>}
        </span>
      </td>
      <td style={{ padding: '.65rem .5rem' }}>
        <button
          onClick={e => { e.stopPropagation(); window.location.href = `mailto:${demande.email || ''}?subject=Votre demande Heldonica&body=Bonjour ${demande.prenom},%0D%0A%0D%0A`; }}
          disabled={!demande.email}
          style={{ padding: '.25rem .5rem', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '.3rem', cursor: demande.email ? 'pointer' : 'not-allowed', fontSize: '.72rem', opacity: demande.email ? 1 : .5 }}
        >📧</button>
      </td>
    </tr>
  );
}

// Detail Panel Component
function DetailPanel({ demande, onClose, onUpdate, onSaveNote }: {
  demande: DemandeTravel;
  onClose: () => void;
  onUpdate: (d: DemandeTravel) => void;
  onSaveNote: (note: string) => Promise<void>;
}) {
  const [note, setNote] = useState(demande.notes_internes || '');
  const [savingNote, setSavingNote] = useState(false);
  const [selectedStatut, setSelectedStatut] = useState(demande.statut);
  const [updating, setUpdating] = useState(false);

  const handleStatutChange = async (newStatut: string) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/cms/demandes-travel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-cms-auth': localStorage.getItem('cms_password') || '' },
        body: JSON.stringify({ id: demande.id, statut: newStatut }),
      });
      if (res.ok) {
        setSelectedStatut(newStatut);
        onUpdate({ ...demande, statut: newStatut });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveNote = async () => {
    setSavingNote(true);
    try {
      await onSaveNote(note);
    } finally {
      setSavingNote(false);
    }
  };

  const days = getDaysSince(demande.created_at);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
    }}>
      <div style={{
        background: 'white', borderRadius: '1rem', padding: '1.5rem',
        maxWidth: 560, width: '100%', maxHeight: '90vh', overflow: 'auto',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#6b2a1a' }}>
              {demande.prenom} {demande.nom}
            </h3>
            <p style={{ margin: '.25rem 0 0', fontSize: '.8rem', color: '#888' }}>
              Reçue le {formatDate(demande.created_at)} ({days}j)
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#888' }}>✕</button>
        </div>

        {/* Status selector */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '.8rem', color: '#888', marginBottom: '.4rem' }}>Statut</label>
          <select
            value={selectedStatut}
            onChange={e => handleStatutChange(e.target.value)}
            disabled={updating}
            style={{ width: '100%', padding: '.6rem .8rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '.9rem' }}
          >
            {STATUT_LIST.map(s => (
              <option key={s} value={s}>{STATUTS[s].label}</option>
            ))}
          </select>
        </div>

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '.72rem', color: '#888', textTransform: 'uppercase' }}>Destination</label>
            <p style={{ margin: '.2rem 0 0', fontWeight: 600 }}>{demande.destination || '—'}</p>
          </div>
          <div>
            <label style={{ fontSize: '.72rem', color: '#888', textTransform: 'uppercase' }}>Budget</label>
            <p style={{ margin: '.2rem 0 0', color: '#d4a574', fontWeight: 600 }}>{formatBudget(demande.budget_fourchette)}</p>
          </div>
          <div>
            <label style={{ fontSize: '.72rem', color: '#888', textTransform: 'uppercase' }}>Email</label>
            <p style={{ margin: '.2rem 0 0' }}>
              {demande.email ? (
                <a href={`mailto:${demande.email}`} style={{ color: '#01696f' }}>{demande.email}</a>
              ) : '—'}
            </p>
          </div>
          <div>
            <label style={{ fontSize: '.72rem', color: '#888', textTransform: 'uppercase' }}>Téléphone</label>
            <p style={{ margin: '.2rem 0 0' }}>{demande.telephone || '—'}</p>
          </div>
          <div>
            <label style={{ fontSize: '.72rem', color: '#888', textTransform: 'uppercase' }}>Voyageurs</label>
            <p style={{ margin: '.2rem 0 0' }}>{demande.nb_voyageurs || '—'}</p>
          </div>
          <div>
            <label style={{ fontSize: '.72rem', color: '#888', textTransform: 'uppercase' }}>Dates souhaitées</label>
            <p style={{ margin: '.2rem 0 0' }}>{demande.dates_souhaitees || '—'}</p>
          </div>
        </div>

        {/* Message */}
        {demande.message && (
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '.72rem', color: '#888', textTransform: 'uppercase' }}>Message</label>
            <p style={{ margin: '.25rem 0 0', padding: '.75rem', background: '#faf8f5', borderRadius: '.5rem', fontSize: '.85rem', lineHeight: 1.5 }}>
              {demande.message}
            </p>
          </div>
        )}

        {/* Internal notes */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '.8rem', color: '#888', marginBottom: '.4rem' }}>
            📝 Notes internes (non visibles par le client)
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="Ajoutez vos notes privées sur cette demande..."
            rows={4}
            style={{ width: '100%', padding: '.65rem .8rem', border: '1.5px solid #e0dbd5', borderRadius: '.5rem', fontSize: '.85rem', resize: 'vertical', fontFamily: 'inherit' }}
          />
          <button onClick={handleSaveNote} disabled={savingNote || note === (demande.notes_internes || '')}
            style={{ marginTop: '.5rem', padding: '.5rem 1rem', background: savingNote ? '#ccc' : '#6b2a1a', color: 'white', border: 'none', borderRadius: '.4rem', cursor: savingNote ? 'wait' : 'pointer', fontSize: '.85rem', fontWeight: 600 }}>
            {savingNote ? '⏳ Sauvegarde...' : '💾 Sauvegarder notes'}
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          {demande.email && (
            <a
              href={`mailto:${demande.email}?subject=Votre demande Heldonica - ${demande.destination || 'Voyage'}&body=Bonjour ${demande.prenom},%0D%0A%0D%0AVotre demande concernant ${demande.destination || 'votre voyage'} a bien été reçue.%0D%0A%0D%0AJe vous recontacterai très rapidement avec une proposition adaptée.%0D%0A%0D%0ABien cordialement%0DHeldonica`}
              style={{ padding: '.6rem 1rem', background: '#3B82F6', color: 'white', borderRadius: '.5rem', textDecoration: 'none', fontSize: '.85rem', fontWeight: 600 }}
            >
              📧 Envoyer un email
            </a>
          )}
          <button onClick={() => navigator.clipboard.writeText(`Demande #${demande.id} - ${demande.prenom} ${demande.nom} - ${demande.destination} - ${formatBudget(demande.budget_fourchette)}`)}
            style={{ padding: '.6rem 1rem', background: '#e8e3dc', color: '#555', border: 'none', borderRadius: '.5rem', cursor: 'pointer', fontSize: '.85rem' }}>
            📋 Copier résumé
          </button>
        </div>
      </div>
    </div>
  );
}

// Main Travel CRM Panel
export default function TravelCRMPanel({ initialDemandes = [] }: TravelCRMPanelProps) {
  const [demandes, setDemandes] = useState<DemandeTravel[]>(initialDemandes);
  const [loading, setLoading] = useState(initialDemandes.length === 0);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());
  const [detailId, setDetailId] = useState<string | number | null>(null);
  const [view, setView] = useState<'list' | 'kanban'>('list');

  // Load demandes on mount if not provided
  useEffect(() => {
    if (initialDemandes.length === 0) {
      const loadDemandes = async () => {
        setLoading(true);
        try {
          const res = await fetch('/api/cms/demandes-travel', {
            headers: { 'x-cms-auth': localStorage.getItem('cms_password') || '' },
          });
          if (res.ok) {
            const data = await res.json();
            setDemandes(data.demandes || []);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      loadDemandes();
    }
  }, [initialDemandes.length]);

  const filteredDemandes = useMemo(() => {
    return demandes.filter(d => {
      const matchesStatus = statusFilter === 'all' || d.statut === statusFilter;
      const matchesSearch = !deferredSearch ||
        `${d.prenom} ${d.nom} ${d.destination} ${d.email || ''}`.toLowerCase().includes(deferredSearch.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [demandes, statusFilter, deferredSearch]);

  const handleStatutChange = useCallback(async (id: string | number, newStatut: string) => {
    const res = await fetch('/api/cms/demandes-travel', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-cms-auth': localStorage.getItem('cms_password') || '' },
      body: JSON.stringify({ id, statut: newStatut }),
    });
    if (res.ok) {
      setDemandes(prev => prev.map(d => d.id === id ? { ...d, statut: newStatut } : d));
    }
  }, []);

  const handleSaveNote = useCallback(async (id: string | number, note: string) => {
    const res = await fetch('/api/cms/demandes-travel', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-cms-auth': localStorage.getItem('cms_password') || '' },
      body: JSON.stringify({ id, notes_internes: note }),
    });
    if (res.ok) {
      setDemandes(prev => prev.map(d => d.id === id ? { ...d, notes_internes: note } : d));
    }
  }, []);

  const toggleSelect = (id: string | number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filteredDemandes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredDemandes.map(d => d.id)));
    }
  };

  const detailDemande = detailId ? demandes.find(d => d.id === detailId) : null;

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: '#888' }}>
        ⏳ Chargement des demandes...
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#6b2a1a' }}>✈️ Travel Planning CRM</h2>
          <span style={{ background: '#f0e8e4', color: '#6b2a1a', padding: '.2rem .6rem', borderRadius: '9999px', fontSize: '.75rem', fontWeight: 700 }}>
            {demandes.length}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button onClick={() => setView('list')}
            style={{ padding: '.4rem .75rem', border: view === 'list' ? '2px solid #6b2a1a' : '1.5px solid #ddd', borderRadius: '.4rem', background: view === 'list' ? '#fdf0eb' : 'white', cursor: 'pointer', fontSize: '.8rem' }}>
            📋 Liste
          </button>
          <button onClick={() => setView('kanban')}
            style={{ padding: '.4rem .75rem', border: view === 'kanban' ? '2px solid #6b2a1a' : '1.5px solid #ddd', borderRadius: '.4rem', background: view === 'kanban' ? '#fdf0eb' : 'white', cursor: 'pointer', fontSize: '.8rem' }}>
            🔲 Kanban
          </button>
        </div>
      </div>

      {/* KPIs */}
      <StatsBar demandes={demandes} />

      {/* Filters */}
      <div style={{ display: 'flex', gap: '.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Rechercher..."
          style={{ padding: '.45rem .8rem', border: '1.5px solid #ddd', borderRadius: '.5rem', fontSize: '.85rem', minWidth: 180, flex: 1 }}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '.45rem .75rem', border: '1.5px solid #ddd', borderRadius: '.5rem', fontSize: '.85rem' }}>
          <option value="all">Tous les statuts</option>
          {STATUT_LIST.map(s => (
            <option key={s} value={s}>{STATUTS[s].label}</option>
          ))}
        </select>
      </div>

      {/* List view */}
      {view === 'list' && (
        <div style={{ background: 'white', borderRadius: '1rem', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
              <thead>
                <tr style={{ background: '#faf8f5' }}>
                  <th style={{ padding: '.65rem .5rem', textAlign: 'center', width: 40 }}>
                    <input type="checkbox" checked={selectedIds.size === filteredDemandes.length && filteredDemandes.length > 0}
                      onChange={selectAll} style={{ cursor: 'pointer', accentColor: '#6b2a1a' }} />
                  </th>
                  <th style={{ padding: '.65rem .5rem', textAlign: 'left' }}>Client</th>
                  <th style={{ padding: '.65rem .5rem', textAlign: 'left' }}>Destination</th>
                  <th style={{ padding: '.65rem .5rem', textAlign: 'left' }}>Statut</th>
                  <th style={{ padding: '.65rem .5rem', textAlign: 'left' }}>Budget</th>
                  <th style={{ padding: '.65rem .5rem', textAlign: 'left' }}>Reçue</th>
                  <th style={{ padding: '.65rem .5rem', textAlign: 'center', width: 50 }}>✉️</th>
                </tr>
              </thead>
              <tbody>
                {filteredDemandes.map(d => (
                  <DemandeRow
                    key={d.id}
                    demande={d}
                    isSelected={selectedIds.has(d.id)}
                    onSelect={() => toggleSelect(d.id)}
                    onClick={() => setDetailId(d.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
          {filteredDemandes.length === 0 && (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
              {demandes.length === 0 ? 'Aucune demande pour le moment' : 'Aucun résultat pour cette recherche'}
            </div>
          )}
        </div>
      )}

      {/* Kanban placeholder */}
      {view === 'kanban' && (
        <div style={{ background: 'white', borderRadius: '1rem', padding: '2rem', textAlign: 'center', color: '#888', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <p>🔲 Vue Kanban disponible avec drag & drop</p>
          <p style={{ fontSize: '.8rem', marginTop: '.5rem' }}>
            {STATUT_LIST.map(s => (
              <span key={s} style={{ display: 'inline-block', margin: '0 .25rem' }}>
                <StatusBadge statut={s} />
              </span>
            ))}
          </p>
        </div>
      )}

      {/* Detail panel */}
      {detailDemande && (
        <DetailPanel
          demande={detailDemande}
          onClose={() => setDetailId(null)}
          onUpdate={d => setDemandes(prev => prev.map(x => x.id === d.id ? d : x))}
          onSaveNote={note => handleSaveNote(detailDemande.id, note)}
        />
      )}
    </div>
  );
}