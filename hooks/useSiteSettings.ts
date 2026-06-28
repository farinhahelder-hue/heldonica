'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase-client'

export interface SiteSettings {
  [key: string]: string
}

export function useSiteSettings() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getSettings = useCallback(async (keys?: string[]): Promise<SiteSettings> => {
    try {
      let query = supabase.from('site_settings').select('key, value')
      
      if (keys && keys.length > 0) {
        query = query.in('key', keys)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      const settings: SiteSettings = {}
      data?.forEach((s: { key: string; value: string }) => {
        settings[s.key] = s.value || ''
      })

      return settings
    } catch (err) {
      console.error('Error fetching settings:', err)
      return {}
    }
  }, [supabase])

  const updateSetting = useCallback(async (key: string, value: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ 
          value, 
          updated_at: new Date().toISOString() 
        })
        .eq('key', key)

      if (updateError) throw updateError
      return true
    } catch (err) {
      console.error('Error updating setting:', err)
      setError('Erreur lors de la mise à jour')
      return false
    }
  }, [supabase])

  const upsertSetting = useCallback(async (key: string, value: string): Promise<boolean> => {
    try {
      const { error: upsertError } = await supabase
        .from('site_settings')
        .upsert({ 
          key, 
          value, 
          updated_at: new Date().toISOString() 
        }, { 
          onConflict: 'key' 
        })

      if (upsertError) throw upsertError
      return true
    } catch (err) {
      console.error('Error upserting setting:', err)
      setError('Erreur lors de la sauvegarde')
      return false
    }
  }, [supabase])

  const saveMultiple = useCallback(async (updates: { key: string; value: string }[]): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const updatesWithTimestamp = updates.map(u => ({
        key: u.key,
        value: u.value,
        updated_at: new Date().toISOString()
      }))

      const { error: upsertError } = await supabase
        .from('site_settings')
        .upsert(updatesWithTimestamp, { onConflict: 'key' })

      if (upsertError) throw upsertError
      return true
    } catch (err) {
      console.error('Error saving multiple settings:', err)
      setError('Erreur lors de la sauvegarde')
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return {
    getSettings,
    updateSetting,
    upsertSetting,
    saveMultiple,
    loading,
    error,
    clearError: () => setError(null)
  }
}