import { supabase } from '@/lib/supabase-client'
import { SettingsForm } from '@/components/admin/SettingsForm'
import { SettingField } from '@/components/admin/SettingsForm'
import type { SiteSettings } from '@/hooks/useSiteSettings'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const { data: settingsRows } = await supabase
    .from('site_settings')
    .select('key, value')

  const settings: SiteSettings = {}
  settingsRows?.forEach((s: { key: string; value: string }) => {
    settings[s.key] = s.value || ''
  })

  const sections = [
    {
      id: 'identity',
      label: '🎨 Identité visuelle',
      fields: [
        { key: 'logo_url', label: 'Logo URL', type: 'image', description: 'URL publique ou chemin local' },
        { key: 'favicon_url', label: 'Favicon URL', type: 'image', description: 'Format .ico ou .png 32x32' },
        { key: 'og_image', label: 'Image OG (partage réseaux)', type: 'image' },
        { key: 'primary_color', label: 'Couleur principale', type: 'color', description: 'Couleur de marque' },
        { key: 'secondary_color', label: 'Couleur secondaire', type: 'color' },
        { key: 'accent_color', label: 'Couleur accent', type: 'color' },
        { key: 'bg_color', label: 'Couleur fond', type: 'color' },
      ] as SettingField[],
    },
    {
      id: 'hero',
      label: '🏠 Hero section',
      fields: [
        { key: 'hero_title', label: 'Titre hero', type: 'text' },
        { key: 'hero_subtitle', label: 'Sous-titre hero', type: 'textarea' },
        { key: 'hero_cta_text', label: 'Texte du bouton CTA', type: 'text' },
        { key: 'hero_cta_url', label: 'URL du bouton CTA', type: 'url' },
      ] as SettingField[],
    },
    {
      id: 'seo',
      label: '🔍 SEO global',
      fields: [
        { key: 'seo_meta_description', label: 'Meta description', type: 'textarea', description: '120-160 caractères recommandés' },
        { key: 'seo_og_image', label: 'Image Open Graph', type: 'image' },
        { key: 'seo_google_analytics_id', label: 'Google Analytics ID', type: 'text', description: 'Format: G-XXXXXXXXXX', placeholder: 'G-JDJNTZLBJS' },
        { key: 'seo_gtm_id', label: 'GTM ID', type: 'text', description: 'Format: GTM-XXXXXX', placeholder: 'GTM-XXXXXX' },
      ] as SettingField[],
    },
    {
      id: 'contact',
      label: '📞 Contact & Réseaux',
      fields: [
        { key: 'contact_email', label: 'Email contact principal', type: 'email', placeholder: 'info@heldonica.fr' },
        { key: 'footer_contact_email', label: 'Email affiché dans le footer', type: 'email' },
        { key: 'instagram_url', label: 'URL Instagram', type: 'url', placeholder: 'https://www.instagram.com/heldonica' },
        { key: 'instagram_handle', label: 'Handle Instagram', type: 'text', placeholder: '@heldonica' },
        { key: 'linkedin_url', label: 'URL LinkedIn', type: 'url' },
        { key: 'facebook_url', label: 'URL Facebook', type: 'url' },
        { key: 'youtube_url', label: 'URL YouTube', type: 'url' },
      ] as SettingField[],
    },
    {
      id: 'footer',
      label: '📄 Footer',
      fields: [
        { key: 'footer_text', label: 'Texte descriptif footer', type: 'textarea' },
        { key: 'footer_copyright', label: 'Texte copyright', type: 'text', placeholder: '© 2025 Heldonica. Tous droits réservés.' },
      ] as SettingField[],
    },
    {
      id: 'system',
      label: '⚙️ Système',
      fields: [
        { key: 'maintenance_mode', label: 'Mode maintenance', type: 'toggle', description: 'Affiche la page de maintenance' },
        { key: 'covered_countries', label: 'Nombre de pays couverts', type: 'number', description: 'Pour affichage statistiques' },
      ] as SettingField[],
    },
  ]

  return (
    <div className="space-y-8">
      {sections.map(section => (
        <section 
          key={section.id} 
          id={section.id} 
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-100"
        >
          <SettingsForm
            section={section.label}
            fields={section.fields}
            initialValues={settings}
          />
        </section>
      ))}
    </div>
  )
}