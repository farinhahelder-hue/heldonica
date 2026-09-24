'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useSiteSettings, SiteSettings } from '@/hooks/useSiteSettings'
import ImageUploadButton from './ImageUploadButton'

export interface SettingField {
  key: string
  label: string
  type: 'text' | 'textarea' | 'email' | 'url' | 'color' | 'toggle' | 'number' | 'image'
  description?: string
  placeholder?: string
}

interface SettingsFormProps {
  fields: SettingField[]
  initialValues: SiteSettings
  section: string
  onSave?: () => void
}

export function SettingsForm({ fields, initialValues, section, onSave }: SettingsFormProps) {
  const { saveMultiple, loading } = useSiteSettings()
  const [values, setValues] = useState<SiteSettings>(initialValues)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setValues(initialValues)
  }, [initialValues])

  const handleChange = (key: string, value: string) => {
    setValues(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setError(null)
    
    try {
      const updates = fields.map(field => ({
        key: field.key,
        value: values[field.key] ?? '',
      }))
      
      const success = await saveMultiple(updates)
      
      if (success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
        onSave?.()
      } else {
        setError('Erreur lors de la sauvegarde')
      }
    } catch (err) {
      setError('Erreur lors de la sauvegarde. Réessaie.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-charcoal">{section}</h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className={`px-5 py-2 rounded-lg font-medium text-sm transition-all ${
            saved
              ? 'bg-eucalyptus/20 text-eucalyptus'
              : 'bg-eucalyptus text-white hover:bg-eucalyptus/90'
          } disabled:opacity-50`}
        >
          {loading ? 'Sauvegarde…' : saved ? '✓ Sauvegardé' : 'Sauvegarder'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-5">
        {fields.map(field => (
          <div key={field.key} className="space-y-1.5">
            <label className="block text-sm font-medium text-charcoal">
              {field.label}
              {field.description && (
                <span className="ml-2 text-xs text-charcoal/50 font-normal">
                  {field.description}
                </span>
              )}
            </label>

            {field.type === 'textarea' && (
              <textarea
                value={values[field.key] ?? ''}
                onChange={e => handleChange(field.key, e.target.value)}
                rows={3}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
              />
            )}

            {field.type === 'toggle' && (
              <label className="flex items-center gap-3 cursor-pointer">
                <button
                  type="button"
                  onClick={() => handleChange(field.key, values[field.key] === 'true' ? 'false' : 'true')}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    values[field.key] === 'true' ? 'bg-eucalyptus' : 'bg-stone-200'
                  }`}
                >
                  <span 
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      values[field.key] === 'true' ? 'translate-x-6' : 'translate-x-1'
                    }`} 
                  />
                </button>
                <span className="text-sm text-charcoal">
                  {values[field.key] === 'true' ? 'Activé' : 'Désactivé'}
                </span>
              </label>
            )}

            {field.type === 'color' && (
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={values[field.key] ?? '#000000'}
                  onChange={e => handleChange(field.key, e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer border border-stone-200"
                />
                <input
                  type="text"
                  value={values[field.key] ?? ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  className="w-32 px-3 py-2 border border-stone-200 rounded-lg text-sm font-mono"
                  placeholder="#000000"
                />
              </div>
            )}

            {field.type === 'image' && (
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input
                    type="url"
                    value={values[field.key] ?? ''}
                    onChange={e => handleChange(field.key, e.target.value)}
                    className="flex-1 px-3 py-2 border border-stone-200 rounded-lg text-sm"
                    placeholder="https://... ou /chemin/local"
                  />
                  <ImageUploadButton
                    onUpload={(url) => handleChange(field.key, url)}
                  />
                </div>
                {values[field.key] && (
                  <div className="relative h-16 w-32 rounded border border-stone-100 bg-stone-50 overflow-hidden">
                    <Image
                      src={values[field.key]}
                      alt="Aperçu"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            )}

            {['text', 'email', 'url', 'number'].includes(field.type) && (
              <input
                type={field.type}
                value={values[field.key] ?? ''}
                onChange={e => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-eucalyptus/30 focus:border-eucalyptus"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}