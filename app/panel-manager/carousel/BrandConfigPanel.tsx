'use client'

import { useState, useEffect } from 'react'
import { HELDONICA_TOKENS, HELDONICA_BRAND, BrandConfig, SlideData } from './tokens'

const STORAGE_KEY = 'heldonica_brand_config'

interface BrandConfigPanelProps {
  slides: SlideData[]
  onApplyConfig: (config: BrandConfig) => void
  onApplyPalette: (palette: typeof HELDONICA_TOKENS.palettes[number]) => void
}

const FONT_TITLE_OPTIONS = [
  { value: "'Playfair Display', Georgia, serif", label: 'Playfair Display' },
  { value: "'Cormorant', Georgia, serif", label: 'Cormorant' },
  { value: "'Lora', Georgia, serif", label: 'Lora' },
]

const FONT_BODY_OPTIONS = [
  { value: "'Inter', -apple-system, sans-serif", label: 'Inter' },
  { value: "'DM Sans', -apple-system, sans-serif", label: 'DM Sans' },
  { value: "'Work Sans', -apple-system, sans-serif", label: 'Work Sans' },
]

const LOGO_POSITION_OPTIONS = [
  { value: 'bottom-left', label: 'Bas gauche' },
  { value: 'bottom-right', label: 'Bas droite' },
  { value: 'bottom-center', label: 'Bas centre' },
]

export default function BrandConfigPanel({ slides, onApplyConfig, onApplyPalette }: BrandConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'palettes' | 'keywords' | 'options'>('colors')
  const [config, setConfig] = useState<BrandConfig>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        try { return { ...HELDONICA_BRAND, ...JSON.parse(saved) } } 
        catch { return HELDONICA_BRAND }
      }
    }
    return HELDONICA_BRAND
  })

  // Save to localStorage on config change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    }
  }, [config])

  const handleApply = () => {
    onApplyConfig(config)
  }

  const tabs = [
    { id: 'colors', label: '🎨', title: 'Couleurs' },
    { id: 'palettes', label: '✨', title: 'Palettes' },
    { id: 'keywords', label: '#️⃣', title: 'Keywords' },
    { id: 'options', label: '⚙️', title: 'Options' },
  ] as const

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-stone-200 bg-gradient-to-r from-[#6b2a1a] to-[#4a7c59]">
        <h3 className="font-semibold text-white text-sm">🏷️ Config Marque Heldonica</h3>
        <p className="text-xs text-white/80">Personnalisation et styles</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-[#6b2a1a] border-b-2 border-[#6b2a1a]'
                : 'text-stone-500 hover:text-stone-700'
            }`}
            title={tab.title}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 max-h-80 overflow-y-auto">
        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <p className="text-xs text-stone-500 mb-3">Couleurs principales de la marque</p>
            
            {Object.entries(config.colors).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <div 
                  className="w-8 h-8 rounded-lg border border-stone-200 shadow-inner"
                  style={{ backgroundColor: value }}
                />
                <div className="flex-1">
                  <label className="text-xs font-medium text-stone-600 capitalize">
                    {key === 'background' ? 'Fond' : 
                     key === 'primary' ? 'Primaire' : 
                     key === 'secondary' ? 'Secondaire' : 
                     key === 'accent' ? 'Accent' : 'Texte'}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setConfig({
                      ...config,
                      colors: { ...config.colors, [key]: e.target.value }
                    })}
                    className="w-full text-xs font-mono bg-stone-50 border border-stone-200 rounded px-2 py-1 mt-1"
                  />
                </div>
                <input
                  type="color"
                  value={value}
                  onChange={(e) => setConfig({
                    ...config,
                    colors: { ...config.colors, [key]: e.target.value }
                  })}
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </div>
            ))}

            <button
              onClick={() => onApplyConfig(HELDONICA_BRAND)}
              className="w-full px-3 py-2 text-xs bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
            >
              ↺ Reset vers Heldonica
            </button>
          </div>
        )}

        {/* Palettes Tab */}
        {activeTab === 'palettes' && (
          <div className="space-y-3">
            <p className="text-xs text-stone-500 mb-2">Palettes prédéfinies</p>
            
            <div className="grid grid-cols-2 gap-2">
              {HELDONICA_TOKENS.palettes.map((palette) => (
                <button
                  key={palette.name}
                  onClick={() => onApplyPalette(palette)}
                  className="p-3 border border-stone-200 rounded-xl hover:border-[#83C5BE] hover:bg-[#83C5BE]/5 transition-colors text-left"
                >
                  <div className="flex gap-1 mb-2">
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: palette.bg }} />
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: palette.accent }} />
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: palette.text }} />
                  </div>
                  <span className="text-xs font-medium text-stone-700">{palette.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Keywords Tab */}
        {activeTab === 'keywords' && (
          <div className="space-y-3">
            <p className="text-xs text-stone-500 mb-2">Keywords pour génération IA</p>
            
            <div className="flex flex-wrap gap-1.5">
              {config.keywords.map((keyword) => (
                <span 
                  key={keyword}
                  className="px-2 py-1 bg-[#83C5BE]/10 text-[#4a7c59] text-xs rounded-full"
                >
                  {keyword}
                </span>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-100">
              <p className="text-xs text-stone-400 mb-2">Style keywords ajoutés :</p>
              <div className="flex flex-wrap gap-1">
                {['slow travel', 'éco-luxe', 'couple', 'hors sentiers battus'].map((k) => (
                  <button
                    key={k}
                    onClick={() => !config.keywords.includes(k) && setConfig({
                      ...config,
                      keywords: [...config.keywords, k]
                    })}
                    className="px-2 py-1 text-xs bg-stone-100 text-stone-500 rounded-full hover:bg-stone-200"
                  >
                    + {k}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Options Tab */}
        {activeTab === 'options' && (
          <div className="space-y-4">
            {/* Font Title */}
            <div>
              <label className="text-xs text-stone-600 mb-1 block">Police titre</label>
              <select
                value={config.fonts.title}
                onChange={(e) => setConfig({ ...config, fonts: { ...config.fonts, title: e.target.value } })}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white"
              >
                {FONT_TITLE_OPTIONS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Font Body */}
            <div>
              <label className="text-xs text-stone-600 mb-1 block">Police corps</label>
              <select
                value={config.fonts.body}
                onChange={(e) => setConfig({ ...config, fonts: { ...config.fonts, body: e.target.value } })}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white"
              >
                {FONT_BODY_OPTIONS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Logo URL */}
            <div>
              <label className="text-xs text-stone-600 mb-1 block">Logo URL</label>
              <input
                type="text"
                value={config.logoUrl || ''}
                onChange={(e) => setConfig({ ...config, logoUrl: e.target.value || undefined })}
                placeholder="/logo.png"
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg"
              />
            </div>

            {/* Logo Position */}
            <div>
              <label className="text-xs text-stone-600 mb-1 block">Position logo</label>
              <select
                value={config.logoPosition || 'bottom-left'}
                onChange={(e) => setConfig({ ...config, logoPosition: e.target.value as any })}
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white"
              >
                {LOGO_POSITION_OPTIONS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Default Hashtags */}
            <div>
              <label className="text-xs text-stone-600 mb-1 block">Hashtags par défaut</label>
              <input
                type="text"
                value={config.defaultHashtags || ''}
                onChange={(e) => setConfig({ ...config, defaultHashtags: e.target.value })}
                placeholder="#slowtravel #heldonica"
                className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg"
              />
            </div>

            {/* Faceless Toggle */}
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-stone-700">Mode Faceless</p>
                <p className="text-xs text-stone-500">Pas de visages</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.faceless}
                  onChange={(e) => setConfig({ ...config, faceless: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#6b2a1a] after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-stone-200 bg-stone-50">
        <button
          onClick={handleApply}
          className="w-full px-4 py-2 text-sm bg-[#6b2a1a] text-white rounded-xl hover:bg-[#6b2a1a]/90 transition-colors"
        >
          ✓ Appliquer la config
        </button>
      </div>
    </div>
  )
}