'use client'

import React, { useState, useRef } from 'react'
import { Download, Copy, Check, Eye, RefreshCw, Palette, Sparkles, Layout } from 'lucide-react'

export type LogoArchetype = 'botanic' | 'monogram' | 'compass' | 'editorial'

export interface LogoConfig {
  archetype: LogoArchetype
  siteName: string
  tagline: string
  fontFamily: 'Playfair Display' | 'Cormorant Garamond' | 'Cinzel' | 'Fraunces'
  primaryColor: string
  accentColor: string
  textColor: string
  tracking: 'normal' | 'wide' | 'widest'
  strokeWidth: number
  showTagline: boolean
  sealBorder: 'none' | 'simple' | 'double' | 'dashed'
}

const DEFAULT_CONFIG: LogoConfig = {
  archetype: 'botanic',
  siteName: 'Heldonica',
  tagline: 'Média & Voyages Singuliers',
  fontFamily: 'Playfair Display',
  primaryColor: '#4A7C7E', // Eucalyptus
  accentColor: '#6B2D1F',  // Mahogany / Terracotta
  textColor: '#241D1A',    // Charcoal
  tracking: 'wide',
  strokeWidth: 1.25,
  showTagline: true,
  sealBorder: 'simple',
}

const COLOR_PRESETS = [
  { name: 'Eucalyptus & Terre', primary: '#4A7C7E', accent: '#6B2D1F', text: '#241D1A' },
  { name: 'Terre & Ocre', primary: '#6B2D1F', accent: '#C89D5C', text: '#241D1A' },
  { name: 'Minéral Sombre', primary: '#241D1A', accent: '#4A7C7E', text: '#1A1715' },
  { name: 'Ocre & Forêt', primary: '#C89D5C', accent: '#2F4F4F', text: '#241D1A' },
]

export default function LogoGenerator() {
  const [config, setConfig] = useState<LogoConfig>(DEFAULT_CONFIG)
  const [previewBg, setPreviewBg] = useState<'light' | 'dark' | 'header'>('light')
  const [copiedSvg, setCopiedSvg] = useState(false)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const svgRef = useRef<SVGSVGElement>(null)

  const trackingClass =
    config.tracking === 'normal'
      ? 'tracking-normal'
      : config.tracking === 'wide'
      ? 'tracking-[0.16em]'
      : 'tracking-[0.28em]'

  // Génération du SVG vectoriel sous forme de texte pour export
  const getSvgString = () => {
    if (!svgRef.current) return ''
    return new XMLSerializer().serializeToString(svgRef.current)
  }

  const handleDownloadSvg = () => {
    const svgStr = getSvgString()
    if (!svgStr) return
    const blob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `heldonica-logo-${config.archetype}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadPng = () => {
    const svgStr = getSvgString()
    if (!svgStr) return
    const canvas = document.createElement('canvas')
    const size = 1200
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = new window.Image()
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    img.onload = () => {
      ctx.clearRect(0, 0, size, size)
      ctx.drawImage(img, 0, 0, size, size)
      const pngUrl = canvas.toDataURL('image/png')
      const a = document.createElement('a')
      a.href = pngUrl
      a.download = `heldonica-logo-${config.archetype}-1200.png`
      a.click()
      URL.revokeObjectURL(url)
    }
    img.src = url
  }

  const handleCopySvg = async () => {
    const svgStr = getSvgString()
    if (!svgStr) return
    await navigator.clipboard.writeText(svgStr)
    setCopiedSvg(true)
    setTimeout(() => setCopiedSvg(false), 2500)
  }

  const handleApplyToSite = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          font_heading: config.fontFamily,
          heading_color: config.accentColor,
          primary_color: config.primaryColor,
          header_logo_display: config.archetype === 'editorial' ? 'text' : 'both',
        }),
      })
      if (res.ok) {
        setSavedSuccess(true)
        setTimeout(() => setSavedSuccess(false), 3000)
      }
    } catch {
      // Ignorer ou notifier
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Barre d'outils supérieure */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#241D1A] font-serif flex items-center gap-2">
            <span>⚜️</span> Générateur de Logo & Sceau Heldonica
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Concepteur vectoriel de logo, sceaux botaniques et monogrammes de marque avec export SVG/PNG direct.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopySvg}
            className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-medium text-stone-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedSvg ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-500" />}
            <span>{copiedSvg ? 'Copié !' : 'Copier code SVG'}</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadSvg}
            className="px-3.5 py-2 rounded-xl bg-eucalyptus hover:bg-eucalyptus/90 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger SVG</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadPng}
            className="px-3.5 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-medium text-stone-700 flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-4 h-4 text-stone-500" />
            <span>Export PNG HD</span>
          </button>
          <button
            type="button"
            onClick={handleApplyToSite}
            disabled={saving}
            className="px-3.5 py-2 rounded-xl bg-action hover:bg-action-fonce text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            <span>{saving ? 'Application...' : savedSuccess ? '✓ Appliqué !' : 'Appliquer au site'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne de configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Sélection de l'archétype */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
              Style du Logo / Sceau
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setConfig({ ...config, archetype: 'botanic' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  config.archetype === 'botanic'
                    ? 'border-eucalyptus bg-eucalyptus/5 ring-1 ring-eucalyptus'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
                  🌿 Sceau Botanique
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  Arbre emblème & cercle timbré slow travel
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, archetype: 'monogram' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  config.archetype === 'monogram'
                    ? 'border-eucalyptus bg-eucalyptus/5 ring-1 ring-eucalyptus'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
                  ⚜️ Monogramme H
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  Serifs ciselés et rameau d&apos;olivier
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, archetype: 'compass' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  config.archetype === 'compass'
                    ? 'border-eucalyptus bg-eucalyptus/5 ring-1 ring-eucalyptus'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
                  🧭 Rose des Vents
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  Méridiens géographiques & compas
                </div>
              </button>

              <button
                type="button"
                onClick={() => setConfig({ ...config, archetype: 'editorial' })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  config.archetype === 'editorial'
                    ? 'border-eucalyptus bg-eucalyptus/5 ring-1 ring-eucalyptus'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="text-sm font-semibold text-charcoal flex items-center gap-1.5">
                  🖋️ Éditorial Épuré
                </div>
                <div className="text-[11px] text-stone-500 mt-1">
                  Logotype sérigraphié & filet discret
                </div>
              </button>
            </div>
          </div>

          {/* Textes */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
              Contenu & Typographie
            </label>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Nom de marque</label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm font-serif"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-stone-600">Slogan / Baseline</label>
                <label className="flex items-center gap-1.5 text-xs text-stone-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.showTagline}
                    onChange={(e) => setConfig({ ...config, showTagline: e.target.checked })}
                    className="rounded border-stone-300 text-eucalyptus focus:ring-eucalyptus"
                  />
                  <span>Afficher</span>
                </label>
              </div>
              <input
                type="text"
                value={config.tagline}
                disabled={!config.showTagline}
                onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm disabled:opacity-50"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Police de caractères</label>
              <select
                value={config.fontFamily}
                onChange={(e) => setConfig({ ...config, fontFamily: e.target.value as LogoConfig['fontFamily'] })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white"
              >
                <option value="Playfair Display">Playfair Display (Classique & noble)</option>
                <option value="Cormorant Garamond">Cormorant Garamond (Poétique & délicat)</option>
                <option value="Cinzel">Cinzel (Romain minéral)</option>
                <option value="Fraunces">Fraunces (Chaleureux & carnet)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Espacement (Tracking)</label>
              <div className="grid grid-cols-3 gap-2">
                {(['normal', 'wide', 'widest'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setConfig({ ...config, tracking: t })}
                    className={`py-1.5 text-xs rounded-lg border capitalize ${
                      config.tracking === t
                        ? 'border-eucalyptus bg-eucalyptus/5 font-semibold text-eucalyptus'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Couleurs */}
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
              Palette Graphique
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() =>
                    setConfig({
                      ...config,
                      primaryColor: p.primary,
                      accentColor: p.accent,
                      textColor: p.text,
                    })
                  }
                  className="px-2.5 py-1 rounded-full border border-stone-200 text-[11px] text-stone-600 hover:border-stone-400 flex items-center gap-1.5"
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.primary }} />
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.accent }} />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Emblème</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-8 h-8 rounded border border-stone-200 cursor-pointer"
                  />
                  <span className="text-xs font-mono">{config.primaryColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.accentColor}
                    onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                    className="w-8 h-8 rounded border border-stone-200 cursor-pointer"
                  />
                  <span className="text-xs font-mono">{config.accentColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] text-stone-500 mb-1">Typo</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.textColor}
                    onChange={(e) => setConfig({ ...config, textColor: e.target.value })}
                    className="w-8 h-8 rounded border border-stone-200 cursor-pointer"
                  />
                  <span className="text-xs font-mono">{config.textColor}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne de prévisualisation (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Aperçu en Direct
              </label>
              <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-lg text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewBg('light')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    previewBg === 'light' ? 'bg-white shadow-2xs font-semibold text-charcoal' : 'text-stone-500'
                  }`}
                >
                  Fond Clair
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('dark')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    previewBg === 'dark' ? 'bg-stone-900 text-white font-semibold' : 'text-stone-500'
                  }`}
                >
                  Fond Sombre
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewBg('header')}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    previewBg === 'header' ? 'bg-white shadow-2xs font-semibold text-charcoal' : 'text-stone-500'
                  }`}
                >
                  Simulateur Navbar
                </button>
              </div>
            </div>

            {/* Zone de rendu principal SVG */}
            <div
              className={`min-h-[380px] rounded-xl border flex flex-col items-center justify-center p-8 transition-colors ${
                previewBg === 'light'
                  ? 'bg-[#FAF7F2] border-[#DED5C6]'
                  : previewBg === 'dark'
                  ? 'bg-[#1C1816] border-stone-800'
                  : 'bg-[#F7F3EC] border-[#E8E0D2]'
              }`}
            >
              {previewBg === 'header' && (
                <div className="w-full mb-6 pb-3 border-b border-[#DED5C6] flex items-center justify-between text-xs text-stone-400">
                  <span>Simulation de l&apos;en-tête public Heldonica</span>
                  <div className="flex gap-3 text-stone-600">
                    <span>Carnets</span>
                    <span>Destinations</span>
                    <span>Voyager</span>
                  </div>
                </div>
              )}

              {/* Rendu du SVG interactif */}
              <div className="flex items-center justify-center max-w-full">
                <svg
                  ref={svgRef}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 500 200"
                  className="w-full max-w-[420px] h-auto select-none"
                  aria-label={`${config.siteName} Logo`}
                >
                  <defs>
                    <style>{`
                      @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Cormorant+Garamond:wght@400;600&family=Cinzel:wght@400;600&family=Fraunces:wght@400;600&display=swap');
                      .logo-title {
                        font-family: '${config.fontFamily}', Georgia, serif;
                        font-weight: 400;
                      }
                      .logo-tagline {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        font-size: 11px;
                        font-weight: 500;
                      }
                    `}</style>
                  </defs>

                  {/* Archétype 1 : Sceau Botanique Slow Travel */}
                  {config.archetype === 'botanic' && (
                    <g transform="translate(10, 10)">
                      {/* Cercle du sceau avec bordure */}
                      <circle
                        cx="90"
                        cy="90"
                        r="68"
                        fill="none"
                        stroke={config.primaryColor}
                        strokeWidth={config.strokeWidth * 1.5}
                        strokeDasharray={config.sealBorder === 'dashed' ? '4 3' : 'none'}
                      />
                      <circle
                        cx="90"
                        cy="90"
                        r="60"
                        fill="none"
                        stroke={config.accentColor}
                        strokeWidth={config.strokeWidth * 0.75}
                        opacity="0.6"
                      />
                      {/* Rameau / Arbre stylisé */}
                      <path
                        d="M 90,45 C 90,65 80,85 70,110 C 85,100 95,90 100,75 C 95,100 92,125 90,135 M 90,65 C 105,60 115,70 110,85 C 98,82 92,72 90,65 M 82,90 C 70,92 65,80 72,70 C 80,75 82,85 82,90 Z"
                        fill="none"
                        stroke={config.primaryColor}
                        strokeWidth={config.strokeWidth * 1.8}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Typographie */}
                      <text
                        x="185"
                        y="95"
                        fill={previewBg === 'dark' ? '#FAF7F2' : config.textColor}
                        className="logo-title"
                        fontSize="38"
                        letterSpacing={config.tracking === 'widest' ? '0.12em' : config.tracking === 'wide' ? '0.06em' : '0'}
                      >
                        {config.siteName}
                      </text>
                      {config.showTagline && (
                        <text
                          x="188"
                          y="125"
                          fill={previewBg === 'dark' ? '#C89D5C' : config.accentColor}
                          className="logo-tagline"
                          letterSpacing="0.22em"
                          opacity="0.85"
                        >
                          {config.tagline.toUpperCase()}
                        </text>
                      )}
                    </g>
                  )}

                  {/* Archétype 2 : Monogramme H Impérial Ciselé */}
                  {config.archetype === 'monogram' && (
                    <g transform="translate(10, 10)">
                      <rect
                        x="25"
                        y="25"
                        width="130"
                        height="130"
                        rx="8"
                        fill="none"
                        stroke={config.primaryColor}
                        strokeWidth={config.strokeWidth * 1.5}
                      />
                      {/* Lettre H stylisée */}
                      <text
                        x="90"
                        y="116"
                        fill={config.accentColor}
                        className="logo-title"
                        fontSize="84"
                        textAnchor="middle"
                        fontWeight="600"
                      >
                        H
                      </text>
                      {/* Rameau délicat qui traverse le H */}
                      <path
                        d="M 50,110 Q 90,75 130,65 Q 115,85 95,115"
                        fill="none"
                        stroke={config.primaryColor}
                        strokeWidth={config.strokeWidth * 1.25}
                        strokeLinecap="round"
                        opacity="0.8"
                      />
                      {/* Typographie */}
                      <text
                        x="185"
                        y="95"
                        fill={previewBg === 'dark' ? '#FAF7F2' : config.textColor}
                        className="logo-title"
                        fontSize="38"
                        letterSpacing={config.tracking === 'widest' ? '0.12em' : '0.04em'}
                      >
                        {config.siteName}
                      </text>
                      {config.showTagline && (
                        <text
                          x="188"
                          y="125"
                          fill={previewBg === 'dark' ? '#C89D5C' : config.accentColor}
                          className="logo-tagline"
                          letterSpacing="0.22em"
                          opacity="0.85"
                        >
                          {config.tagline.toUpperCase()}
                        </text>
                      )}
                    </g>
                  )}

                  {/* Archétype 3 : Boussole & Méridiens Slow Travel */}
                  {config.archetype === 'compass' && (
                    <g transform="translate(10, 10)">
                      <circle
                        cx="90"
                        cy="90"
                        r="64"
                        fill="none"
                        stroke={config.primaryColor}
                        strokeWidth={config.strokeWidth * 1.25}
                      />
                      <circle cx="90" cy="90" r="3" fill={config.accentColor} />
                      {/* Rose des vents en losanges fins */}
                      <path d="M 90,35 L 95,85 L 90,90 L 85,85 Z" fill={config.primaryColor} />
                      <path d="M 90,145 L 95,95 L 90,90 L 85,95 Z" fill={config.primaryColor} opacity="0.6" />
                      <path d="M 35,90 L 85,95 L 90,90 L 85,85 Z" fill={config.accentColor} opacity="0.7" />
                      <path d="M 145,90 L 95,95 L 90,90 L 95,85 Z" fill={config.accentColor} opacity="0.7" />
                      {/* Points cardinaux discrets */}
                      <text x="90" y="30" fill={config.accentColor} fontSize="9" textAnchor="middle" fontWeight="bold">N</text>
                      <text x="90" y="159" fill={config.accentColor} fontSize="9" textAnchor="middle" fontWeight="bold">S</text>
                      {/* Typographie */}
                      <text
                        x="185"
                        y="95"
                        fill={previewBg === 'dark' ? '#FAF7F2' : config.textColor}
                        className="logo-title"
                        fontSize="38"
                        letterSpacing={config.tracking === 'widest' ? '0.12em' : '0.04em'}
                      >
                        {config.siteName}
                      </text>
                      {config.showTagline && (
                        <text
                          x="188"
                          y="125"
                          fill={previewBg === 'dark' ? '#C89D5C' : config.accentColor}
                          className="logo-tagline"
                          letterSpacing="0.22em"
                          opacity="0.85"
                        >
                          {config.tagline.toUpperCase()}
                        </text>
                      )}
                    </g>
                  )}

                  {/* Archétype 4 : Éditorial Épuré & Filet */}
                  {config.archetype === 'editorial' && (
                    <g transform="translate(40, 20)">
                      <text
                        x="0"
                        y="80"
                        fill={previewBg === 'dark' ? '#FAF7F2' : config.textColor}
                        className="logo-title"
                        fontSize="46"
                        letterSpacing={config.tracking === 'widest' ? '0.16em' : '0.08em'}
                      >
                        {config.siteName}
                      </text>
                      {/* Filet décoratif fin */}
                      <line
                        x1="0"
                        y1="102"
                        x2="420"
                        y2="102"
                        stroke={config.primaryColor}
                        strokeWidth={config.strokeWidth * 1.5}
                      />
                      <circle cx="210" cy="102" r="3.5" fill={config.accentColor} />
                      {config.showTagline && (
                        <text
                          x="2"
                          y="130"
                          fill={previewBg === 'dark' ? '#C89D5C' : config.accentColor}
                          className="logo-tagline"
                          letterSpacing="0.26em"
                          opacity="0.9"
                        >
                          {config.tagline.toUpperCase()}
                        </text>
                      )}
                    </g>
                  )}
                </svg>
              </div>
            </div>

            {/* Aperçu en miniatures (Favicon & Avatar) */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
              <span className="font-medium">Aperçus multi-formats :</span>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-sm bg-[#FAF7F2] border border-[#DED5C6] flex items-center justify-center font-serif text-sm font-bold text-eucalyptus">
                    H
                  </div>
                  <span>Favicon 32px</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#DED5C6] flex items-center justify-center font-serif text-base font-bold text-mahogany">
                    H
                  </div>
                  <span>Avatar Profil 40px</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
