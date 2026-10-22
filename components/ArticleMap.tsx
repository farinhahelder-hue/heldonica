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

const CATEGORY_ICON: Record<string, string> = {
  depart: 'Circle', arrivee: 'Flag', danger: 'AlertTriangle', info: 'Info',
  parking: 'SquareParking', restaurant: 'UtensilsCrossed', baignade: 'Waves', portage: 'Backpack',
  point_vue: 'Eye', transport: 'Bus', logement: 'Home', activite: 'Target',
};

const CATEGORY_COLOR: Record<string, string> = {
  depart: '#4CAF50', arrivee: '#f44336', danger: '#f44336', info: '#1976d2',
  parking: '#1976d2', restaurant: '#FF9800', baignade: '#0288d1', portage: '#7B1FA2',
  point_vue: '#01696f', transport: '#1976d2', logement: '#4CAF50', activite: '#FF9800',
};

/**
 * Leaflet attend des chaînes HTML : impossible d'y insérer du JSX. Les tracés
 * ci-dessous sont ceux de `lucide-react@1.21.0` (charte : trait fin, strokeWidth 1.25).
 */
const ICON_PATHS: Record<string, string> = {
  Circle: '<circle cx="12" cy="12" r="10"></circle>',
  Flag: '<path d="M4 22V4a1 1 0 0 1 .4-.8A6 6 0 0 1 8 2c3 0 5 2 7.333 2q2 0 3.067-.8A1 1 0 0 1 20 4v10a1 1 0 0 1-.4.8A6 6 0 0 1 16 16c-3 0-5-2-8-2a6 6 0 0 0-4 1.528"></path>',
  AlertTriangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"></path><path d="M12 9v4"></path><path d="M12 17h.01"></path>',
  Info: '<circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path>',
  SquareParking: '<rect width="18" height="18" x="3" y="3" rx="2"></rect><path d="M9 17V7h4a3 3 0 0 1 0 6H9"></path>',
  UtensilsCrossed: '<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"></path><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"></path><path d="m2.1 21.8 6.4-6.3"></path><path d="m19 5-7 7"></path>',
  Waves: '<path d="M2 12q2.5 2 5 0t5 0 5 0 5 0"></path><path d="M2 19q2.5 2 5 0t5 0 5 0 5 0"></path><path d="M2 5q2.5 2 5 0t5 0 5 0 5 0"></path>',
  Backpack: '<path d="M4 10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"></path><path d="M8 10h8"></path><path d="M8 18h8"></path><path d="M8 22v-6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v6"></path><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"></path>',
  Eye: '<path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle>',
  Bus: '<path d="M8 6v6"></path><path d="M15 6v6"></path><path d="M2 12h19.6"></path><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"></path><circle cx="7" cy="18" r="2"></circle><path d="M9 18h5"></path><circle cx="16" cy="18" r="2"></circle>',
  Home: '<path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>',
  Target: '<circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle>',
  Clock: '<circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path>',
  Ruler: '<path d="M21.3 15.3a2.4 2.4 0 0 1 0 3.4l-2.6 2.6a2.4 2.4 0 0 1-3.4 0L2.7 8.7a2.41 2.41 0 0 1 0-3.4l2.6-2.6a2.41 2.41 0 0 1 3.4 0Z"></path><path d="m14.5 12.5 2-2"></path><path d="m11.5 9.5 2-2"></path><path d="m8.5 6.5 2-2"></path><path d="m17.5 15.5 2-2"></path>',
  MapPin: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path><circle cx="12" cy="10" r="3"></circle>',
  Map: '<path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-3.659 1.83A1 1 0 0 1 3 19.381V6.618a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0z"></path><path d="M15 5.764v15"></path><path d="M9 3.236v15"></path>',
};

/** Icône lucide en SVG inline, dimensionnable et alignable sur le texte. */
function iconSvg(name: string, size: number, color: string): string {
  const path = ICON_PATHS[name] ?? ICON_PATHS.Info;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-0.15em">${path}</svg>`;
}

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
              ${route.duration_min ? `<br/><span style="font-size:12px">${iconSvg('Clock', 13, '#666')} ${route.duration_min < 60 ? route.duration_min + ' min' : Math.floor(route.duration_min / 60) + 'h' + (route.duration_min % 60 ? (route.duration_min % 60) + '' : '')}</span>` : ''}
              ${route.distance_km ? `<br/><span style="font-size:12px">${iconSvg('Ruler', 13, '#666')} ${route.distance_km} km</span>` : ''}
              ${route.description ? `<br/><span style="font-size:12px;color:#555">${route.description}</span>` : ''}
            </div>
          `)
          .addTo(map);
      }

      for (const poi of pois) {
        const iconName = CATEGORY_ICON[poi.category] ?? 'Info';
        const color = CATEGORY_COLOR[poi.category] ?? '#1976d2';
        const icon = L.divIcon({
          html: `<div style="line-height:1;filter:drop-shadow(0 1px 2px rgba(0,0,0,0.3))">${iconSvg(iconName, 22, color)}</div>`,
          className: '',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        L.marker([poi.lat, poi.lng], { icon })
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:160px">
              <strong style="font-size:14px">${iconSvg(iconName, 14, color)} ${poi.name}</strong>
              ${poi.description ? `<br/><span style="font-size:12px;color:#555">${poi.description}</span>` : ''}
              ${poi.address ? `<br/><span style="font-size:11px;color:#888">${iconSvg('MapPin', 12, '#888')} ${poi.address}</span>` : ''}
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
          <span
            dangerouslySetInnerHTML={{ __html: iconSvg('Map', 12, '#01696f') }}
            style={{ marginRight: 4 }}
          />
          Carte &amp; Parcours
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
                  <span
                    style={{ lineHeight: 1, flexShrink: 0, marginTop: 1 }}
                    dangerouslySetInnerHTML={{
                      __html: iconSvg(
                        CATEGORY_ICON[poi.category] ?? 'Info',
                        18,
                        CATEGORY_COLOR[poi.category] ?? '#1976d2'
                      ),
                    }}
                  />
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
                      <p style={{ fontSize: 11, color: '#bab9b4', margin: '2px 0 0' }}><span dangerouslySetInnerHTML={{ __html: iconSvg('MapPin', 11, '#bab9b4') }} /> {poi.address}</p>
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
