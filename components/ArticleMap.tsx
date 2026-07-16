'use client';
import { useEffect, useRef, useState } from 'react';

type RoutePoint = { lat: number; lng: number; seq: number };
type Route = {
  id: string;
  name: string;
  description?: string;
  color: string;
  difficulty?: string;
  duration_min?: number;
  distance_km?: number;
  points: RoutePoint[];
};
type POI = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description?: string;
  address?: string;
  maps_url?: string;
};

const CATEGORY_EMOJI: Record<string, string> = {
  depart: '🟢', arrivee: '🔴', danger: '⚠️', info: 'ℹ️',
  parking: '🅿️', restaurant: '🍽️', baignade: '🏊', portage: '🎒',
  point_vue: '👁️', transport: '🚌', logement: '🏠', activite: '🎯',
};

const CATEGORY_LABEL: Record<string, string> = {
  depart: 'Départ', arrivee: 'Arrivée', danger: 'Danger', info: 'Info',
  parking: 'Parking', restaurant: 'Restaurant', baignade: 'Baignade',
  portage: 'Portage', point_vue: 'Point de vue', transport: 'Transport',
  logement: 'Logement', activite: 'Activité',
};

const DIFFICULTY_CONFIG: Record<string, { label: string; color: string }> = {
  famille:       { label: 'Famille',      color: '#4CAF50' },
  debutant:      { label: 'Débutant',     color: '#1976d2' },
  intermediaire: { label: 'Intermédiaire',color: '#FF9800' },
  sportif:       { label: 'Sportif',      color: '#f44336' },
  libre:         { label: 'Libre',        color: '#7B1FA2' },
};

function DifficultyBadge({ difficulty }: { difficulty?: string }) {
  if (!difficulty) return null;
  const cfg = DIFFICULTY_CONFIG[difficulty];
  if (!cfg) return null;
  return (
    <span style={{
      display: 'inline-block',
      background: cfg.color + '22',
      color: cfg.color,
      border: `1px solid ${cfg.color}55`,
      borderRadius: '999px',
      padding: '2px 10px',
      fontSize: '11px',
      fontWeight: 600,
      letterSpacing: '0.04em',
    }}>
      {cfg.label}
    </span>
  );
}

function MapRenderer({ routes, pois }: { routes: Route[]; pois: POI[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;
    const init = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css' as any);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current!, { zoomControl: true, scrollWheelZoom: false });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const allLatLngs: [number, number][] = [];

      for (const route of routes) {
        if (route.points.length < 2) continue;
        const coords: [number, number][] = route.points
          .sort((a, b) => a.seq - b.seq)
          .map(p => [p.lat, p.lng]);
        coords.forEach(c => allLatLngs.push(c));
        L.polyline(coords, { color: route.color || '#01696f', weight: 5, opacity: 0.9 })
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:160px">
              <strong style="font-size:14px">${route.name}</strong>
              ${route.difficulty ? `<br/><span style="color:#666;font-size:12px">${DIFFICULTY_CONFIG[route.difficulty]?.label ?? route.difficulty}</span>` : ''}
              ${route.duration_min ? `<br/><span style="font-size:12px">⏱ ${route.duration_min < 60 ? route.duration_min + ' min' : Math.floor(route.duration_min / 60) + 'h' + (route.duration_min % 60 ? (route.duration_min % 60) + '' : '')}</span>` : ''}
              ${route.distance_km ? `<br/><span style="font-size:12px">📏 ${route.distance_km} km</span>` : ''}
              ${route.description ? `<br/><span style="font-size:12px;color:#555">${route.description}</span>` : ''}
            </div>
          `)
          .addTo(map);
      }

      for (const poi of pois) {
        const emoji = CATEGORY_EMOJI[poi.category] ?? 'ℹ️';
        const icon = L.divIcon({
          html: `<div style="font-size:22px;line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))">${emoji}</div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        L.marker([poi.lat, poi.lng], { icon })
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:160px">
              <strong style="font-size:14px">${emoji} ${poi.name}</strong>
              ${poi.description ? `<br/><span style="font-size:12px;color:#555">${poi.description}</span>` : ''}
              ${poi.address ? `<br/><span style="font-size:11px;color:#888">📍 ${poi.address}</span>` : ''}
              ${poi.maps_url ? `<br/><a href="${poi.maps_url}" target="_blank" rel="noopener noreferrer" style="font-size:11px;color:#01696f">Voir sur Maps →</a>` : ''}
            </div>
          `)
          .addTo(map);
        allLatLngs.push([poi.lat, poi.lng]);
      }

      if (allLatLngs.length > 0) {
        map.fitBounds(allLatLngs, { padding: [40, 40] });
      } else {
        map.setView([46.2276, 2.2137], 6);
      }
    };

    init();
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [routes, pois]);

  return (
    <div
      ref={mapRef}
      style={{ width: '100%', height: '100%', minHeight: 420, borderRadius: '1.25rem' }}
    />
  );
}

export default function ArticleMap({ slug }: { slug: string }) {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [pois, setPois] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRoute, setActiveRoute] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/cms/maps/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        setRoutes(data.routes ?? []);
        setPois(data.pois ?? []);
        if (data.routes?.length > 0) setActiveRoute(data.routes[0].id);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{
        background: '#f3f0ec',
        borderRadius: '1.5rem',
        height: 420,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#7a7974',
        fontSize: 14,
      }}>
        Chargement de la carte…
      </div>
    );
  }

  if (routes.length === 0 && pois.length === 0) return null;

  const activeRouteData = routes.find(r => r.id === activeRoute) ?? routes[0];

  // For map, filter POIs to active route (or show all if no route)
  const visiblePois = activeRoute
    ? pois.filter(p => (p as any).route_id === activeRoute || !(p as any).route_id)
    : pois;

  const visibleRoutes = activeRoute
    ? routes.filter(r => r.id === activeRoute)
    : routes;

  return (
    <section style={{ marginTop: '3rem', marginBottom: '3rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1rem' }}>
        <p style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: '#01696f',
          marginBottom: 4,
        }}>
          🗺️ Carte & Parcours
        </p>
        <h2 style={{
          fontSize: 22,
          fontWeight: 300,
          fontFamily: 'Georgia, serif',
          color: '#28251d',
          margin: 0,
        }}>
          Le tracé sur le terrain
        </h2>
      </div>

      {/* Route tabs (if multiple) */}
      {routes.length > 1 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {routes.map(route => (
            <button
              key={route.id}
              onClick={() => setActiveRoute(route.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '999px',
                border: `1.5px solid ${activeRoute === route.id ? route.color : '#dcd9d5'}`,
                background: activeRoute === route.id ? route.color + '18' : 'transparent',
                color: activeRoute === route.id ? route.color : '#7a7974',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                width: 10, height: 10,
                borderRadius: '50%',
                background: route.color,
                display: 'inline-block',
              }} />
              {route.name}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        {/* Map */}
        <div style={{
          borderRadius: '1.25rem',
          overflow: 'hidden',
          border: '1px solid #dcd9d5',
          height: 420,
          background: '#f3f0ec',
        }}>
          <MapRenderer routes={visibleRoutes} pois={visiblePois} />
        </div>

        {/* Route info card */}
        {activeRouteData && (
          <div style={{
            background: '#f9f8f5',
            borderRadius: '1.25rem',
            border: '1px solid #dcd9d5',
            padding: '1.25rem 1.5rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{
                    width: 12, height: 12,
                    borderRadius: '50%',
                    background: activeRouteData.color,
                    display: 'inline-block',
                    flexShrink: 0,
                  }} />
                  <strong style={{ fontSize: 16, color: '#28251d' }}>{activeRouteData.name}</strong>
                  <DifficultyBadge difficulty={activeRouteData.difficulty} />
                </div>
                {activeRouteData.description && (
                  <p style={{ fontSize: 14, color: '#7a7974', margin: '4px 0 0', lineHeight: 1.6 }}>
                    {activeRouteData.description}
                  </p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 16, flexShrink: 0 }}>
                {activeRouteData.duration_min != null && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#28251d' }}>
                      {activeRouteData.duration_min < 60
                        ? `${activeRouteData.duration_min}min`
                        : `${Math.floor(activeRouteData.duration_min / 60)}h${activeRouteData.duration_min % 60 ? (activeRouteData.duration_min % 60) : ''}`}
                    </div>
                    <div style={{ fontSize: 10, color: '#bab9b4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Durée</div>
                  </div>
                )}
                {activeRouteData.distance_km != null && (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#28251d' }}>{activeRouteData.distance_km} km</div>
                    <div style={{ fontSize: 10, color: '#bab9b4', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Distance</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* POIs list */}
        {visiblePois.length > 0 && (
          <div style={{
            background: '#f9f8f5',
            borderRadius: '1.25rem',
            border: '1px solid #dcd9d5',
            padding: '1.25rem 1.5rem',
          }}>
            <p style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#bab9b4',
              marginBottom: 10,
            }}>
              Points d&apos;intérêt
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {visiblePois.map(poi => (
                <div key={poi.id} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '8px 0',
                  borderBottom: '1px solid #edeae5',
                }}>
                  <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>
                    {CATEGORY_EMOJI[poi.category] ?? 'ℹ️'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 13, color: '#28251d' }}>{poi.name}</strong>
                      <span style={{ fontSize: 11, color: '#bab9b4' }}>
                        {CATEGORY_LABEL[poi.category] ?? poi.category}
                      </span>
                    </div>
                    {poi.description && (
                      <p style={{ fontSize: 12, color: '#7a7974', margin: '2px 0 0', lineHeight: 1.5 }}>
                        {poi.description}
                      </p>
                    )}
                    {poi.address && (
                      <p style={{ fontSize: 11, color: '#bab9b4', margin: '2px 0 0' }}>📍 {poi.address}</p>
                    )}
                  </div>
                  {poi.maps_url && (
                    <a
                      href={poi.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 11,
                        color: '#01696f',
                        fontWeight: 600,
                        textDecoration: 'none',
                        flexShrink: 0,
                        padding: '3px 8px',
                        border: '1px solid #cedcd8',
                        borderRadius: 999,
                      }}
                    >
                      Maps →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
