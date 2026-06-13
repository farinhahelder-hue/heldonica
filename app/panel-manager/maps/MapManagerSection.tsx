'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';

const MapPreview = dynamic(() => import('./MapPreview'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: 400, background: '#f3f0ec', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a7974' }}>Chargement de la carte…</div>
  ),
});

type Route = {
  id: string; content_slug: string; name: string; description?: string;
  difficulty?: string; duration_min?: number; distance_km?: number;
  color: string; is_active: boolean; display_order: number;
  points?: { lat: number; lng: number; seq: number }[];
};
type POI = {
  id: string; content_slug: string; route_id?: string; name: string;
  description?: string; category: string; lat: number; lng: number;
  address?: string; maps_url?: string; display_order: number;
};
type Article = { id: number; title: string; slug: string };

const DIFFICULTY_LABELS: Record<string, string> = {
  famille: '👨‍👩‍👧 Famille', debutant: '🟢 Débutant', intermediaire: '🟡 Intermédiaire',
  sportif: '🔴 Sportif', libre: '⚪ Libre',
};
const CATEGORY_LABELS: Record<string, string> = {
  depart: '🟢 Départ', arrivee: '🔴 Arrivée', danger: '⚠️ Danger', info: 'ℹ️ Info',
  parking: '🅿️ Parking', restaurant: '🍽️ Restaurant', baignade: '🏊 Baignade',
  portage: '🎒 Portage', point_vue: '👁️ Point de vue', transport: '🚌 Transport',
  logement: '🏠 Logement', activite: '🎯 Activité',
};
const PRESET_COLORS = [
  { label: 'Teal',   value: '#01696f' },
  { label: 'Vert',   value: '#4CAF50' },
  { label: 'Bleu',   value: '#1976d2' },
  { label: 'Orange', value: '#FF9800' },
  { label: 'Rouge',  value: '#f44336' },
  { label: 'Violet', value: '#7B1FA2' },
];

const emptyRoute = (): Partial<Route> => ({
  name: '', description: '', difficulty: 'libre', duration_min: undefined,
  distance_km: undefined, color: '#01696f', is_active: true, display_order: 0,
});
const emptyPoi = (): Partial<POI> => ({
  name: '', description: '', category: 'info', lat: undefined as any,
  lng: undefined as any, address: '', maps_url: '', display_order: 0,
});

export default function MapManagerSection() {
  // --- Article search state (paginated, debounced) ---
  const [articleSearch, setArticleSearch] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [slug, setSlug] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [pois, setPois] = useState<POI[]>([]);
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);
  const [editingRoute, setEditingRoute] = useState<Partial<Route> | null>(null);
  const [addingRoute, setAddingRoute] = useState(false);
  const [editingPoi, setEditingPoi] = useState<Partial<POI> | null>(null);
  const [addingPoi, setAddingPoi] = useState<string | null>(null);
  const [pointsText, setPointsText] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  // Debounced article search — fetches only when user types, max 20 results
  const searchArticles = useCallback((q: string) => {
    if (!q.trim()) { setArticles([]); setShowDropdown(false); return; }
    setArticlesLoading(true);
    setShowDropdown(true);
    fetch(`/api/cms/articles?search=${encodeURIComponent(q)}&limit=20`)
      .then(r => r.json())
      .then(data => {
        setArticles(Array.isArray(data) ? data : (data.articles ?? []));
      })
      .catch(() => {})
      .finally(() => setArticlesLoading(false));
  }, []);

  const handleArticleSearchChange = (value: string) => {
    setArticleSearch(value);
    // Also allow direct slug input
    if (value.includes('-') && !value.includes(' ')) {
      // Looks like a slug — show it as manual entry option
    }
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => searchArticles(value), 300);
  };

  const loadMapData = useCallback(async (s: string) => {
    if (!s) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cms/maps/${s}`);
      const data = await res.json();
      const loadedRoutes: Route[] = (data.routes ?? []).map((r: Route) => ({
        ...r,
        points: (data.points ?? []).filter((p: any) => p.route_id === r.id),
      }));
      setRoutes(loadedRoutes);
      setPois(data.pois ?? []);
      const ptText: Record<string, string> = {};
      loadedRoutes.forEach(r => {
        ptText[r.id] = (r.points ?? []).sort((a, b) => a.seq - b.seq)
          .map(p => `${p.lat},${p.lng}`).join('\n');
      });
      setPointsText(ptText);
    } catch {}
    setLoading(false);
  }, []);

  const loadShowMap = useCallback(async (s: string) => {
    if (!s) return;
    const res = await fetch(`/api/cms/articles/${s}`);
    if (res.ok) {
      const d = await res.json();
      setShowMap(Boolean(d.show_map));
    }
  }, []);

  const handleSlugSelect = (s: string, title?: string) => {
    setSlug(s);
    setArticleSearch(title ?? s);
    setShowDropdown(false);
    setArticles([]);
    setRoutes([]); setPois([]); setExpandedRouteId(null);
    setEditingRoute(null); setAddingRoute(false);
    loadMapData(s);
    loadShowMap(s);
  };

  const handleManualSlugSubmit = () => {
    const s = articleSearch.trim().toLowerCase().replace(/\s+/g, '-');
    if (!s) return;
    handleSlugSelect(s, s);
  };

  const toggleShowMap = async (val: boolean) => {
    setShowMap(val);
    await fetch(`/api/cms/articles/${slug}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ show_map: val }),
    });
  };

  // Save route
  const saveRoute = async () => {
    if (!editingRoute?.name || !slug) return;
    setSaving(true);
    try {
      const isNew = !editingRoute.id;
      const res = await fetch(`/api/cms/maps/${slug}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isNew ? editingRoute : { ...editingRoute, type: 'route' }),
      });
      const saved = await res.json();
      if (isNew) setRoutes(prev => [...prev, { ...saved, points: [] }]);
      else setRoutes(prev => prev.map(r => r.id === saved.id ? { ...r, ...saved } : r));
      setEditingRoute(null); setAddingRoute(false);
      showToast('Parcours sauvegardé ✅');
    } catch { showToast('Erreur lors de la sauvegarde'); }
    setSaving(false);
  };

  const deleteRoute = async (id: string) => {
    if (!confirm('Supprimer ce parcours et tous ses points ?')) return;
    await fetch(`/api/cms/maps/${slug}?type=route&id=${id}`, { method: 'DELETE' });
    setRoutes(prev => prev.filter(r => r.id !== id));
    showToast('Parcours supprimé');
  };

  const savePoints = async (routeId: string) => {
    const text = pointsText[routeId] ?? '';
    const points = text.split('\n').map(l => l.trim()).filter(Boolean).map((l, i) => {
      const [lat, lng] = l.split(',').map(Number);
      return { lat, lng, seq: i };
    }).filter(p => !isNaN(p.lat) && !isNaN(p.lng));
    setSaving(true);
    await fetch(`/api/cms/maps/${slug}/points`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route_id: routeId, points }),
    });
    setRoutes(prev => prev.map(r => r.id === routeId ? { ...r, points } : r));
    showToast(`${points.length} points sauvegardés ✅`);
    setSaving(false);
  };

  const savePoi = async () => {
    if (!editingPoi?.name || !slug) return;
    setSaving(true);
    try {
      const isNew = !editingPoi.id;
      const payload = isNew
        ? { ...editingPoi, route_id: addingPoi !== 'standalone' ? addingPoi : undefined }
        : { ...editingPoi, type: 'poi' };
      const res = await fetch(
        isNew ? `/api/cms/maps/${slug}/pois` : `/api/cms/maps/${slug}`,
        {
          method: isNew ? 'POST' : 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const saved = await res.json();
      if (isNew) setPois(prev => [...prev, saved]);
      else setPois(prev => prev.map(p => p.id === saved.id ? saved : p));
      setEditingPoi(null); setAddingPoi(null);
      showToast('POI sauvegardé ✅');
    } catch { showToast('Erreur lors de la sauvegarde'); }
    setSaving(false);
  };

  const deletePoi = async (id: string) => {
    if (!confirm('Supprimer ce POI ?')) return;
    await fetch(`/api/cms/maps/${slug}?type=poi&id=${id}`, { method: 'DELETE' });
    setPois(prev => prev.filter(p => p.id !== id));
    showToast('POI supprimé');
  };

  const previewRoutes = routes.map(r => ({ ...r, points: r.points ?? [], color: r.color || '#01696f' }));

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '6px 10px', border: '1px solid #d4d1ca',
    borderRadius: 6, fontSize: 14, background: '#fff', color: '#28251d',
  };
  const btnPrimary: React.CSSProperties = {
    background: '#01696f', color: '#fff', border: 'none', borderRadius: 6,
    padding: '7px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
  };
  const btnDanger: React.CSSProperties = {
    background: '#f44336', color: '#fff', border: 'none', borderRadius: 6,
    padding: '5px 12px', cursor: 'pointer', fontSize: 12,
  };
  const card: React.CSSProperties = {
    background: '#fff', border: '1px solid #e8e6e2', borderRadius: 8, padding: '12px 16px', marginBottom: 8,
  };

  const RouteForm = ({ route, onSave, onCancel }: { route: Partial<Route>; onSave: () => void; onCancel: () => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      <input style={inputStyle} placeholder="Nom du parcours *" value={route.name ?? ''}
        onChange={e => setEditingRoute(r => ({ ...r!, name: e.target.value }))} />
      <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }} placeholder="Description"
        value={route.description ?? ''}
        onChange={e => setEditingRoute(r => ({ ...r!, description: e.target.value }))} />
      <div style={{ display: 'flex', gap: 8 }}>
        <select style={{ ...inputStyle, width: 'auto', flex: 1 }} value={route.difficulty ?? 'libre'}
          onChange={e => setEditingRoute(r => ({ ...r!, difficulty: e.target.value }))}>
          {Object.entries(DIFFICULTY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input style={{ ...inputStyle, width: 90 }} type="number" placeholder="Min" value={route.duration_min ?? ''}
          onChange={e => setEditingRoute(r => ({ ...r!, duration_min: Number(e.target.value) || undefined }))} />
        <input style={{ ...inputStyle, width: 90 }} type="number" step="0.01" placeholder="km" value={route.distance_km ?? ''}
          onChange={e => setEditingRoute(r => ({ ...r!, distance_km: Number(e.target.value) || undefined }))} />
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#7a7974' }}>Couleur :</span>
        {PRESET_COLORS.map(c => (
          <button key={c.value} onClick={() => setEditingRoute(r => ({ ...r!, color: c.value }))}
            style={{ width: 24, height: 24, borderRadius: '50%', background: c.value, border: route.color === c.value ? '2px solid #28251d' : '2px solid transparent', cursor: 'pointer' }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnPrimary} onClick={onSave} disabled={saving}>{saving ? 'Sauvegarde…' : 'Sauvegarder'}</button>
        <button style={{ ...btnPrimary, background: '#7a7974' }} onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );

  const PoiForm = ({ poi, onSave, onCancel }: { poi: Partial<POI>; onSave: () => void; onCancel: () => void }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 8 }}>
      <input style={inputStyle} placeholder="Nom du POI *" value={poi.name ?? ''}
        onChange={e => setEditingPoi(p => ({ ...p!, name: e.target.value }))} />
      <select style={{ ...inputStyle }} value={poi.category ?? 'info'}
        onChange={e => setEditingPoi(p => ({ ...p!, category: e.target.value }))}>
        {Object.entries(CATEGORY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <div style={{ display: 'flex', gap: 8 }}>
        <input style={inputStyle} type="number" step="0.0000001" placeholder="Latitude *" value={poi.lat ?? ''}
          onChange={e => setEditingPoi(p => ({ ...p!, lat: parseFloat(e.target.value) }))} />
        <input style={inputStyle} type="number" step="0.0000001" placeholder="Longitude *" value={poi.lng ?? ''}
          onChange={e => setEditingPoi(p => ({ ...p!, lng: parseFloat(e.target.value) }))} />
      </div>
      <textarea style={{ ...inputStyle, minHeight: 50, resize: 'vertical' }} placeholder="Description"
        value={poi.description ?? ''}
        onChange={e => setEditingPoi(p => ({ ...p!, description: e.target.value }))} />
      <input style={inputStyle} placeholder="Adresse (optionnel)" value={poi.address ?? ''}
        onChange={e => setEditingPoi(p => ({ ...p!, address: e.target.value }))} />
      <input style={inputStyle} placeholder="Lien Google Maps (optionnel)" value={poi.maps_url ?? ''}
        onChange={e => setEditingPoi(p => ({ ...p!, maps_url: e.target.value }))} />
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={btnPrimary} onClick={onSave} disabled={saving}>{saving ? 'Sauvegarde…' : 'Sauvegarder'}</button>
        <button style={{ ...btnPrimary, background: '#7a7974' }} onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', gap: 24, minHeight: 600, position: 'relative' }}>
      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#01696f', color: '#fff', padding: '10px 20px', borderRadius: 8, zIndex: 9999, fontSize: 14, fontWeight: 600, boxShadow: '0 4px 16px rgba(0,0,0,0.15)' }}>
          {toast}
        </div>
      )}

      {/* LEFT PANEL */}
      <div style={{ width: '40%', minWidth: 320, overflowY: 'auto', maxHeight: '80vh', paddingRight: 4 }}>
        {/* Step 1 — Content Selector */}
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: '#28251d', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            1 — Choisir un article / une page
          </h3>
          <div style={{ position: 'relative' }}>
            <div style={{ display: 'flex', gap: 6 }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Rechercher par titre ou saisir un slug…"
                value={articleSearch}
                onChange={e => handleArticleSearchChange(e.target.value)}
                onFocus={() => articleSearch && setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              />
              <button
                style={{ ...btnPrimary, padding: '6px 12px', fontSize: 12 }}
                onClick={handleManualSlugSubmit}
                title="Charger ce slug directement"
              >
                OK
              </button>
            </div>
            {/* Dropdown results */}
            {showDropdown && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 36, background: '#fff',
                border: '1px solid #d4d1ca', borderRadius: 6, zIndex: 100,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)', maxHeight: 220, overflowY: 'auto',
              }}>
                {articlesLoading && (
                  <div style={{ padding: '8px 12px', fontSize: 13, color: '#7a7974' }}>Recherche…</div>
                )}
                {!articlesLoading && articles.length === 0 && (
                  <div style={{ padding: '8px 12px', fontSize: 13, color: '#7a7974' }}>Aucun résultat — cliquez OK pour charger le slug saisi</div>
                )}
                {articles.map(a => (
                  <div
                    key={a.id}
                    style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid #f3f0ec' }}
                    onMouseDown={() => handleSlugSelect(a.slug, a.title)}
                  >
                    <div style={{ fontWeight: 600, color: '#28251d' }}>{a.title}</div>
                    <div style={{ color: '#7a7974', fontSize: 12 }}>{a.slug}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {slug && (
            <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 13, color: '#7a7974' }}>Carte activée sur cet article :</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={showMap} onChange={e => toggleShowMap(e.target.checked)} />
                <span style={{ fontSize: 13, fontWeight: 600, color: showMap ? '#01696f' : '#7a7974' }}>
                  {showMap ? 'Affichée' : 'Masquée'}
                </span>
              </label>
            </div>
          )}
        </div>

        {loading && <div style={{ fontSize: 13, color: '#7a7974', marginBottom: 12 }}>Chargement des données carte…</div>}

        {slug && (
          <>
            {/* Step 2 — Routes */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#28251d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  2 — Parcours ({routes.length})
                </h3>
                {!addingRoute && (
                  <button style={{ ...btnPrimary, fontSize: 12, padding: '4px 10px' }}
                    onClick={() => { setAddingRoute(true); setEditingRoute(emptyRoute()); setExpandedRouteId(null); }}>
                    + Ajouter
                  </button>
                )}
              </div>

              {addingRoute && editingRoute && (
                <div style={{ ...card, borderColor: '#01696f' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#01696f', marginBottom: 4 }}>Nouveau parcours</div>
                  <RouteForm route={editingRoute} onSave={saveRoute} onCancel={() => { setAddingRoute(false); setEditingRoute(null); }} />
                </div>
              )}

              {routes.map(r => (
                <div key={r.id} style={card}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    onClick={() => {
                      if (expandedRouteId === r.id) { setExpandedRouteId(null); setEditingRoute(null); }
                      else { setExpandedRouteId(r.id); setEditingRoute({ ...r }); }
                    }}
                  >
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: r.color || '#01696f', flexShrink: 0 }} />
                    <span style={{ fontWeight: 600, fontSize: 13, flex: 1 }}>{r.name}</span>
                    {r.difficulty && <span style={{ fontSize: 11, background: '#f3f0ec', padding: '2px 7px', borderRadius: 10 }}>{DIFFICULTY_LABELS[r.difficulty] ?? r.difficulty}</span>}
                    {r.duration_min && <span style={{ fontSize: 11, color: '#7a7974' }}>{r.duration_min} min</span>}
                    <span style={{ fontSize: 18, color: '#bab9b4' }}>{expandedRouteId === r.id ? '▲' : '▼'}</span>
                  </div>

                  {expandedRouteId === r.id && editingRoute && (
                    <>
                      <RouteForm route={editingRoute} onSave={saveRoute}
                        onCancel={() => { setExpandedRouteId(null); setEditingRoute(null); }} />
                      <button style={{ ...btnDanger, marginTop: 8 }}
                        onClick={() => deleteRoute(r.id)}>Supprimer ce parcours</button>

                      {/* Points editor */}
                      <div style={{ marginTop: 12 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#7a7974', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Points du tracé (lat,lng par ligne)
                        </div>
                        <textarea
                          style={{ ...inputStyle, minHeight: 90, fontSize: 12, fontFamily: 'monospace', resize: 'vertical' }}
                          placeholder={"48.8584,2.2945\n48.8570,2.2950\n..."}  
                          value={pointsText[r.id] ?? ''}
                          onChange={e => setPointsText(prev => ({ ...prev, [r.id]: e.target.value }))}
                        />
                        <button style={{ ...btnPrimary, fontSize: 12, padding: '5px 12px', marginTop: 4 }}
                          onClick={() => savePoints(r.id)} disabled={saving}>
                          Sauvegarder les points
                        </button>
                      </div>

                      {/* POIs for this route */}
                      <div style={{ marginTop: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#7a7974', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            POIs ({pois.filter(p => p.route_id === r.id).length})
                          </span>
                          <button style={{ ...btnPrimary, fontSize: 11, padding: '3px 8px' }}
                            onClick={() => { setAddingPoi(r.id); setEditingPoi(emptyPoi()); }}>
                            + POI
                          </button>
                        </div>
                        {addingPoi === r.id && editingPoi && (
                          <div style={{ ...card, borderColor: '#01696f' }}>
                            <PoiForm poi={editingPoi} onSave={savePoi} onCancel={() => { setAddingPoi(null); setEditingPoi(null); }} />
                          </div>
                        )}
                        {pois.filter(p => p.route_id === r.id).map(p => (
                          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #f3f0ec', fontSize: 12 }}>
                            <span>{CATEGORY_LABELS[p.category] ?? p.category} {p.name}</span>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <button style={{ ...btnPrimary, fontSize: 11, padding: '2px 8px' }}
                                onClick={() => { setEditingPoi({ ...p }); setAddingPoi(r.id); }}>Edit</button>
                              <button style={{ ...btnDanger, fontSize: 11, padding: '2px 8px' }}
                                onClick={() => deletePoi(p.id)}>×</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Step 3 — Standalone POIs */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, color: '#28251d', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  3 — POIs indépendants ({pois.filter(p => !p.route_id).length})
                </h3>
                <button style={{ ...btnPrimary, fontSize: 12, padding: '4px 10px' }}
                  onClick={() => { setAddingPoi('standalone'); setEditingPoi(emptyPoi()); }}>
                  + POI
                </button>
              </div>
              {addingPoi === 'standalone' && editingPoi && (
                <div style={{ ...card, borderColor: '#01696f' }}>
                  <PoiForm poi={editingPoi} onSave={savePoi} onCancel={() => { setAddingPoi(null); setEditingPoi(null); }} />
                </div>
              )}
              {pois.filter(p => !p.route_id).map(p => (
                <div key={p.id} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px' }}>
                  <span style={{ fontSize: 13 }}>{CATEGORY_LABELS[p.category] ?? p.category} {p.name}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button style={{ ...btnPrimary, fontSize: 11, padding: '2px 8px' }}
                      onClick={() => { setEditingPoi({ ...p }); setAddingPoi('standalone'); }}>Edit</button>
                    <button style={{ ...btnDanger, fontSize: 11, padding: '2px 8px' }}
                      onClick={() => deletePoi(p.id)}>×</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANEL — Map Preview */}
      <div style={{ flex: 1, position: 'sticky', top: 0, height: 'fit-content' }}>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: '#28251d', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Aperçu carte
        </h3>
        {slug ? (
          <MapPreview routes={previewRoutes} pois={pois} />
        ) : (
          <div style={{ width: '100%', height: 400, background: '#f3f0ec', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bab9b4', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 32 }}>🗺️</span>
            <span style={{ fontSize: 14 }}>Sélectionnez un article pour voir la carte</span>
          </div>
        )}
        {slug && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#7a7974' }}>
            Slug actif : <strong>{slug}</strong> — {routes.length} parcours — {pois.length} POIs
          </div>
        )}
      </div>
    </div>
  );
}
