'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';

const MapPreview = dynamic(() => import('./MapPreview'), { ssr: false, loading: () => (
  <div style={{ width: '100%', height: 400, background: '#f3f0ec', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7a7974' }}>Chargement de la carte…</div>
)});

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
  // --- article search: debounced, paginated, max 20 ---
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchArticles = useCallback(async (q: string) => {
    setSearchLoading(true);
    try {
      const params = new URLSearchParams({ limit: '20', page: '1' });
      if (q.trim()) params.set('search', q.trim());
      const res = await fetch(`/api/cms/articles?${params.toString()}`);
      if (!res.ok) throw new Error('fetch failed');
      const data = await res.json();
      setArticles(Array.isArray(data) ? data.slice(0, 20) : (data.articles ?? []).slice(0, 20));
    } catch {
      setArticles([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Initial load (empty query → most recent 20)
  useEffect(() => { fetchArticles(''); }, [fetchArticles]);

  // Debounce on searchQuery change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchArticles(searchQuery), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchQuery, fetchArticles]);

  // --- map state ---
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
        ptText[r.id] = (r.points ?? []).sort((a, b) => a.seq - b.seq).map(p => `${p.lat},${p.lng}`).join('\n');
      });
      setPointsText(ptText);
    } catch {}
    setLoading(false);
  }, []);

  const loadShowMap = useCallback(async (s: string) => {
    if (!s) return;
    const res = await fetch(`/api/cms/articles/by-slug/${s}`);
    if (res.ok) {
      const d = await res.json();
      setShowMap(Boolean(d.show_map));
    }
  }, []);

  const handleSlugSelect = (s: string) => {
    setSlug(s);
    setRoutes([]); setPois([]); setExpandedRouteId(null);
    setEditingRoute(null); setAddingRoute(false);
    loadMapData(s);
    loadShowMap(s);
  };

  const toggleShowMap = async (val: boolean) => {
    setShowMap(val);
    await fetch(`/api/cms/articles/by-slug/${slug}`, {
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

  // Save points
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

  // Save POI
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

  // Build preview data
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
    background: '#f9f8f5', border: '1px solid #dcd9d5', borderRadius: 8,
    padding: '12px 14px', marginBottom: 8,
  };
  const label: React.CSSProperties = { fontSize: 12, color: '#7a7974', marginBottom: 3, display: 'block' };

  return (
    <div style={{ display: 'flex', gap: 20, height: '100%', padding: '16px 0' }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, background: '#01696f', color: '#fff',
          padding: '10px 18px', borderRadius: 8, zIndex: 9999, fontSize: 14, fontWeight: 600,
        }}>{toast}</div>
      )}

      {/* LEFT PANEL */}
      <div style={{ width: '40%', minWidth: 300, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Step 1: Slug selector */}
        <div style={card}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#28251d' }}>① Sélectionner un contenu</div>
          <label style={label}>Slug de l&apos;article / page</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <input
              style={{ ...inputStyle, flex: 1 }}
              value={slug}
              onChange={e => setSlug(e.target.value)}
              placeholder="ex: road-trip-islande"
              onKeyDown={e => e.key === 'Enter' && handleSlugSelect(slug)}
            />
            <button style={btnPrimary} onClick={() => handleSlugSelect(slug)}>OK</button>
          </div>

          {/* Debounced search input + dropdown */}
          <label style={label}>
            Rechercher un article
            {searchLoading && <span style={{ marginLeft: 6, color: '#bab9b4' }}>⏳</span>}
          </label>
          <input
            style={{ ...inputStyle, marginBottom: 6 }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Taper pour filtrer (300ms debounce)…"
          />
          {articles.length > 0 && (
            <select style={inputStyle} value={slug} onChange={e => handleSlugSelect(e.target.value)}>
              <option value="">-- Choisir parmi les {articles.length} résultats --</option>
              {articles.map(a => (
                <option key={a.id} value={a.slug}>{a.title} ({a.slug})</option>
              ))}
            </select>
          )}
          {articles.length === 0 && !searchLoading && searchQuery && (
            <div style={{ fontSize: 12, color: '#7a7974', padding: '4px 0' }}>Aucun résultat pour &quot;{searchQuery}&quot;</div>
          )}

          {slug && (
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 13, cursor: 'pointer' }}>
              <input type="checkbox" checked={showMap} onChange={e => toggleShowMap(e.target.checked)} />
              Afficher la carte sur cet article
            </label>
          )}
        </div>

        {slug && (
          <>
            {/* Step 2: Routes */}
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#28251d' }}>② Parcours {loading ? '(chargement…)' : `(${routes.length})`}</div>

              {routes.map(route => (
                <div key={route.id} style={{ ...card, background: '#fff', marginBottom: 6 }}>
                  <div
                    style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                    onClick={() => setExpandedRouteId(expandedRouteId === route.id ? null : route.id)}
                  >
                    <span style={{ width: 12, height: 12, borderRadius: '50%', background: route.color, flexShrink: 0 }} />
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 13 }}>{route.name}</span>
                    {route.difficulty && <span style={{ fontSize: 11, background: '#f3f0ec', padding: '2px 6px', borderRadius: 10 }}>{DIFFICULTY_LABELS[route.difficulty] ?? route.difficulty}</span>}
                    {route.duration_min && <span style={{ fontSize: 11, color: '#7a7974' }}>{route.duration_min}min</span>}
                    <span style={{ fontSize: 13, color: '#bab9b4' }}>{expandedRouteId === route.id ? '▲' : '▼'}</span>
                  </div>

                  {expandedRouteId === route.id && (
                    <div style={{ marginTop: 10 }}>
                      {editingRoute?.id === route.id ? (
                        <RouteForm
                          value={editingRoute}
                          onChange={setEditingRoute}
                          onSave={saveRoute}
                          onCancel={() => setEditingRoute(null)}
                          saving={saving}
                          inputStyle={inputStyle}
                          btnPrimary={btnPrimary}
                          label={label}
                        />
                      ) : (
                        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                          <button style={{ ...btnPrimary, background: '#1976d2' }} onClick={() => setEditingRoute({ ...route })}>Modifier</button>
                          <button style={btnDanger} onClick={() => deleteRoute(route.id)}>Supprimer</button>
                        </div>
                      )}

                      {/* Route points */}
                      <div style={{ marginTop: 10 }}>
                        <label style={label}>Points du tracé (lat,lng — une ligne par point)</label>
                        <textarea
                          style={{ ...inputStyle, minHeight: 80, fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
                          value={pointsText[route.id] ?? ''}
                          onChange={e => setPointsText(prev => ({ ...prev, [route.id]: e.target.value }))}
                          placeholder={"48.8566,2.3522\n48.8600,2.3600"}
                        />
                        <button style={{ ...btnPrimary, marginTop: 4, fontSize: 12 }} onClick={() => savePoints(route.id)} disabled={saving}>💾 Sauvegarder le tracé</button>
                      </div>

                      {/* POIs for this route */}
                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>POIs de ce parcours ({pois.filter(p => p.route_id === route.id).length})</div>
                        {pois.filter(p => p.route_id === route.id).map(poi => (
                          <PoiRow key={poi.id} poi={poi} onEdit={() => { setEditingPoi({ ...poi }); setAddingPoi(null); }} onDelete={() => deletePoi(poi.id)} />
                        ))}
                        {addingPoi === route.id ? (
                          <PoiForm
                            value={editingPoi ?? emptyPoi()}
                            onChange={setEditingPoi}
                            onSave={savePoi}
                            onCancel={() => { setAddingPoi(null); setEditingPoi(null); }}
                            saving={saving}
                            inputStyle={inputStyle}
                            btnPrimary={btnPrimary}
                            label={label}
                          />
                        ) : (
                          <button style={{ ...btnPrimary, background: '#4CAF50', fontSize: 12, marginTop: 4 }}
                            onClick={() => { setAddingPoi(route.id); setEditingPoi(emptyPoi()); }}>
                            + Ajouter un POI
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {addingRoute ? (
                <RouteForm
                  value={editingRoute ?? emptyRoute()}
                  onChange={setEditingRoute}
                  onSave={saveRoute}
                  onCancel={() => { setAddingRoute(false); setEditingRoute(null); }}
                  saving={saving}
                  inputStyle={inputStyle}
                  btnPrimary={btnPrimary}
                  label={label}
                />
              ) : (
                <button style={{ ...btnPrimary, width: '100%', marginTop: 4 }}
                  onClick={() => { setAddingRoute(true); setEditingRoute(emptyRoute()); }}>
                  + Ajouter un parcours
                </button>
              )}
            </div>

            {/* Step 3: Standalone POIs */}
            <div style={card}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: '#28251d' }}>③ POIs indépendants ({pois.filter(p => !p.route_id).length})</div>
              {pois.filter(p => !p.route_id).map(poi => (
                <PoiRow key={poi.id} poi={poi} onEdit={() => { setEditingPoi({ ...poi }); setAddingPoi(null); }} onDelete={() => deletePoi(poi.id)} />
              ))}
              {editingPoi && !editingPoi.id && addingPoi === 'standalone' ? (
                <PoiForm
                  value={editingPoi}
                  onChange={setEditingPoi}
                  onSave={savePoi}
                  onCancel={() => { setAddingPoi(null); setEditingPoi(null); }}
                  saving={saving}
                  inputStyle={inputStyle}
                  btnPrimary={btnPrimary}
                  label={label}
                />
              ) : editingPoi?.id ? (
                <PoiForm
                  value={editingPoi}
                  onChange={setEditingPoi}
                  onSave={savePoi}
                  onCancel={() => setEditingPoi(null)}
                  saving={saving}
                  inputStyle={inputStyle}
                  btnPrimary={btnPrimary}
                  label={label}
                />
              ) : (
                <button style={{ ...btnPrimary, width: '100%', marginTop: 4 }}
                  onClick={() => { setAddingPoi('standalone'); setEditingPoi(emptyPoi()); }}>
                  + Ajouter un POI indépendant
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* RIGHT PANEL — Map preview */}
      <div style={{ flex: 1, position: 'sticky', top: 0, height: 'calc(100vh - 160px)', minHeight: 400, borderRadius: 10, overflow: 'hidden', border: '1px solid #dcd9d5' }}>
        {slug ? (
          <MapPreview routes={previewRoutes} pois={pois} centerSlug={slug} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bab9b4', fontSize: 14, background: '#f9f8f5' }}>
            🗺️ Sélectionne un article pour afficher la carte
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Sub-components =====

function RouteForm({ value, onChange, onSave, onCancel, saving, inputStyle, btnPrimary, label }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
      <div><label style={label}>Nom *</label><input style={inputStyle} value={value.name ?? ''} onChange={e => onChange((v: any) => ({ ...v, name: e.target.value }))} /></div>
      <div><label style={label}>Description</label><textarea style={{ ...inputStyle, minHeight: 60 }} value={value.description ?? ''} onChange={e => onChange((v: any) => ({ ...v, description: e.target.value }))} /></div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <label style={label}>Difficulté</label>
          <select style={inputStyle} value={value.difficulty ?? 'libre'} onChange={e => onChange((v: any) => ({ ...v, difficulty: e.target.value }))}>
            {Object.entries(DIFFICULTY_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Durée (min)</label>
          <input style={inputStyle} type="number" value={value.duration_min ?? ''} onChange={e => onChange((v: any) => ({ ...v, duration_min: Number(e.target.value) || undefined }))}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={label}>Distance (km)</label>
          <input style={inputStyle} type="number" step="0.1" value={value.distance_km ?? ''} onChange={e => onChange((v: any) => ({ ...v, distance_km: Number(e.target.value) || undefined }))} />
        </div>
      </div>
      <div>
        <label style={label}>Couleur</label>
        <div style={{ display: 'flex', gap: 6 }}>
          {PRESET_COLORS.map(c => (
            <button key={c.value} onClick={() => onChange((v: any) => ({ ...v, color: c.value }))}
              style={{ width: 24, height: 24, borderRadius: '50%', background: c.value, border: value.color === c.value ? '3px solid #28251d' : '2px solid transparent', cursor: 'pointer', padding: 0 }}
              title={c.label}
            />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <button style={btnPrimary} onClick={onSave} disabled={saving}>{saving ? 'Sauvegarde…' : '💾 Sauvegarder'}</button>
        <button style={{ ...btnPrimary, background: '#7a7974' }} onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );
}

function PoiRow({ poi, onEdit, onDelete }: { poi: POI; onEdit: () => void; onDelete: () => void }) {
  const CATEGORY_EMOJI: Record<string, string> = {
    depart: '🟢', arrivee: '🔴', danger: '⚠️', info: 'ℹ️', parking: '🅿️',
    restaurant: '🍽️', baignade: '🏊', portage: '🎒', point_vue: '👁️',
    transport: '🚌', logement: '🏠', activite: '🎯',
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', borderBottom: '1px solid #f3f0ec' }}>
      <span>{CATEGORY_EMOJI[poi.category] ?? 'ℹ️'}</span>
      <span style={{ flex: 1, fontSize: 12 }}>{poi.name}</span>
      <span style={{ fontSize: 11, color: '#7a7974' }}>{poi.lat},{poi.lng}</span>
      <button style={{ fontSize: 11, padding: '2px 8px', background: '#1976d2', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={onEdit}>Éditer</button>
      <button style={{ fontSize: 11, padding: '2px 8px', background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }} onClick={onDelete}>×</button>
    </div>
  );
}

function PoiForm({ value, onChange, onSave, onCancel, saving, inputStyle, btnPrimary, label }: any) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8, padding: 8, background: '#f9f8f5', borderRadius: 6, border: '1px solid #dcd9d5' }}>
      <div><label style={label}>Nom *</label><input style={inputStyle} value={value.name ?? ''} onChange={e => onChange((v: any) => ({ ...v, name: e.target.value }))} /></div>
      <div>
        <label style={label}>Catégorie</label>
        <select style={inputStyle} value={value.category ?? 'info'} onChange={e => onChange((v: any) => ({ ...v, category: e.target.value }))}>
          {Object.entries(CATEGORY_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
        </select>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ flex: 1 }}><label style={label}>Latitude *</label><input style={inputStyle} type="number" step="0.0000001" value={value.lat ?? ''} onChange={e => onChange((v: any) => ({ ...v, lat: Number(e.target.value) }))} /></div>
        <div style={{ flex: 1 }}><label style={label}>Longitude *</label><input style={inputStyle} type="number" step="0.0000001" value={value.lng ?? ''} onChange={e => onChange((v: any) => ({ ...v, lng: Number(e.target.value) }))} /></div>
      </div>
      <div><label style={label}>Description</label><input style={inputStyle} value={value.description ?? ''} onChange={e => onChange((v: any) => ({ ...v, description: e.target.value }))} /></div>
      <div><label style={label}>Adresse</label><input style={inputStyle} value={value.address ?? ''} onChange={e => onChange((v: any) => ({ ...v, address: e.target.value }))} /></div>
      <div><label style={label}>Lien Google Maps</label><input style={inputStyle} value={value.maps_url ?? ''} onChange={e => onChange((v: any) => ({ ...v, maps_url: e.target.value }))} /></div>
      <div style={{ display: 'flex', gap: 6 }}>
        <button style={btnPrimary} onClick={onSave} disabled={saving}>{saving ? 'Sauvegarde…' : '💾 Sauvegarder'}</button>
        <button style={{ ...btnPrimary, background: '#7a7974' }} onClick={onCancel}>Annuler</button>
      </div>
    </div>
  );
}
