/**
 * Témoignages clients publiés : `cms_testimonials`, lignes actives.
 *
 * C'est la seule source : les témoignages de repli codés en dur ont été retirés
 * parce qu'inventés. Tant que la table n'en contient aucun, /temoignages reste
 * consultable mais sort de l'index et du sitemap : vide, elle promettait
 * « Leurs voyages, nos preuves » sans rien montrer.
 */

import { createServiceClient } from '@/lib/supabase'

export async function getActiveTestimonials() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('cms_testimonials')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching testimonials:', error)
    return []
  }
}
