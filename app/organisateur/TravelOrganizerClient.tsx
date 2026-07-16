'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import InlineEditProvider from '@/components/inline-edit/InlineEditProvider'
import EditableZone from '@/components/inline-edit/EditableZone'
import type { MapStage } from './OrganizerMap'

// ── Chargement SSR-safe de la carte ──────────────────────────────────────────
const OrganizerMap = dynamic(() => import('./OrganizerMap'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center bg-stone-100 rounded-xl text-charcoal/40 text-sm" style={{ height: 340 }}>
      Chargement de la carte…
    </div>
  ),
})

// ── Analytics ─────────────────────────────────────────────────────────────────
function trackEvent(action: string, params: object = {}) {
  if (typeof window !== 'undefined' && (window as any).gtag)
    (window as any).gtag('event', action, params)
}

// ── Types ─────────────────────────────────────────────────────────────────────
type TripStep = {
  id: string
  city: string
  country: string
  nights: number
  accommodation: number
  transport: number
  food: number
  activities: number
}

type ChecklistItem = {
  id: string
  text: string
  checked: boolean
  category: string
}

type Coords = { lat: number; lng: number } | null

// ── Prix par destination (€, par nuit ou par étape pour le groupe) ─────────────
//   accommodation = €/nuit · transport = €/étape (flat) · food & activities = €/jour
type PriceProfile = {
  label: string
  flag: string
  accommodationPerNight: number
  transportPerStage: number
  foodPerDay: number
  activitiesPerDay: number
  tip: string
}

const PRICE_PROFILES: { keys: string[]; profile: PriceProfile }[] = [
  {
    keys: ['madère', 'madere', 'madeira', 'funchal'],
    profile: { label: 'Madère', flag: '🇵🇹', accommodationPerNight: 95, transportPerStage: 30, foodPerDay: 42, activitiesPerDay: 28, tip: 'Transport inter-villes peu cher en bus public (1-2 €). Les levadas accessibles gratuitement.' },
  },
  {
    keys: ['portugal', 'lisbonne', 'lisbon', 'porto', 'alentejo', 'algarve', 'sintra'],
    profile: { label: 'Portugal', flag: '🇵🇹', accommodationPerNight: 90, transportPerStage: 35, foodPerDay: 40, activitiesPerDay: 25, tip: 'Budget slow travel accessible. Pastel de nata et vinho verde restent bon marché.' },
  },
  {
    keys: ['france', 'paris', 'normandie', 'lyon', 'bordeaux', 'provence', 'bretagne', 'fontainebleau', 'versailles', 'giverny'],
    profile: { label: 'France', flag: '🇫🇷', accommodationPerNight: 115, transportPerStage: 55, foodPerDay: 55, activitiesPerDay: 35, tip: 'Musées nationaux gratuits 1er dimanche du mois. Marchés locaux pour réduire le budget repas.' },
  },
  {
    keys: ['sicile', 'sicilia', 'sicily', 'palerme', 'catane', 'taormine', 'agrigente'],
    profile: { label: 'Sicile', flag: '🇮🇹', accommodationPerNight: 85, transportPerStage: 35, foodPerDay: 42, activitiesPerDay: 22, tip: 'Granita sicilienne 2-3 €. Arancini et panelle pour manger local à petit prix.' },
  },
  {
    keys: ['sardaigne', 'sardinia', 'cagliari', 'alghero', 'nuoro'],
    profile: { label: 'Sardaigne', flag: '🇮🇹', accommodationPerNight: 100, transportPerStage: 40, foodPerDay: 44, activitiesPerDay: 25, tip: 'Louer un scooter (30-40€/j) est la clé pour accéder aux plages hors des circuits.' },
  },
  {
    keys: ['italie', 'italy', 'rome', 'roma', 'florence', 'firenze', 'venise', 'venezia', 'milan', 'naples', 'napoli', 'toscane', 'tuscany'],
    profile: { label: 'Italie', flag: '🇮🇹', accommodationPerNight: 110, transportPerStage: 50, foodPerDay: 48, activitiesPerDay: 30, tip: 'Aperitivo "spritz" souvent inclus avec la boisson (3-5 €). Éviter les restaurants face aux monuments.' },
  },
  {
    keys: ['espagne', 'spain', 'barcelone', 'barcelona', 'madrid', 'séville', 'sevilla', 'valence', 'grenade', 'granada', 'malaga'],
    profile: { label: 'Espagne', flag: '🇪🇸', accommodationPerNight: 95, transportPerStage: 45, foodPerDay: 45, activitiesPerDay: 28, tip: 'Menu del día (12-15€) = entrée + plat + dessert + boisson. La vraie vie locale.' },
  },
  {
    keys: ['grèce', 'greece', 'grece', 'athènes', 'athens', 'santorin', 'santorini', 'mykonos', 'crète', 'crete', 'rhodes'],
    profile: { label: 'Grèce', flag: '🇬🇷', accommodationPerNight: 85, transportPerStage: 40, foodPerDay: 40, activitiesPerDay: 25, tip: 'Sites archéologiques les plus beaux souvent gratuits. Tavernes locales vs restaurants touristiques : moitié prix.' },
  },
  {
    keys: ['monténégro', 'montenegro', 'kotor', 'budva', 'tivat', 'podgorica'],
    profile: { label: 'Monténégro', flag: '🇲🇪', accommodationPerNight: 68, transportPerStage: 28, foodPerDay: 32, activitiesPerDay: 18, tip: 'L\'un des pays les moins chers des Balkans. Forteresses et parcs nationaux à 2-5 €.' },
  },
  {
    keys: ['roumanie', 'romania', 'bucarest', 'bucharest', 'transylvanie', 'transylvania', 'cluj', 'brasov', 'sibiu', 'timisoara'],
    profile: { label: 'Roumanie', flag: '🇷🇴', accommodationPerNight: 55, transportPerStage: 22, foodPerDay: 28, activitiesPerDay: 18, tip: 'Budget slow travel parmi les plus bas d\'Europe. Fortresses saxonnes et châteaux quasi gratuits.' },
  },
  {
    keys: ['colombie', 'colombia', 'bogota', 'medellín', 'medellin', 'carthagène', 'cartagena', 'cali', 'cartago'],
    profile: { label: 'Colombie', flag: '🇨🇴', accommodationPerNight: 55, transportPerStage: 22, foodPerDay: 18, activitiesPerDay: 22, tip: 'Menus corriente (repas du jour) à 3-5 €. Cafés de spécialité à 1-2 €. Taxis app recommandés.' },
  },
  {
    keys: ['suisse', 'switzerland', 'zurich', 'genève', 'geneva', 'berne', 'bern', 'lausanne', 'bâle', 'basel', 'interlaken', 'stoos'],
    profile: { label: 'Suisse', flag: '🇨🇭', accommodationPerNight: 175, transportPerStage: 70, foodPerDay: 72, activitiesPerDay: 55, tip: 'Swiss Travel Pass pour transports illimités (dès 200 CHF). Coop et Migros pour pique-niques économiques.' },
  },
  {
    keys: ['maroc', 'morocco', 'marrakech', 'marrakesh', 'fès', 'fez', 'casablanca', 'essaouira', 'agadir'],
    profile: { label: 'Maroc', flag: '🇲🇦', accommodationPerNight: 65, transportPerStage: 22, foodPerDay: 22, activitiesPerDay: 18, tip: 'Riads en médina offrent bien meilleur rapport qualité/prix que les hôtels modernes.' },
  },
  {
    keys: ['allemagne', 'germany', 'berlin', 'munich', 'hambourg', 'hamburg', 'cologne', 'frankfurt', 'heidelberg'],
    profile: { label: 'Allemagne', flag: '🇩🇪', accommodationPerNight: 100, transportPerStage: 55, foodPerDay: 48, activitiesPerDay: 28, tip: 'Nombreux musées gratuits ou à tarif réduit. Marchés de noël et biergartens pour l\'ambiance locale.' },
  },
  {
    keys: ['malte', 'malta', 'valletta', 'valette', 'gozo'],
    profile: { label: 'Malte', flag: '🇲🇹', accommodationPerNight: 88, transportPerStage: 18, foodPerDay: 38, activitiesPerDay: 22, tip: 'Bus public très développé (1.50€ le trajet). Ftajjar (sandwich maltais) à 2-3 € pour le déj.' },
  },
]

function matchPriceProfile(city: string, country: string): PriceProfile | null {
  const needle = `${city} ${country}`.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  for (const { keys, profile } of PRICE_PROFILES) {
    if (keys.some(k => needle.includes(k.normalize('NFD').replace(/[̀-ͯ]/g, '')))) return profile
  }
  return null
}

// ── Checklist templates ───────────────────────────────────────────────────────
const CHECKLIST_TEMPLATES: Record<string, { text: string; category: string }[]> = {
  default: [
    { text: 'Passeport / CNI valide', category: 'documents' },
    { text: 'Billets avion/train', category: 'documents' },
    { text: 'Réservation hébergement', category: 'réservations' },
    { text: 'Assurance voyage', category: 'santé' },
    { text: 'Médicaments', category: 'santé' },
    { text: 'Vêtements adaptés', category: 'équipement' },
    { text: 'Chargeurs appareils', category: 'équipement' },
    { text: 'Appareil photo', category: 'équipement' },
    { text: 'Argent liquide', category: 'divers' },
    { text: 'Cartes bancaires', category: 'divers' },
  ],
  citybreak: [
    { text: 'Passeport / CNI', category: 'documents' },
    { text: 'Billets', category: 'documents' },
    { text: 'Réservation hôtel', category: 'réservations' },
    { text: 'Plan du quartier', category: 'divers' },
    { text: 'Tenues légères', category: 'équipement' },
    { text: 'Chaussures marche', category: 'équipement' },
    { text: 'Appareil photo', category: 'équipement' },
  ],
  randonnee: [
    { text: 'Validité passeport', category: 'documents' },
    { text: 'Assurance montagne', category: 'santé' },
    { text: 'Chaussures rando', category: 'équipement' },
    { text: 'Sac à dos', category: 'équipement' },
    { text: 'Vêtements pluie', category: 'équipement' },
    { text: 'Trousse premiers secours', category: 'santé' },
    { text: 'Bouteille eau', category: 'équipement' },
    { text: 'Carte IGN', category: 'équipement' },
  ],
  roadtrip: [
    { text: 'Permis conduire', category: 'documents' },
    { text: 'Location véhicule', category: 'réservations' },
    { text: 'Assurance RC', category: 'santé' },
    { text: 'Carte grise', category: 'documents' },
    { text: 'Trousse secours', category: 'santé' },
    { text: 'Kit dépannage', category: 'équipement' },
    { text: 'GPS offline', category: 'équipement' },
    { text: 'Snacks route', category: 'divers' },
  ],
}

const TRIP_TYPES = [
  { value: 'citybreak', label: 'City break', emoji: '🏙️' },
  { value: 'randonnee', label: 'Randonnée', emoji: '🏔️' },
  { value: 'roadtrip', label: 'Road trip', emoji: '🚗' },
]

const CHECKLIST_CATEGORIES = ['documents', 'réservations', 'santé', 'équipement', 'divers'] as const

const BUDGET_FIELDS: { key: keyof TripStep; label: string; color: string }[] = [
  { key: 'accommodation', label: 'Hébergement', color: '#006D77' },
  { key: 'transport',     label: 'Transport',   color: '#4ECDC4' },
  { key: 'food',          label: 'Restauration', color: '#6B2D1F' },
  { key: 'activities',    label: 'Activités',   color: '#A8C5A0' },
]

const fmt = (n: number) => Math.round(n).toLocaleString('fr-FR')
const stageTotal = (s: TripStep) => s.accommodation + s.transport + s.food + s.activities

// ── Composant principal ───────────────────────────────────────────────────────
export default function TravelOrganizerClient() {
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate]     = useState('')
  const [endDate, setEndDate]         = useState('')
  const [travelers, setTravelers]     = useState(2)
  const [tripType, setTripType]       = useState('citybreak')
  const [stages, setStages]           = useState<TripStep[]>([
    { id: '1', city: '', country: '', nights: 3, accommodation: 150, transport: 100, food: 80, activities: 50 },
  ])
  const [stageCoords, setStageCoords] = useState<Record<string, Coords>>({})
  const [geocodingIds, setGeocodingIds] = useState<Set<string>>(new Set())
  const [checklist, setChecklist]     = useState<ChecklistItem[]>([])
  const [cmsTemplates, setCmsTemplates] = useState(CHECKLIST_TEMPLATES)
  const [hasSaved, setHasSaved]       = useState(false)
  const [newItemText, setNewItemText] = useState('')
  const [newItemCat, setNewItemCat]   = useState<typeof CHECKLIST_CATEGORIES[number]>('divers')
  const [appliedSuggestion, setAppliedSuggestion] = useState<Record<string, boolean>>({})
  const geocodeTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  // Derived
  const totalNights   = stages.reduce((s, e) => s + e.nights, 0)
  const totalBudget   = stages.reduce((s, e) => s + stageTotal(e), 0)
  const costPerPerson = travelers > 0 ? totalBudget / travelers : 0
  const costPerDay    = totalNights > 0 ? totalBudget / totalNights : 0
  const checkedItems  = checklist.filter(i => i.checked).length
  const progress      = checklist.length > 0 ? Math.round((checkedItems / checklist.length) * 100) : 0
  const catTotals     = BUDGET_FIELDS.map(f => ({ ...f, total: stages.reduce((s, e) => s + (e[f.key] as number), 0) }))

  // Map stages (only geocoded ones)
  const mapStages: MapStage[] = stages
    .filter(s => stageCoords[s.id])
    .map(s => ({ ...s, lat: stageCoords[s.id]!.lat, lng: stageCoords[s.id]!.lng, total: stageTotal(s) }))

  // ── Persistence ─────────────────────────────────────────────────────────────
  useEffect(() => { setHasSaved(!!localStorage.getItem('organizer_trip')) }, [])

  useEffect(() => {
    const saved = localStorage.getItem('organizer_trip')
    if (!saved) return
    try {
      const d = JSON.parse(saved)
      setDestination(d.destination || '')
      setStartDate(d.startDate || '')
      setEndDate(d.endDate || '')
      setTravelers(d.travelers || 2)
      setTripType(d.tripType || 'citybreak')
      setStages(d.stages || [{ id: '1', city: '', country: '', nights: 3, accommodation: 150, transport: 100, food: 80, activities: 50 }])
      if (d.checklist) setChecklist(d.checklist)
      if (d.stageCoords) setStageCoords(d.stageCoords)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    localStorage.setItem('organizer_trip', JSON.stringify({ destination, startDate, endDate, travelers, tripType, stages, checklist, stageCoords }))
    setHasSaved(true)
  }, [destination, startDate, endDate, travelers, tripType, stages, checklist, stageCoords])

  // ── Checklist CMS fetch ──────────────────────────────────────────────────────
  useEffect(() => {
    fetch('/api/cms/checklist-templates')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data?.templates) return
        const tpls: Record<string, { text: string; category: string }[]> = {}
        data.templates.forEach((t: any) => {
          if (t.template_key && t.items) tpls[t.template_key] = typeof t.items === 'string' ? JSON.parse(t.items) : t.items
        })
        if (Object.keys(tpls).length > 0) setCmsTemplates(tpls)
      })
      .catch(() => {})
  }, [])

  const template = cmsTemplates[tripType] || cmsTemplates.default
  useEffect(() => {
    if (!localStorage.getItem('organizer_trip')) {
      setChecklist(template.map((item, i) => ({ id: String(i), text: item.text, checked: false, category: item.category })))
    }
  }, [tripType, template])

  // ── Geocoding (debounced, 1.2s after last keystroke) ────────────────────────
  const geocodeStage = useCallback((id: string, city: string, country: string) => {
    if (geocodeTimers.current[id]) clearTimeout(geocodeTimers.current[id])
    const q = [city.trim(), country.trim()].filter(Boolean).join(', ')
    if (!q || q.length < 2) return

    geocodeTimers.current[id] = setTimeout(async () => {
      setGeocodingIds(prev => new Set([...prev, id]))
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setStageCoords(prev => ({ ...prev, [id]: data ? { lat: data.lat, lng: data.lng } : null }))
      } catch {
        setStageCoords(prev => ({ ...prev, [id]: null }))
      } finally {
        setGeocodingIds(prev => { const s = new Set(prev); s.delete(id); return s })
      }
    }, 1200)
  }, [])

  // ── Stage helpers ─────────────────────────────────────────────────────────────
  const addStage = () => {
    setStages(prev => [...prev, { id: Date.now().toString(), city: '', country: '', nights: 3, accommodation: 150, transport: 100, food: 80, activities: 50 }])
  }

  const updateStage = (id: string, field: keyof TripStep, value: unknown) => {
    setStages(prev => prev.map(s => {
      if (s.id !== id) return s
      const next = { ...s, [field]: value }
      if (field === 'city' || field === 'country') {
        const city    = field === 'city'    ? String(value) : s.city
        const country = field === 'country' ? String(value) : s.country
        geocodeStage(id, city, country)
      }
      return next
    }))
  }

  const removeStage = (id: string) => {
    if (stages.length > 1) {
      setStages(prev => prev.filter(s => s.id !== id))
      setStageCoords(prev => { const next = { ...prev }; delete next[id]; return next })
    }
  }

  const applySuggestion = (stage: TripStep, profile: PriceProfile) => {
    setStages(prev => prev.map(s => s.id !== stage.id ? s : {
      ...s,
      accommodation: Math.round(profile.accommodationPerNight * s.nights),
      transport:     profile.transportPerStage,
      food:          Math.round(profile.foodPerDay * s.nights),
      activities:    Math.round(profile.activitiesPerDay * s.nights),
    }))
    setAppliedSuggestion(prev => ({ ...prev, [stage.id]: true }))
    setTimeout(() => setAppliedSuggestion(prev => { const n = { ...prev }; delete n[stage.id]; return n }), 2000)
  }

  // ── Checklist helpers ─────────────────────────────────────────────────────────
  const toggleChecklist = (id: string) => setChecklist(prev => prev.map(i => i.id === id ? { ...i, checked: !i.checked } : i))

  const addChecklistItem = () => {
    const text = newItemText.trim()
    if (!text) return
    setChecklist(prev => [...prev, { id: Date.now().toString(), text, checked: false, category: newItemCat }])
    setNewItemText('')
  }

  const clearSaved = () => { localStorage.removeItem('organizer_trip'); setHasSaved(false); window.location.reload() }

  const exportPlan = () => {
    const content = `VOYAGE À ${destination.toUpperCase()}
Dates : ${startDate} → ${endDate}    Voyageurs : ${travelers}

ITINÉRAIRE
${stages.map((s, i) =>
  `${i + 1}. ${s.city}${s.country ? ` (${s.country})` : ''} — ${s.nights} nuit${s.nights > 1 ? 's' : ''}
   Hébergement : ${s.accommodation} € · Transport : ${s.transport} € · Restauration : ${s.food} € · Activités : ${s.activities} €
   Sous-total : ${stageTotal(s)} €`
).join('\n')}

BUDGET : ${fmt(totalBudget)} € total · ${fmt(costPerPerson)} €/pers · ${fmt(costPerDay)} €/jour

CHECKLIST
${checklist.map(i => `[${i.checked ? 'x' : ' '}] ${i.text}`).join('\n')}

Généré avec Heldonica — heldonica.fr`
    const blob = new Blob([content], { type: 'text/plain' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href: url, download: `voyage-${(destination || 'heldonica').replace(/\s+/g, '-').toLowerCase()}.txt` })
    a.click()
    URL.revokeObjectURL(url)
    trackEvent('export_plan', { destination })
  }

  // ── CSS helpers ─────────────────────────────────────────────────────────────
  const inputClass   = 'w-full px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm text-charcoal placeholder-stone-400 focus:outline-none focus:border-eucalyptus focus:bg-white transition-colors'
  const sectionClass = 'bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-stone-100 mb-6'
  const headClass    = 'text-xs font-bold tracking-[0.2em] uppercase text-eucalyptus mb-5'

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <InlineEditProvider page="organisateur">
      <div className="min-h-screen bg-cloud-dancer" id="organizer-content">
        <style>{`@media print { body { background: white; } #organizer-content { background: white !important; } button, a[href], nav, footer { display: none !important; } }`}</style>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 md:py-16">

          {/* ── En-tête ───────────────────────────────────────────────────── */}
          <div className="text-center mb-10">
            {hasSaved && (
              <div className="inline-flex items-center gap-2 text-xs text-eucalyptus bg-eucalyptus/10 border border-eucalyptus/20 rounded-full px-4 py-1.5 mb-5">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                <span>Voyage sauvegardé localement</span>
                <button onClick={clearSaved} className="underline hover:no-underline">Effacer</button>
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-serif font-light text-mahogany mb-3">
              <EditableZone page="organisateur" zone="hero_title" fallback="Organisateur de voyage" />
            </h1>
            <p className="text-charcoal/55 text-lg">
              <EditableZone page="organisateur" zone="hero_subtitle" fallback="Planifie ton trip, gère ton budget" />
            </p>
          </div>

          {/* ── Ton voyage ────────────────────────────────────────────────── */}
          <section className={sectionClass}>
            <h2 className={headClass}>Ton voyage</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs text-charcoal/50 mb-1.5 font-medium">Destination principale</label>
                <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="Portugal, Toscane…" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-charcoal/50 mb-1.5 font-medium">Type de voyage</label>
                <select value={tripType} onChange={e => setTripType(e.target.value)} className={inputClass}>
                  {TRIP_TYPES.map(t => <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>)}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-charcoal/50 mb-1.5 font-medium">Voyageurs</label>
                <input type="number" value={travelers} onChange={e => setTravelers(Math.max(1, Number(e.target.value)))} min={1} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs text-charcoal/50 mb-1.5 font-medium">Dates</label>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="block text-[10px] text-charcoal/35 mb-1">Départ</span>
                    <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-charcoal/35 mb-1">Retour</span>
                    <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Itinéraire ────────────────────────────────────────────────── */}
          <section className={sectionClass}>
            <div className="flex items-center justify-between mb-5">
              <h2 className={headClass + ' mb-0'}>Itinéraire</h2>
              <span className="text-charcoal/40 text-sm">{totalNights} nuit{totalNights > 1 ? 's' : ''} · {stages.length} étape{stages.length > 1 ? 's' : ''}</span>
            </div>

            <div className="space-y-5">
              {stages.map((stage, i) => {
                const total   = stageTotal(stage)
                const profile = matchPriceProfile(stage.city, stage.country)
                const isGeocoding = geocodingIds.has(stage.id)
                const hasCoords   = !!stageCoords[stage.id]
                const applied     = !!appliedSuggestion[stage.id]

                return (
                  <div key={stage.id} className="bg-stone-50 border border-stone-100 rounded-xl overflow-hidden">
                    {/* ── Ligne titre ── */}
                    <div className="flex items-center gap-3 p-4 pb-0">
                      <span className="w-7 h-7 rounded-full bg-mahogany text-white text-xs font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <input
                        value={stage.city}
                        onChange={e => updateStage(stage.id, 'city', e.target.value)}
                        placeholder="Ville"
                        className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-eucalyptus transition-colors"
                      />
                      <input
                        value={stage.country}
                        onChange={e => updateStage(stage.id, 'country', e.target.value)}
                        placeholder="Pays"
                        className="w-24 px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-eucalyptus transition-colors"
                      />
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={stage.nights}
                          onChange={e => updateStage(stage.id, 'nights', Math.max(1, Number(e.target.value)))}
                          min={1}
                          className="w-14 px-2 py-2 bg-white border border-stone-200 rounded-lg text-sm text-center focus:outline-none focus:border-eucalyptus transition-colors"
                        />
                        <span className="text-xs text-charcoal/40">nuit{stage.nights > 1 ? 's' : ''}</span>
                      </div>
                      {/* Geocoding indicator */}
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors ${isGeocoding ? 'bg-stone-300 animate-pulse' : hasCoords ? 'bg-eucalyptus' : 'bg-stone-200'}`} title={hasCoords ? 'Localisé sur la carte' : isGeocoding ? 'Localisation…' : 'Non localisé'} />
                      {stages.length > 1 && (
                        <button onClick={() => removeStage(stage.id)} className="text-stone-400 hover:text-mahogany transition-colors p-1 flex-shrink-0" aria-label="Supprimer l'étape">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      )}
                    </div>

                    {/* ── Suggestion de prix ── */}
                    {profile && (
                      <div className={`mx-4 mt-3 px-4 py-3 rounded-xl border transition-all ${applied ? 'bg-eucalyptus/5 border-eucalyptus/30' : 'bg-white border-stone-200'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/40 mb-1.5">
                              {profile.flag} Estimation Heldonica · {profile.label} · {stage.nights} nuit{stage.nights > 1 ? 's' : ''}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-charcoal/60">
                              <span>🏨 <strong className="text-charcoal/80">{fmt(profile.accommodationPerNight * stage.nights)} €</strong> héberg.</span>
                              <span>🚌 <strong className="text-charcoal/80">{fmt(profile.transportPerStage)} €</strong> transport</span>
                              <span>🍽 <strong className="text-charcoal/80">{fmt(profile.foodPerDay * stage.nights)} €</strong> resto</span>
                              <span>🎭 <strong className="text-charcoal/80">{fmt(profile.activitiesPerDay * stage.nights)} €</strong> activ.</span>
                            </div>
                            <p className="text-[11px] text-charcoal/45 mt-1.5 italic leading-snug">{profile.tip}</p>
                          </div>
                          <button
                            onClick={() => applySuggestion(stage, profile)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${applied ? 'bg-eucalyptus text-white' : 'bg-stone-100 text-charcoal/70 hover:bg-eucalyptus/10 hover:text-eucalyptus'}`}
                          >
                            {applied ? '✓ Appliqué' : 'Appliquer'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ── Budget fields ── */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
                      {BUDGET_FIELDS.map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-xs text-charcoal/45 mb-1">{label}</label>
                          <div className="relative">
                            <input
                              type="number"
                              value={stage[key] as number}
                              onChange={e => updateStage(stage.id, key, Math.max(0, Number(e.target.value)))}
                              min={0}
                              className="w-full pr-6 pl-3 py-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-eucalyptus transition-colors"
                            />
                            <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-charcoal/40">€</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ── Sous-total ── */}
                    <div className="px-4 pb-4 pt-0">
                      <div className="pt-3 border-t border-stone-200 flex justify-between items-center">
                        <span className="text-xs text-charcoal/40">Sous-total étape</span>
                        <span className="text-sm font-semibold text-mahogany">{fmt(total)} €</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button onClick={addStage} className="mt-4 flex items-center gap-2 text-sm text-eucalyptus font-semibold hover:gap-3 transition-all">
              <span className="w-6 h-6 rounded-full border-2 border-eucalyptus flex items-center justify-center font-bold leading-none">+</span>
              Ajouter une étape
            </button>

            {/* ── Carte ── */}
            <div className="mt-6">
              {mapStages.length > 0 ? (
                <>
                  <p className="text-xs text-charcoal/40 mb-3">{mapStages.length} étape{mapStages.length > 1 ? 's' : ''} localisée{mapStages.length > 1 ? 's' : ''} sur la carte</p>
                  <OrganizerMap stages={mapStages} height="340px" />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center bg-stone-100 rounded-xl text-center px-6 py-10 text-charcoal/40">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="mb-3 text-charcoal/25" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <p className="text-sm">Saisis le nom d'une ville et son pays pour visualiser ton itinéraire sur la carte</p>
                </div>
              )}
            </div>
          </section>

          {/* ── Budget ────────────────────────────────────────────────────── */}
          <section className="bg-mahogany text-white rounded-2xl p-6 md:p-8 mb-6">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white/50 mb-6">Budget estimé</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center mb-8">
              {[
                { value: fmt(totalBudget),   label: 'Total', suffix: '€' },
                { value: fmt(costPerPerson), label: 'Par personne', suffix: '€' },
                { value: fmt(costPerDay),    label: 'Par jour', suffix: '€' },
                { value: String(travelers),  label: `Voyageur${travelers > 1 ? 's' : ''}`, suffix: '' },
              ].map(({ value, label, suffix }) => (
                <div key={label}>
                  <div className="text-3xl font-serif font-light">{value}{suffix && <span className="text-lg ml-1">{suffix}</span>}</div>
                  <div className="text-white/55 text-xs mt-1">{label}</div>
                </div>
              ))}
            </div>
            {totalBudget > 0 && (
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Répartition</p>
                <div className="flex h-3 rounded-full overflow-hidden mb-4">
                  {catTotals.map(c => c.total > 0 ? (
                    <div key={c.key} style={{ width: `${(c.total / totalBudget) * 100}%`, background: c.color }} title={`${c.label} : ${fmt(c.total)} €`} />
                  ) : null)}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {catTotals.map(c => (
                    <div key={c.key} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: c.color }} />
                      <div>
                        <div className="text-white/90 text-xs font-medium">{fmt(c.total)} €</div>
                        <div className="text-white/40 text-[10px]">{c.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── Checklist ─────────────────────────────────────────────────── */}
          <section className={sectionClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className={headClass + ' mb-0'}>Checklist</h2>
              <span className="text-sm font-semibold text-charcoal/50">
                {checkedItems}/{checklist.length}
                {progress === 100 && checklist.length > 0 && <span className="ml-2 text-emerald-500">✓</span>}
              </span>
            </div>
            <div className="h-2 bg-stone-100 rounded-full mb-6 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: progress === 100 ? '#27ae60' : '#006D77' }} />
            </div>
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5 mb-6">
              {CHECKLIST_CATEGORIES.map(cat => {
                const items = checklist.filter(i => i.category === cat)
                if (items.length === 0) return null
                return (
                  <div key={cat}>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-charcoal/35 mb-2">{cat}</p>
                    <ul className="space-y-1.5">
                      {items.map(item => (
                        <li key={item.id} className="flex items-center gap-3 group">
                          <input type="checkbox" checked={item.checked} onChange={() => toggleChecklist(item.id)} className="w-4 h-4 rounded accent-eucalyptus flex-shrink-0" />
                          <span className={`text-sm transition-colors leading-snug ${item.checked ? 'line-through text-charcoal/30' : 'text-charcoal/75 group-hover:text-charcoal'}`}>
                            {item.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-stone-100 pt-5">
              <p className="text-xs text-charcoal/40 mb-3">Ajouter un item personnalisé</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newItemText}
                  onChange={e => setNewItemText(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addChecklistItem() } }}
                  placeholder="Ton item personnalisé…"
                  className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-eucalyptus transition-colors"
                />
                <select value={newItemCat} onChange={e => setNewItemCat(e.target.value as typeof CHECKLIST_CATEGORIES[number])} className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:outline-none focus:border-eucalyptus transition-colors">
                  {CHECKLIST_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button onClick={addChecklistItem} disabled={!newItemText.trim()} className="px-4 py-2 bg-eucalyptus text-white text-xs font-semibold rounded-lg hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
                  Ajouter
                </button>
              </div>
            </div>
          </section>

          {/* ── Actions ───────────────────────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { label: 'Tout effacer', onClick: clearSaved, cls: 'bg-white border border-stone-200 text-charcoal/60 hover:border-mahogany/30 hover:text-mahogany', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg> },
              { label: 'Imprimer', onClick: () => window.print(), cls: 'bg-white border border-stone-200 text-charcoal/60 hover:border-eucalyptus/40 hover:text-eucalyptus', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> },
              { label: 'Exporter .txt', onClick: exportPlan, cls: 'bg-eucalyptus/10 border border-eucalyptus/20 text-eucalyptus font-semibold hover:bg-eucalyptus hover:text-white', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
            ].map(({ label, onClick, cls, icon }) => (
              <button key={label} onClick={onClick} className={`px-5 py-2.5 text-sm rounded-full transition-colors inline-flex items-center gap-2 ${cls}`}>
                {icon}{label}
              </button>
            ))}
            <Link href="/travel-planning" className="px-6 py-2.5 bg-mahogany text-white text-sm font-semibold rounded-full hover:brightness-110 transition-all inline-flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              Demander un itinéraire sur mesure
            </Link>
          </div>

        </div>
      </div>
    </InlineEditProvider>
  )
}
