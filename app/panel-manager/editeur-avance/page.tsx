'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  RefreshCw,
  ExternalLink,
  Eye,
  FileText,
  Layers,
  Search,
  Save,
  Check,
  CheckCircle2,
  Globe,
  Share2,
  Sparkles,
  ArrowUpRight,
  Lock,
  ChevronLeft,
  ChevronRight,
  Copy,
  Sliders,
  Image as ImageIcon,
  Type,
  AlertCircle,
  Home,
  MapPin,
  Compass,
  Briefcase
} from 'lucide-react'
import { pathToNamespace } from '@/lib/cms-namespace'

type Device = 'desktop' | 'tablet' | 'mobile'
type Orientation = 'portrait' | 'landscape'
type Tab = 'brouillons' | 'zones' | 'social'

interface Draft {
  id: number
  title: string
  slug: string
  category?: string
  excerpt?: string
  updated_at?: string
}

interface Zone {
  zone_key: string
  zone_type: string
  value: string
  is_active: boolean
}

const PRESETS = [
  { id: 'home', label: 'Accueil', path: '/', icon: Home },
  { id: 'blog', label: 'Blog', path: '/blog', icon: FileText },
  { id: 'destinations', label: 'Destinations', path: '/destinations', icon: Compass },
  { id: 'carte', label: 'Carte', path: '/destinations/carte', icon: MapPin },
  { id: 'planning', label: 'Travel Planning', path: '/travel-planning', icon: Globe },
  { id: 'expert', label: 'Expert Hôtelier', path: '/expert-hotelier', icon: Briefcase },
]

export default function EditeurAvancePage() {
  const [origin, setOrigin] = useState('')
  const [path, setPath] = useState('/')
  const [inputPath, setInputPath] = useState('/')
  const [device, setDevice] = useState<Device>('desktop')
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [zoom, setZoom] = useState<number>(100)
  const [frameKey, setFrameKey] = useState(0)
  const [activeTab, setActiveTab] = useState<Tab>('brouillons')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [editable, setEditable] = useState<boolean | null>(null)

  // Drafts
  const [drafts, setDrafts] = useState<Draft[]>([])
  const [loadingDrafts, setLoadingDrafts] = useState(false)
  const [searchDraft, setSearchDraft] = useState('')

  // Zones
  const [namespace, setNamespace] = useState('home')
  const [zones, setZones] = useState<Zone[]>([])
  const [loadingZones, setLoadingZones] = useState(false)
  const [searchZone, setSearchZone] = useState('')
  const [editing, setEditing] = useState<Record<string, string>>({})
  const [savingKey, setSavingKey] = useState<string | null>(null)

  // Feedback Toast
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'info' | 'error' } | null>(null)

  function showToast(message: string, type: 'success' | 'info' | 'error' = 'info') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  useEffect(() => {
    setOrigin(window.location.origin)
    fetch('/api/cms/auth/check')
      .then((r) => r.json())
      .then((d) => setEditable(!!(d.authenticated || d.ok)))
      .catch(() => setEditable(false))
  }, [])

  // Synchronize inputPath with active path
  useEffect(() => {
    setInputPath(path)
  }, [path])

  // Load Drafts
  const loadDrafts = useCallback(async () => {
    setLoadingDrafts(true)
    try {
      const res = await fetch('/api/cms/articles?status=draft')
      const data = await res.json()
      setDrafts(Array.isArray(data.articles) ? data.articles : [])
    } catch {
      showToast('Impossible de charger les brouillons', 'error')
    } finally {
      setLoadingDrafts(false)
    }
  }, [])

  useEffect(() => {
    loadDrafts()
  }, [loadDrafts])

  // Preview a draft
  async function previewDraft(slug: string) {
    try {
      showToast('Génération du jeton de prévisualisation...', 'info')
      const res = await fetch(`/api/cms/preview-token?slug=${encodeURIComponent(slug)}`)
      if (!res.ok) {
        showToast('Erreur génération du jeton', 'error')
        return
      }
      const data = await res.json()
      const u = new URL(data.previewUrl, window.location.origin)
      const targetPath = u.pathname + u.search
      setPath(targetPath)
      setFrameKey((k) => k + 1)
      showToast('Brouillon chargé en direct !', 'success')
    } catch {
      showToast('Impossible d’ouvrir l’aperçu du brouillon', 'error')
    }
  }

  // Load Zones for active namespace
  const loadZones = useCallback(async (nsToLoad = namespace) => {
    if (!nsToLoad) return
    setLoadingZones(true)
    try {
      const res = await fetch(`/api/cms/zones?page=${encodeURIComponent(nsToLoad)}`)
      const data = await res.json()
      const byPage = data.byPage?.[nsToLoad] || {}
      setZones(Object.values(byPage) as Zone[])
      setEditing({})
    } catch {
      showToast('Impossible de charger les zones', 'error')
    } finally {
      setLoadingZones(false)
    }
  }, [namespace])

  useEffect(() => {
    loadZones()
  }, [loadZones])

  // Auto-detect namespace from URL
  function detectNamespace() {
    const ns = pathToNamespace(path)
    if (ns) {
      setNamespace(ns)
      loadZones(ns)
      showToast(`Namespace détecté : ${ns}`, 'success')
    } else {
      showToast('Aucun namespace correspondant', 'info')
    }
  }

  // Save Zone
  async function saveZone(zoneKey: string) {
    const value = editing[zoneKey] ?? zones.find((z) => z.zone_key === zoneKey)?.value ?? ''
    setSavingKey(zoneKey)
    try {
      const res = await fetch('/api/cms/zones', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: namespace, zone_key: zoneKey, value }),
      })
      if (res.ok) {
        showToast(`Zone "${zoneKey}" sauvegardée !`, 'success')
        setZones((zs) => zs.map((z) => (z.zone_key === zoneKey ? { ...z, value } : z)))
        setEditing((prev) => {
          const next = { ...prev }
          delete next[zoneKey]
          return next
        })
        // Refresh frame to reflect changes
        setFrameKey((k) => k + 1)
      } else {
        showToast('Échec de l’enregistrement', 'error')
      }
    } catch {
      showToast('Erreur réseau lors de la sauvegarde', 'error')
    } finally {
      setSavingKey(null)
    }
  }

  // Navigate to path
  function navigateTo(p: string) {
    setPath(p)
    setFrameKey((k) => k + 1)
    const ns = pathToNamespace(p)
    if (ns) {
      setNamespace(ns)
    }
  }

  const filteredDrafts = useMemo(() => {
    if (!searchDraft.trim()) return drafts
    const q = searchDraft.toLowerCase()
    return drafts.filter((d) => d.title?.toLowerCase().includes(q) || d.slug?.toLowerCase().includes(q))
  }, [drafts, searchDraft])

  const filteredZones = useMemo(() => {
    if (!searchZone.trim()) return zones
    const q = searchZone.toLowerCase()
    return zones.filter((z) => z.zone_key.toLowerCase().includes(q) || z.value?.toLowerCase().includes(q))
  }, [zones, searchZone])

  // Device dimensions calculation
  const deviceDimensions = useMemo(() => {
    if (device === 'desktop') {
      return { width: '100%', height: '100%', isFluid: true }
    }
    if (device === 'tablet') {
      return orientation === 'portrait'
        ? { width: '768px', height: '1024px', isFluid: false }
        : { width: '1024px', height: '768px', isFluid: false }
    }
    // mobile
    return orientation === 'portrait'
      ? { width: '390px', height: '844px', isFluid: false }
      : { width: '844px', height: '390px', isFluid: false }
  }, [device, orientation])

  const fullUrl = `${origin}${path}`

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-stone-950 text-stone-100 font-sans select-none">
      {/* Top Header Bar */}
      <header className="h-14 bg-stone-900/90 backdrop-blur border-b border-stone-800 px-4 flex items-center justify-between gap-3 z-30 shrink-0">
        {/* Brand & Breadcrumbs */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition"
            title={sidebarOpen ? 'Réduire la barre latérale' : 'Ouvrir la barre latérale'}
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
            <h1 className="font-semibold text-sm tracking-wide text-stone-200">
              Éditeur Preview <span className="text-teal-400 font-mono text-xs px-1.5 py-0.5 rounded bg-teal-950/60 border border-teal-800/40">PRO</span>
            </h1>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="hidden lg:flex items-center gap-1 bg-stone-950/60 p-1 rounded-lg border border-stone-800/80">
          {PRESETS.map((p) => {
            const Icon = p.icon
            const isActive = path === p.path
            return (
              <button
                key={p.id}
                onClick={() => navigateTo(p.path)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs transition ${
                  isActive
                    ? 'bg-teal-600 text-white font-medium shadow-sm shadow-teal-900/40'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <Icon size={13} />
                <span>{p.label}</span>
              </button>
            )
          })}
        </div>

        {/* Address Bar */}
        <div className="flex-1 max-w-xl mx-2">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              navigateTo(inputPath)
            }}
            className="flex items-center gap-2 bg-stone-950/80 border border-stone-800 hover:border-stone-700 focus-within:border-teal-500 rounded-lg px-2.5 py-1 transition"
          >
            <Lock size={13} className="text-stone-500 shrink-0" />
            <span className="text-stone-500 text-xs hidden sm:inline select-none">
              {origin || 'https://heldonica.fr'}
            </span>
            <input
              type="text"
              value={inputPath}
              onChange={(e) => setInputPath(e.target.value)}
              placeholder="/"
              className="bg-transparent text-xs text-stone-200 focus:outline-none flex-1 font-mono tracking-tight"
            />
            <button
              type="submit"
              className="text-stone-400 hover:text-white p-1 rounded transition"
              title="Aller à l'adresse"
            >
              <ArrowUpRight size={14} />
            </button>
          </form>
        </div>

        {/* Viewport & Device Selectors */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Device buttons */}
          <div className="flex items-center bg-stone-950/80 rounded-lg border border-stone-800 p-0.5">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded transition ${
                device === 'desktop' ? 'bg-stone-800 text-teal-400 shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Vue Ordinateur"
            >
              <Monitor size={16} />
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded transition ${
                device === 'tablet' ? 'bg-stone-800 text-teal-400 shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Vue Tablette"
            >
              <Tablet size={16} />
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded transition ${
                device === 'mobile' ? 'bg-stone-800 text-teal-400 shadow-sm' : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Vue Mobile"
            >
              <Smartphone size={16} />
            </button>
          </div>

          {/* Orientation Toggle (tablette & mobile) */}
          {device !== 'desktop' && (
            <button
              onClick={() => setOrientation((o) => (o === 'portrait' ? 'landscape' : 'portrait'))}
              className={`p-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300 transition ${
                orientation === 'landscape' ? 'text-teal-400 border-teal-800' : ''
              }`}
              title={`Orientation : ${orientation === 'portrait' ? 'Vertical (Portrait)' : 'Horizontal (Paysage)'}`}
            >
              <RotateCcw size={15} />
            </button>
          )}

          {/* Zoom controls */}
          <select
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="bg-stone-900 border border-stone-800 text-stone-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-teal-500 cursor-pointer hidden md:block"
          >
            <option value={50}>50%</option>
            <option value={75}>75%</option>
            <option value={85}>85%</option>
            <option value={100}>100%</option>
          </select>

          {/* Reload iframe */}
          <button
            onClick={() => setFrameKey((k) => k + 1)}
            className="p-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition"
            title="Recharger l'aperçu"
          >
            <RefreshCw size={15} />
          </button>

          {/* Open external */}
          <a
            href={fullUrl}
            target="_blank"
            rel="noreferrer"
            className="p-1.5 rounded-lg border border-stone-800 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white transition"
            title="Ouvrir dans un nouvel onglet"
          >
            <ExternalLink size={15} />
          </a>
        </div>
      </header>

      {/* Auth / Session Warning Banner */}
      {editable === false && (
        <div className="bg-amber-950/70 border-b border-amber-800/40 px-4 py-2 flex items-center justify-between text-xs text-amber-200">
          <div className="flex items-center gap-2">
            <AlertCircle size={15} className="text-amber-400 shrink-0" />
            <span>Mode visiteur anonyme : les brouillons protégés et l&apos;édition de zones nécessitent une connexion CMS.</span>
          </div>
          <a
            href="/panel-manager"
            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded transition"
          >
            Se connecter au CMS
          </a>
        </div>
      )}

      {/* Main Workspace: Sidebar + Preview Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Panel */}
        <aside
          className={`${
            sidebarOpen ? 'w-80 md:w-96' : 'w-0'
          } shrink-0 bg-stone-900/95 border-r border-stone-800 transition-all duration-300 flex flex-col overflow-hidden z-20`}
        >
          {/* Sidebar Tabs Header */}
          <div className="p-3 border-b border-stone-800 flex items-center gap-1.5 bg-stone-950/50">
            <button
              onClick={() => setActiveTab('brouillons')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                activeTab === 'brouillons'
                  ? 'bg-stone-800 text-teal-300 shadow-sm border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              <FileText size={14} />
              <span>Brouillons</span>
              {drafts.length > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-teal-900 text-teal-300 rounded-full text-[10px]">
                  {drafts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('zones')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                activeTab === 'zones'
                  ? 'bg-stone-800 text-teal-300 shadow-sm border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              <Layers size={14} />
              <span>Zones CMS</span>
            </button>

            <button
              onClick={() => setActiveTab('social')}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition ${
                activeTab === 'social'
                  ? 'bg-stone-800 text-teal-300 shadow-sm border border-stone-700'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
              }`}
            >
              <Share2 size={14} />
              <span>Social & SEO</span>
            </button>
          </div>

          {/* Sidebar Tab Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* 1. BROUILLONS TAB */}
            {activeTab === 'brouillons' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold">
                    Brouillons non publiés
                  </span>
                  <button
                    onClick={loadDrafts}
                    disabled={loadingDrafts}
                    className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition"
                  >
                    <RefreshCw size={12} className={loadingDrafts ? 'animate-spin' : ''} />
                    Actualiser
                  </button>
                </div>

                {/* Drafts Search Input */}
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-stone-500" />
                  <input
                    type="text"
                    value={searchDraft}
                    onChange={(e) => setSearchDraft(e.target.value)}
                    placeholder="Filtrer un article..."
                    className="w-full pl-8 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-teal-500 transition"
                  />
                </div>

                {loadingDrafts ? (
                  <div className="py-8 text-center text-stone-500 text-xs flex flex-col items-center gap-2">
                    <RefreshCw size={18} className="animate-spin text-teal-500" />
                    <span>Chargement des brouillons...</span>
                  </div>
                ) : filteredDrafts.length === 0 ? (
                  <div className="py-8 text-center text-stone-500 text-xs bg-stone-950/40 rounded-xl border border-stone-800/60 p-4">
                    <p className="font-medium text-stone-400">Aucun brouillon trouvé</p>
                    <p className="text-[11px] mt-1 text-stone-500">
                      Tous tes articles récents sont soit publiés, soit aucun brouillon ne correspond à ta recherche.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {filteredDrafts.map((draft) => (
                      <div
                        key={draft.id}
                        className="bg-stone-950/70 border border-stone-800 hover:border-stone-700 rounded-xl p-3 transition space-y-2 group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-semibold text-stone-200 group-hover:text-teal-300 transition line-clamp-2">
                            {draft.title || 'Sans titre'}
                          </h4>
                          <span className="shrink-0 text-[10px] px-2 py-0.5 rounded-full bg-amber-950/70 text-amber-400 border border-amber-800/40 font-mono">
                            Brouillon
                          </span>
                        </div>

                        {draft.category && (
                          <span className="inline-block text-[10px] text-stone-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                            {draft.category}
                          </span>
                        )}

                        <div className="pt-1 flex items-center justify-between gap-2 border-t border-stone-850">
                          <span className="text-[10px] text-stone-500 font-mono truncate">
                            /blog/{draft.slug}
                          </span>
                          <button
                            onClick={() => previewDraft(draft.slug)}
                            className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-[11px] font-medium flex items-center gap-1.5 shadow-sm transition"
                          >
                            <Eye size={12} />
                            <span>Aperçu</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. ZONES CMS TAB */}
            {activeTab === 'zones' && (
              <div className="space-y-3">
                {/* Namespace Selector */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-stone-400 uppercase tracking-wider font-semibold">
                      Namespace de page
                    </label>
                    <button
                      onClick={detectNamespace}
                      className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 transition"
                      title="Détecter automatiquement depuis l'URL"
                    >
                      <Sparkles size={12} />
                      Auto-détecter
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={namespace}
                      onChange={(e) => setNamespace(e.target.value)}
                      placeholder="home, destinations-roumanie..."
                      className="flex-1 px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-teal-500 font-mono transition"
                    />
                    <button
                      onClick={() => loadZones()}
                      disabled={loadingZones}
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition"
                    >
                      Charger
                    </button>
                  </div>
                </div>

                {/* Search in Zones */}
                <div className="relative">
                  <Search size={14} className="absolute left-2.5 top-2.5 text-stone-500" />
                  <input
                    type="text"
                    value={searchZone}
                    onChange={(e) => setSearchZone(e.target.value)}
                    placeholder="Filtrer une clé de zone..."
                    className="w-full pl-8 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-teal-500 transition"
                  />
                </div>

                {loadingZones ? (
                  <div className="py-8 text-center text-stone-500 text-xs flex flex-col items-center gap-2">
                    <RefreshCw size={18} className="animate-spin text-teal-500" />
                    <span>Chargement des zones...</span>
                  </div>
                ) : filteredZones.length === 0 ? (
                  <div className="py-8 text-center text-stone-500 text-xs bg-stone-950/40 rounded-xl border border-stone-800/60 p-4">
                    <p className="font-medium text-stone-400">Aucune zone trouvée</p>
                    <p className="text-[11px] mt-1 text-stone-500">
                      Ce namespace ne contient pas encore de zones éditables ou le filtre est trop restrictif.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredZones.map((zone) => {
                      const isSaving = savingKey === zone.zone_key
                      const isEdited = editing[zone.zone_key] !== undefined
                      const currentValue = editing[zone.zone_key] ?? zone.value
                      const isImage = zone.zone_type === 'image' || zone.zone_key.includes('img') || zone.zone_key.includes('photo')

                      return (
                        <div
                          key={zone.zone_key}
                          className="bg-stone-950/70 border border-stone-800 rounded-xl p-3 space-y-2 transition"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-mono text-stone-300 font-semibold truncate">
                              {zone.zone_key}
                            </span>
                            <span className="text-[10px] text-stone-500 px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800 flex items-center gap-1">
                              {isImage ? <ImageIcon size={10} /> : <Type size={10} />}
                              {zone.zone_type || 'text'}
                            </span>
                          </div>

                          {/* Editor textarea */}
                          <textarea
                            value={currentValue}
                            onChange={(e) =>
                              setEditing((prev) => ({
                                ...prev,
                                [zone.zone_key]: e.target.value,
                              }))
                            }
                            rows={isImage ? 2 : 3}
                            className="w-full bg-stone-900 border border-stone-800 focus:border-teal-500 rounded-lg p-2 text-xs text-stone-200 focus:outline-none font-sans leading-relaxed resize-y transition"
                            placeholder="Valeur du contenu..."
                          />

                          {/* Image preview thumbnail if applicable */}
                          {isImage && currentValue && currentValue.startsWith('http') && (
                            <div className="relative rounded-lg overflow-hidden border border-stone-800 h-24 bg-stone-900 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={currentValue}
                                alt="Aperçu zone"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  ;(e.target as HTMLElement).style.display = 'none'
                                }}
                              />
                            </div>
                          )}

                          <div className="flex items-center justify-between pt-1">
                            <span className="text-[10px] text-stone-500">
                              {isEdited ? (
                                <span className="text-amber-400 font-medium">Modifié non enregistré</span>
                              ) : (
                                'À jour'
                              )}
                            </span>

                            <button
                              onClick={() => saveZone(zone.zone_key)}
                              disabled={isSaving}
                              className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition ${
                                isEdited
                                  ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-sm'
                                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                              }`}
                            >
                              {isSaving ? (
                                <>
                                  <RefreshCw size={12} className="animate-spin" />
                                  <span>Sauvegarde...</span>
                                </>
                              ) : (
                                <>
                                  <Save size={12} />
                                  <span>Enregistrer</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. SOCIAL & SEO TAB */}
            {activeTab === 'social' && (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-xs uppercase tracking-wider font-semibold text-stone-300">
                    Simulateur de partage
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Vérifie le rendu visuel de cette page lorsqu&apos;elle est partagée sur Google ou les réseaux sociaux.
                  </p>
                </div>

                {/* Google SERP Card */}
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
                    <Globe size={12} className="text-teal-500" />
                    <span>heldonica.fr</span>
                    <span className="text-stone-600">›</span>
                    <span className="text-stone-500 truncate">{path.replace(/^\//, '') || 'accueil'}</span>
                  </div>
                  <h5 className="text-xs font-medium text-blue-400 hover:underline cursor-pointer">
                    Heldonica — Slow Travel & Guides d&apos;Immersion
                  </h5>
                  <p className="text-[11px] text-stone-400 leading-normal line-clamp-2">
                    Découvrez des carnets de voyage authentiques, des itinéraires lents et une sélection d&apos;adresses sélectionnées avec rigueur.
                  </p>
                </div>

                {/* OpenGraph / WhatsApp / Facebook Card */}
                <div className="bg-stone-950 rounded-xl border border-stone-800 overflow-hidden">
                  <div className="h-32 bg-stone-850 flex items-center justify-center relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/og-image.jpg"
                      alt="Aperçu OpenGraph"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                    <span className="absolute inset-0 flex items-center justify-center text-xs text-stone-500 bg-stone-900/60 backdrop-blur-sm">
                      Image OpenGraph (og:image)
                    </span>
                  </div>
                  <div className="p-3 space-y-1">
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider font-mono">
                      heldonica.fr
                    </span>
                    <h6 className="text-xs font-semibold text-stone-200 line-clamp-1">
                      Heldonica slow travel journal
                    </h6>
                    <p className="text-[11px] text-stone-400 line-clamp-2">
                      Récits vécus, coordonnées GPS vérifiées et guides indépendants.
                    </p>
                  </div>
                </div>

                {/* Quick SEO Advice */}
                <div className="p-3 bg-stone-900/70 border border-stone-800 rounded-xl space-y-1.5 text-[11px] text-stone-400">
                  <span className="font-semibold text-stone-300 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="text-teal-400" />
                    Bonnes pratiques de publication
                  </span>
                  <ul className="list-disc list-inside space-y-1 text-stone-400">
                    <li>Titre idéal : entre 50 et 60 caractères.</li>
                    <li>Description idéale : entre 130 et 160 caractères.</li>
                    <li>Image de partage : format 1200 x 630 px.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Preview Canvas Container */}
        <main className="flex-1 bg-stone-950 flex flex-col items-center justify-center p-3 sm:p-6 overflow-auto relative">
          {/* Viewport Frame with Realistic Device Skins */}
          <div
            style={{
              width: deviceDimensions.width,
              maxWidth: '100%',
              height: deviceDimensions.isFluid ? '100%' : deviceDimensions.height,
              maxHeight: '100%',
              transform: zoom !== 100 ? `scale(${zoom / 100})` : undefined,
              transformOrigin: 'top center',
            }}
            className={`transition-all duration-300 relative flex flex-col bg-white overflow-hidden shadow-2xl ${
              device === 'desktop'
                ? 'rounded-xl border border-stone-800'
                : device === 'tablet'
                ? 'rounded-[2rem] border-[10px] border-stone-900 ring-1 ring-stone-800'
                : 'rounded-[3rem] border-[12px] border-stone-900 ring-1 ring-stone-800'
            }`}
          >
            {/* Mobile / Tablet Top Notch / Camera Mockup */}
            {device === 'mobile' && orientation === 'portrait' && (
              <div className="w-full bg-stone-900 h-6 shrink-0 flex items-center justify-center relative select-none">
                <div className="w-24 h-3.5 bg-black rounded-full" />
              </div>
            )}

            {/* Desktop Window Titlebar Mockup */}
            {device === 'desktop' && (
              <div className="h-7 bg-stone-100 border-b border-stone-200 px-3 flex items-center gap-2 select-none shrink-0">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                </div>
                <div className="flex-1 text-center text-[10px] text-stone-500 font-mono truncate px-4">
                  {fullUrl}
                </div>
              </div>
            )}

            {/* Live iFrame */}
            {origin && (
              <iframe
                key={frameKey}
                src={fullUrl}
                title="Aperçu interactif Heldonica"
                className="w-full flex-1 border-0 bg-white"
              />
            )}

            {/* Mobile Bottom Home Bar */}
            {device === 'mobile' && orientation === 'portrait' && (
              <div className="w-full bg-stone-900 h-4 shrink-0 flex items-center justify-center select-none">
                <div className="w-32 h-1 bg-stone-600 rounded-full" />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 px-4 py-2.5 rounded-xl shadow-xl text-xs font-medium z-50 flex items-center gap-2 border animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-teal-950 text-teal-200 border-teal-800'
              : toast.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-800'
              : 'bg-stone-900 text-stone-200 border-stone-800'
          }`}
        >
          {toast.type === 'success' ? (
            <Check size={14} className="text-teal-400" />
          ) : toast.type === 'error' ? (
            <AlertCircle size={14} className="text-rose-400" />
          ) : (
            <Sparkles size={14} className="text-teal-400" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}
