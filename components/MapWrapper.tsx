'use client';

import dynamic from 'next/dynamic';
import type { DestinationMarker } from '@/lib/destinations-data';

// Dynamically import the map to avoid SSR issues with Leaflet
const DestinationMapComponent = dynamic(
  () => import('./DestinationMap'),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: '500px',
          width: '100%',
          borderRadius: '16px',
          backgroundColor: '#F8F6F2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6B2D1F',
          fontFamily: "'Playfair Display', serif",
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '3px solid #E5E2DC',
              borderTopColor: '#6B2D1F',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px',
            }}
          />
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p>Chargement de la carte...</p>
        </div>
      </div>
    ),
  }
);

interface MapWrapperProps {
  markers: DestinationMarker[];
  center?: [number, number];
  zoom?: number;
  height?: string;
}

/**
 * Wrapper component that safely imports Leaflet map
 * Compatible with Next.js App Router (SSR-safe)
 */
export default function MapWrapper(props: MapWrapperProps) {
  return <DestinationMapComponent {...props} />;
}