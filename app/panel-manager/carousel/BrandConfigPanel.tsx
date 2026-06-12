'use client'

import { useState } from 'react'
import { HELDONICA_TOKENS, HELDONICA_BRAND, BrandConfig, SlideData } from './tokens'

interface BrandConfigPanelProps {
  slides: SlideData[]
  onApplyConfig: (config: BrandConfig) => void
  onApplyPalette: (palette: typeof HELDONICA_TOKENS.palettes[0]) => void
}

export default function BrandConfigPanel({ slides, onApplyConfig, onApplyPalette }: BrandConfigPanelProps) {
  const [activeTab, setActiveTab] = useState<'colors' | 'palettes' | 'keywords' | 'options'>('colors')
  const [config, setConfig] = useState<BrandConfig>(HELDONICA_BRAND)

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
            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-stone-700">Mode Faceless</p>
                <p className="text-xs text-stone-500">Pas de visages dans les images</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.faceless}
                  onChange={(e) => setConfig({ ...config, faceless: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#6b2a1a]/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6b2a1a]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-stone-700">Logo en overlay</p>
                <p className="text-xs text-stone-500">Bas de slide avec branding</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!config.logoUrl}
                  onChange={(e) => setConfig({ ...config, logoUrl: e.target.checked ? '/logo.png' : undefined })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#6b2a1a]/30 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6b2a1a]"></div>
              </label>
            </div>

            <div className="pt-2">
              <p className="text-xs text-stone-500 mb-2">Fonts</p>
              <div className="p-3 bg-stone-50 rounded-xl space-y-2">
                <div>
                  <label className="text-xs text-stone-600">Titres (serif)</label>
                  <p className="text-sm font-serif" style={{ fontFamily: config.fonts.title }}>
                    {config.fonts.title.split(',')[0]}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-stone-600">Corps (sans-serif)</label>
                  <p className="text-sm" style={{ fontFamily: config.fonts.body }}>
                    {config.fonts.body.split(',')[0]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-stone-200 bg-stone-50">
        <button
          onClick={() => onApplyConfig(config)}
          className="w-full px-4 py-2 text-sm bg-[#6b2a1a] text-white rounded-xl hover:bg-[#6b2a1a]/90 transition-colors"
        >
          ✓ Appliquer la config
        </button>
      </div>
    </div>
  )
}