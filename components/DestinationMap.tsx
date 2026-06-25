'use client';

import { useEffect } from 'react';
import type { DestinationMarker } from '@/lib/destinations-data';

interface DestinationMapProps {
  markers: DestinationMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

export default function DestinationMap({
  markers,
  center = [46.8, 2],
  zoom = 5,
  height = '500px',
}: DestinationMapProps) {
  useEffect(() => {
    const initMap = async () => {
      // Load Leaflet first, then markercluster (order matters — markercluster extends L)
      const L = await import('leaflet').then(m => m.default ?? m);
      await import('leaflet.markercluster');

      // Fix default marker icon paths for webpack
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      const mapContainer = document.getElementById('heldonica-map');
      if (!mapContainer || mapContainer.querySelector('.leaflet-container')) return;

      const map = L.map('heldonica-map').setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      const heldonicaIcon = L.divIcon({
        className: 'heldonica-marker',
        html: `
          <div style="
            background: #6B2D1F;
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <span style="transform: rotate(45deg); color: white; font-size: 14px; font-weight: bold;"></span>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const markerClusterGroup = (L as any).markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 50,
        spiderfyOnMaxZoom: true,
        disableClusteringAtZoom: 15,
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          const size = count > 15 ? 'large' : count > 5 ? 'medium' : 'small';
          return (L as any).divIcon({
            html: `<div class="cluster-icon cluster-${size}"><span>${count}</span></div>`,
            className: `marker-cluster marker-cluster-${size}`,
            iconSize: (L as any).point(40, 40),
          });
        },
      });

      markers.forEach((marker) => {
        const mapMarker = L.marker([marker.latitude, marker.longitude], { icon: heldonicaIcon });
        mapMarker.bindPopup(`
          <div style="font-family: 'Playfair Display', serif; min-width: 220px;">
            <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.14em; color: #006D77; font-weight: 600; margin-bottom: 4px;">${marker.country}</p>
            <h3 style="font-size: 18px; color: #6B2D1F; margin: 0 0 8px 0; font-weight: 700;">${marker.title}</h3>
            <p style="font-size: 13px; color: #2C2C2C; margin: 0 0 12px 0; line-height: 1.5;">${marker.excerpt}</p>
            <a href="${marker.url}" style="display: inline-block; background: #6B2D1F; color: white; padding: 8px 16px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: 600;">
              Voir la destination →
            </a>
          </div>
        `, { maxWidth: 300, className: 'heldonica-popup' });
        markerClusterGroup.addLayer(mapMarker);
      });

      map.addLayer(markerClusterGroup);

      if (markers.length > 1) {
        map.fitBounds(markerClusterGroup.getBounds(), { padding: [50, 50] });
      }
    };

    initMap();

    return () => {
      const mapContainer = document.getElementById('heldonica-map');
      if (mapContainer) mapContainer.innerHTML = '';
    };
  }, [markers, center, zoom]);

  return (
    <div
      id="heldonica-map"
      style={{
        height,
        width: '100%',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}
    />
  );
}
