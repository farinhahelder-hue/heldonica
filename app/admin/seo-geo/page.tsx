import SeoGeoEngine from '@/components/admin/SeoGeoEngine'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Moteur SEO Géo & Cocon Sémantique — Admin Heldonica',
  description: 'Audit et optimisation du ranking local, balisage Schema.org TouristTrip/Breadcrumb et coordonnées OpenStreetMap.',
}

export default function AdminSeoGeoPage() {
  return (
    <div className="space-y-8">
      <SeoGeoEngine />
    </div>
  )
}
