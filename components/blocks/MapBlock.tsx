'use client';

import React, { useEffect, useRef } from 'react';
import type { MapBlock as MapBlockType } from '@/types/cms-blocks';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapBlockProps {
  block: MapBlockType;
  className?: string;
}

export function MapBlock({ block, className = '' }: MapBlockProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    // Only run on client side and if container exists
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    // Fix for Leaflet marker icons in Next.js/Webpack
    const DefaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    if (!mapInstanceRef.current) {
      // Initialize map
      const { lat, lng } = block.center || { lat: 48.8566, lng: 2.3522 };
      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: false, // Better UX for scrolling pages
      }).setView([lat, lng], block.zoom || 13);
      
      mapInstanceRef.current = map;

      // Map tile style selection
      let tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'; // minimal by default
      let attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

      if (block.mapStyle === 'topo') {
        tileUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
        attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
      } else if (block.mapStyle === 'voyage') {
        tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}';
        attribution = 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012';
      }

      L.tileLayer(tileUrl, { attribution, maxZoom: 19 }).addTo(map);

      // Add markers
      if (block.markers && block.markers.length > 0) {
        block.markers.forEach(marker => {
          if (marker.lat && marker.lng) {
            const popupContent = `
              <div class="font-sans">
                <strong class="block mb-1 text-sm font-semibold">${marker.label}</strong>
                ${marker.description ? `<p class="text-xs text-stone-600 m-0">${marker.description}</p>` : ''}
              </div>
            `;
            L.marker([marker.lat, marker.lng]).addTo(map).bindPopup(popupContent);
          }
        });
      }
    }

    return () => {
      // Cleanup map instance on unmount
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [block.center, block.zoom, block.markers, block.mapStyle]);

  return (
    <figure className={`map-block w-full flex flex-col gap-3 ${className}`}>
      <div 
        ref={mapContainerRef} 
        className="w-full h-80 md:h-[400px] rounded-2xl overflow-hidden border border-stone-200 shadow-sm z-10"
        aria-label={block.caption || "Carte interactive"}
        role="region"
      />
      
      {/* Legend & Accessibility (Transcript) */}
      <figcaption className="text-center text-sm text-stone-500 italic mt-2">
        {block.caption}
      </figcaption>

      {/* Visually hidden text transcript of the markers for screen readers */}
      {block.markers && block.markers.length > 0 && (
        <div className="sr-only">
          <h3>Points d'intérêt sur la carte :</h3>
          <ul>
            {block.markers.map(marker => (
              <li key={marker.id}>
                <strong>{marker.label}</strong>: {marker.description || 'Aucune description'} (Latitude: {marker.lat}, Longitude: {marker.lng})
              </li>
            ))}
          </ul>
        </div>
      )}
    </figure>
  );
}

export default MapBlock;
