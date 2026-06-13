'use client';
import { useEffect, useRef, useState } from 'react';

type Route = {
  id: string;
  name: string;
  color: string;
  difficulty?: string;
  duration_min?: number;
  distance_km?: number;
};
type POI = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  description?: string;
};
type MapData = {
  routes: Route[];
  pois: POI[];
  points: { route_id: string; lat: number; lng: number; seq: number }[];
};

const CATEGORY_EMOJI: Record<string, string> = {
  depart: '🟢', arrivee: '🔴', danger: '⚠️', info: 'ℹ️',
  parking: '🅿️', restaurant: '🍽️', baignade: '🏊', portage: '🎒',
  point_vue: '👁️', transport: '🚌', logement: '🏠', activite: '🎯',
};

const DIFFICULTY_COLORS: Record<string, string> = {
  famille: '#4CAF50', debutant: '#8BC34A', intermediaire: '#FF9800',
  sportif: '#f44336', libre: '#9E9E9E',
};

interface ArticleMapProps {
  slug: string;
}

export default function ArticleMap({ slug }: ArticleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<MapData | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/public/maps/${slug}`);
        if (!res.ok) throw new Error('Failed to load map data');
        const mapData = await res.json();
        setData(mapData);
      } catch (e) {
        console.error('ArticleMap fetch error:', e);
        setError('Impossible de charger la carte');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  useEffect(() => {
    if (!data || !mapRef.current || typeof window === 'undefined') return;

    const init = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css' as any);

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current!, {
        zoomControl: true,
        scrollWheelZoom: false,
      });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      const allLatLngs: [number, number][] = [];

      // Build points lookup
      const pointsByRoute: Record<string, [number, number][]> = {};
      for (const p of data.points ?? []) {
        if (!pointsByRoute[p.route_id]) pointsByRoute[p.route_id] = [];
        pointsByRoute[p.route_id].push([p.lat, p.lng]);
      }

      // Draw routes
      for (const route of data.routes ?? []) {
        const coords = pointsByRoute[route.id];
        if (!coords || coords.length < 2) continue;

        coords.forEach(c => allLatLngs.push(c));

        const difficultyColor = route.difficulty ? DIFFICULTY_COLORS[route.difficulty] : null;
        const routeColor = difficultyColor || route.color || '#01696f';

        L.polyline(coords, {
          color: routeColor,
          weight: 5,
          opacity: 0.85,
        }).bindPopup(`
          <div style="font-family: system-ui, sans-serif; min-width: 150px;">
            <strong style="font-size: 14px;">${route.name}</strong>
            ${route.difficulty ? `<br/><span style="color: ${routeColor}; font-size: 12px;">${route.difficulty}</span>` : ''}
            ${route.duration_min ? `<br/><span style="font-size: 12px; color: #666;">⏱️ ${route.duration_min} min</span>` : ''}
            ${route.distance_km ? `<br/><span style="font-size: 12px; color: #666;">📏 ${route.distance_km} km</span>` : ''}
          </div>
        `).addTo(map);

        // Start/end markers
        const startIcon = L.divIcon({
          html: `<div style="background:${routeColor};width:24px;height:24px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,.3)">🚩</div>`,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const endIcon = L.divIcon({
          html: `<div style="background:${routeColor};width:24px;height:24px;border-radius:50%;border:3px solid white;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,.3)">🏁</div>`,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });

        L.marker(coords[0], { icon: startIcon }).addTo(map);
        L.marker(coords[coords.length - 1], { icon: endIcon }).addTo(map);
      }

      // Draw POIs
      for (const poi of data.pois ?? []) {
        const emoji = CATEGORY_EMOJI[poi.category] ?? 'ℹ️';
        const icon = L.divIcon({
          html: `<div style="background:white;width:32px;height:32px;border-radius:50%;border:2px solid #01696f;display:flex;align-items:center;justify-content:center;font-size:16px;box-shadow:0 2px 6px rgba(0,0,0,.2)">${emoji}</div>`,
          className: '',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [0, -16],
        });

        L.marker([poi.lat, poi.lng], { icon })
          .bindPopup(`
            <div style="font-family: system-ui, sans-serif; min-width: 120px;">
              <strong>${poi.name}</strong>
              ${poi.description ? `<br/><span style="font-size: 12px; color: #666;">${poi.description}</span>` : ''}
            </div>
          `)
          .addTo(map);

        allLatLngs.push([poi.lat, poi.lng]);
      }

      if (allLatLngs.length > 0) {
        if (allLatLngs.length === 1) {
          map.setView(allLatLngs[0], 14);
        } else {
          map.fitBounds(allLatLngs, { padding: [40, 40] });
        }
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
  }, [data]);

  if (loading) {
    return (
      <div className="my-12 flex items-center justify-center rounded-2xl bg-stone-50 py-16" style={{ minHeight: 400 }}>
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-stone-200 border-t-amber-600" />
          <p className="text-stone-500">Chargement de la carte…</p>
        </div>
      </div>
    );
  }

  if (error || !data || (data.routes?.length === 0 && data.pois?.length === 0)) {
    return null;
  }

  return (
    <section className="my-12">
      <div className="mb-4">
        <h2 className="text-2xl font-serif font-light text-stone-900">🗺️ Carte du parcours</h2>
        {data.routes?.[0] && (
          <p className="mt-2 text-sm text-stone-500">
            {data.routes[0].name}
            {data.routes[0].duration_min && ` • ${data.routes[0].duration_min} min`}
            {data.routes[0].distance_km && ` • ${data.routes[0].distance_km} km`}
          </p>
        )}
      </div>
      <div
        ref={mapRef}
        className="w-full overflow-hidden rounded-2xl shadow-lg"
        style={{ height: 450 }}
      />
      {data.pois && data.pois.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {data.pois.map(poi => (
            <span
              key={poi.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-stone-100 px-3 py-1.5 text-xs text-stone-600"
            >
              {CATEGORY_EMOJI[poi.category] ?? '📍'} {poi.name}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}