'use client'

import { useEffect, useRef } from 'react'

export type MapStage = {
  id: string
  city: string
  country: string
  nights: number
  lat: number
  lng: number
  total: number
}

interface OrganizerMapProps {
  stages: MapStage[]
  height?: string
}

const MAHOGANY = '#6B2D1F'
const EUCALYPTUS = '#006D77'

export default function OrganizerMap({ stages, height = '340px' }: OrganizerMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current || stages.length === 0) return

    let map = mapRef.current

    async function init() {
      const L = await import('leaflet').then(m => m.default ?? m)

      // Patch icon paths (webpack)
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      if (!map) {
        map = L.map(containerRef.current!, { zoomControl: true, scrollWheelZoom: false })
        mapRef.current = map
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 18,
        }).addTo(map)
      } else {
        // Clear previous layers except tiles
        map.eachLayer((layer: any) => {
          if (!layer._url) map.removeLayer(layer)
        })
      }

      // Numbered markers
      stages.forEach((stage, i) => {
        const icon = L.divIcon({
          className: '',
          html: `<div style="
            width:32px; height:32px; border-radius:50%;
            background:${MAHOGANY}; color:white;
            display:flex; align-items:center; justify-content:center;
            font-size:13px; font-weight:700; font-family:sans-serif;
            border:2.5px solid white;
            box-shadow:0 2px 8px rgba(0,0,0,.25);
          ">${i + 1}</div>`,
          iconSize:   [32, 32],
          iconAnchor: [16, 16],
          popupAnchor:[0, -20],
        })

        const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR')
        L.marker([stage.lat, stage.lng], { icon })
          .bindPopup(`
            <div style="font-family:sans-serif; min-width:180px; line-height:1.4;">
              <p style="font-size:10px;text-transform:uppercase;letter-spacing:.12em;color:${EUCALYPTUS};font-weight:700;margin:0 0 4px 0;">${stage.country}</p>
              <h3 style="font-size:16px;color:${MAHOGANY};margin:0 0 6px 0;font-weight:700;">${stage.city}</h3>
              <p style="font-size:12px;color:#555;margin:0 0 8px 0;">${stage.nights} nuit${stage.nights > 1 ? 's' : ''} · <strong style="color:${MAHOGANY}">${fmt(stage.total)} €</strong></p>
            </div>
          `, { maxWidth: 240 })
          .addTo(map)
      })

      // Polyline connecting stages in order
      if (stages.length > 1) {
        const latlngs = stages.map(s => [s.lat, s.lng] as [number, number])
        L.polyline(latlngs, {
          color: EUCALYPTUS,
          weight: 2.5,
          opacity: 0.7,
          dashArray: '8 6',
        }).addTo(map)
      }

      // Fit bounds
      const bounds = L.latLngBounds(stages.map(s => [s.lat, s.lng] as [number, number]))
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 })
    }

    init()

    return () => {
      if (mapRef.current && stages.length === 0) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [stages])

  return (
    <div
      ref={containerRef}
      style={{ height, width: '100%', borderRadius: '12px', overflow: 'hidden' }}
    />
  )
}
