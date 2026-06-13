'use client';
import { useEffect, useRef } from 'react';

type Route = {
  id: string; name: string; color: string;
  points: { lat: number; lng: number; seq: number }[];
};
type POI = {
  id: string; name: string; category: string;
  lat: number; lng: number; description?: string;
};

const CATEGORY_EMOJI: Record<string, string> = {
  depart: '🟢', arrivee: '🔴', danger: '⚠️', info: 'ℹ️',
  parking: '🅿️', restaurant: '🍽️', baignade: '🏊', portage: '🎒',
  point_vue: '👁️', transport: '🚌', logement: '🏠', activite: '🎯',
};

export default function MapPreview({ routes, pois, centerSlug }: {
  routes: Route[];
  pois: POI[];
  centerSlug?: string;
}) {
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

      const map = L.map(mapRef.current!, { zoomControl: true });
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap',
        maxZoom: 18,
      }).addTo(map);

      const allLatLngs: [number, number][] = [];

      // Draw routes
      for (const route of routes) {
        if (route.points.length < 2) continue;
        const coords: [number, number][] = route.points
          .sort((a, b) => a.seq - b.seq)
          .map(p => [p.lat, p.lng]);
        coords.forEach(c => allLatLngs.push(c));
        L.polyline(coords, { color: route.color || '#01696f', weight: 4, opacity: 0.85 })
          .bindPopup(`<b>${route.name}</b>`)
          .addTo(map);
      }

      // Draw POIs
      for (const poi of pois) {
        const emoji = CATEGORY_EMOJI[poi.category] ?? 'ℹ️';
        const icon = L.divIcon({
          html: `<div style="font-size:20px;line-height:1">${emoji}</div>`,
          className: '',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        });
        const marker = L.marker([poi.lat, poi.lng], { icon });
        marker.bindPopup(`<b>${poi.name}</b>${poi.description ? `<br/>${poi.description}` : ''}`);
        marker.addTo(map);
        allLatLngs.push([poi.lat, poi.lng]);
      }

      if (allLatLngs.length > 0) {
        map.fitBounds(allLatLngs, { padding: [32, 32] });
      } else {
        map.setView([46.2276, 2.2137], 6); // France center
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

  return <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: 400, borderRadius: 8 }} />;
}
