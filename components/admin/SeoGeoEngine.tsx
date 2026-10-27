'use client'

import React, { useState } from 'react'
import {
  MapPin,
  Globe,
  Compass,
  CheckCircle2,
  AlertCircle,
  Download,
  Copy,
  Check,
  TrendingUp,
  Search,
  Sparkles,
  Layers,
  ArrowRight,
    ShieldCheck,
    Link as LinkIcon,
} from 'lucide-react'

export interface GeoDestinationAudit {
  slug: string
  name: string
  country: string
  lat: number
  lng: number
  elevation: number
  hasSchemaJsonLd: boolean
  hasOsmMap: boolean
  hasItinerary: boolean
  hasCommercialOffer: boolean
  eeatScore: number
  keywords: string[]
  recommendedInterlinks: string[]
}

const DESTINATIONS_DATA: GeoDestinationAudit[] = [
  {
    slug: 'madere',
    name: 'Madère (Fajãs & Laurisylve)',
    country: 'Portugal',
    lat: 32.7607,
    lng: -16.9595,
    elevation: 1818,
    hasSchemaJsonLd: true,
    hasOsmMap: true,
    hasItinerary: true,
    hasCommercialOffer: true,
    eeatScore: 98,
    keywords: ['slow travel madère', 'fajãs isolées', 'randonnée levadas couple', 'achadas da cruz'],
    recommendedInterlinks: ['/guides/5-erreurs-voyage-couple', '/travel-planning'],
  },
  {
    slug: 'roumanie',
    name: 'Roumanie (Apuseni & Bucarest)',
    country: 'Roumanie',
    lat: 46.5167,
    lng: 22.8167,
    elevation: 1100,
    hasSchemaJsonLd: true,
    hasOsmMap: true,
    hasItinerary: true,
    hasCommercialOffer: true,
    eeatScore: 95,
    keywords: ['slow travel roumanie', 'parc naturel apuseni', 'bucarest secret 1900', 'villages bois maramures'],
    recommendedInterlinks: ['/destinations/roumanie/apuseni', '/travel-planning'],
  },
  {
    slug: 'suisse',
    name: 'Suisse (Stoos & Valais)',
    country: 'Suisse',
    lat: 46.9781,
    lng: 8.6653,
    elevation: 1305,
    hasSchemaJsonLd: true,
    hasOsmMap: true,
    hasItinerary: true,
    hasCommercialOffer: true,
    eeatScore: 96,
    keywords: ['slow travel suisse train', 'refuges sans moteur stoos', 'valais calme couple'],
    recommendedInterlinks: ['/travel-planning', '/expert-hotelier'],
  },
  {
    slug: 'alentejo',
    name: 'Alentejo (Plaines & Évora)',
    country: 'Portugal',
    lat: 38.5714,
    lng: -7.9135,
    elevation: 280,
    hasSchemaJsonLd: true,
    hasOsmMap: true,
    hasItinerary: true,
    hasCommercialOffer: true,
    eeatScore: 92,
    keywords: ['alentejo silence domaine', 'tourisme rural evora', 'vins terroir alentejo'],
    recommendedInterlinks: ['/destinations/portugal/lisbonne', '/travel-planning'],
  },
  {
    slug: 'normandie',
    name: 'Normandie (Pays d’Auge & Albâtre)',
    country: 'France',
    lat: 49.1829,
    lng: -0.3707,
    elevation: 60,
    hasSchemaJsonLd: true,
    hasOsmMap: true,
    hasItinerary: true,
    hasCommercialOffer: true,
    eeatScore: 94,
    keywords: ['normandie lente secret', 'manoirs pays d auge', 'cote albatre falaise sans voiture'],
    recommendedInterlinks: ['/guides/5-erreurs-voyage-couple', '/travel-planning'],
  },
]

export default function SeoGeoEngine() {
  const [selectedDest, setSelectedDest] = useState<GeoDestinationAudit>(DESTINATIONS_DATA[0])
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const generateGeoJson = (d: GeoDestinationAudit) => {
    const geojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [d.lng, d.lat, d.elevation],
          },
          properties: {
            name: d.name,
            country: d.country,
            url: `https://www.heldonica.fr/destinations/${d.slug}`,
            keywords: d.keywords,
            publisher: 'Heldonica • Slow Travel',
          },
        },
      ],
    }
    return JSON.stringify(geojson, null, 2)
  }

  const handleDownloadGeoJson = (d: GeoDestinationAudit) => {
    const data = generateGeoJson(d)
    const blob = new Blob([data], { type: 'application/geo+json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `heldonica-geo-${d.slug}.geojson`
    a.click()
    URL.revokeObjectURL(url)
  }

  const averageEeat = Math.round(
    DESTINATIONS_DATA.reduce((acc, d) => acc + d.eeatScore, 0) / DESTINATIONS_DATA.length
  )

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#241D1A] font-serif flex items-center gap-2">
            <Globe size={20} className="text-mahogany shrink-0" />
            <span>Moteur SEO &amp; Géo-Positionnement Sémantique</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Optimisation du ranking local, balises Schema.org TouristTrip/Breadcrumb, coordonnées OpenStreetMap et exports GeoJSON.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
              Indice Géo-Sémantique
            </span>
            <span className="text-xl font-serif font-bold text-emerald-700">
              {averageEeat}/100
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Vue en 2 colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Liste des destinations auditées (5 colonnes) */}
        <div className="lg:col-span-5 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block px-1">
            Territoires &amp; Piliers Géographiques
          </label>
          <div className="space-y-2">
            {DESTINATIONS_DATA.map((d) => (
              <button
                key={d.slug}
                type="button"
                onClick={() => setSelectedDest(d)}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between ${
                  selectedDest.slug === d.slug
                    ? 'border-eucalyptus bg-eucalyptus/5 shadow-2xs ring-1 ring-eucalyptus'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div>
                  <div className="text-sm font-semibold text-charcoal font-serif flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-eucalyptus" />
                    <span>{d.name}</span>
                  </div>
                  <div className="text-xs text-stone-500 mt-0.5">
                    {d.country} • {d.lat.toFixed(2)}°N, {d.lng.toFixed(2)}°E
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {d.eeatScore}%
                  </span>
                  <ArrowRight className="w-4 h-4 text-stone-400" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Détail d'audit et outils géo (7 colonnes) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs space-y-6">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  Fiche Géo-SEO Active
                </span>
                <h3 className="text-lg font-bold text-charcoal font-serif mt-0.5">
                  {selectedDest.name}
                </h3>
                <span className="text-xs text-stone-500 font-mono">
                  https://www.heldonica.fr/destinations/{selectedDest.slug}
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadGeoJson(selectedDest)}
                className="px-3 py-1.5 rounded-xl bg-eucalyptus hover:bg-eucalyptus/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export GeoJSON</span>
              </button>
            </div>

            {/* Checklist des signaux de confiance Google / SGE */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-3">
                Signaux Structurés &amp; Cocon E-E-A-T
              </label>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Schema.org TouristTrip</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Google BreadcrumbList</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Lien OpenStreetMap (0€)</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center gap-2 text-emerald-900 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Prix d&apos;Appel Commercial (Offer)</span>
                </div>
              </div>
            </div>

            {/* Balises HTML Geo Meta */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Balises Meta Géographiques (HTML Head)
                </label>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      'meta',
                      `<meta name="geo.position" content="${selectedDest.lat};${selectedDest.lng}" />\n<meta name="ICBM" content="${selectedDest.lat}, ${selectedDest.lng}" />\n<meta name="geo.placename" content="${selectedDest.name}" />`
                    )
                  }
                  className="text-xs text-eucalyptus hover:underline flex items-center gap-1 font-medium"
                >
                  {copiedKey === 'meta' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'meta' ? 'Copié !' : 'Copier balises'}</span>
                </button>
              </div>
              <div className="p-3 bg-stone-900 rounded-xl text-stone-200 text-xs font-mono overflow-x-auto">
                <div>&lt;meta name=&quot;geo.position&quot; content=&quot;{selectedDest.lat};{selectedDest.lng}&quot; /&gt;</div>
                <div>&lt;meta name=&quot;ICBM&quot; content=&quot;{selectedDest.lat}, {selectedDest.lng}&quot; /&gt;</div>
                <div>&lt;meta name=&quot;geo.placename&quot; content=&quot;{selectedDest.name}&quot; /&gt;</div>
              </div>
            </div>

            {/* Mots-clés cibles Slow Travel */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">
                Requêtes &amp; Intentions de Recherche Ciblées
              </label>
              <div className="flex flex-wrap gap-1.5">
                {selectedDest.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] border border-[#DED5C6] text-xs font-medium text-charcoal/80"
                  >
                    <Search size={11} className="inline shrink-0 mr-1" />{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Maillage interne recommandé */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block mb-2">
                Maillage Interne Recommandé (Cocon Sémantique)
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedDest.recommendedInterlinks.map((link) => (
                  <a
                    key={link}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-mono transition-colors"
                  >
                    <LinkIcon size={11} className="inline shrink-0 mr-1" />{link}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
