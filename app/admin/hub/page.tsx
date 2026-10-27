import CreatorHub from '@/components/admin/CreatorHub'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Hub Créateur & Suites d’Outils — Admin Heldonica',
  description: 'Accès direct sans reconnexion à Google Search Console, Google Analytics, Meta Business, YouTube Creator, Jules et Supabase.',
}

export default function AdminHubPage() {
  return (
    <div className="space-y-8">
      <CreatorHub />
    </div>
  )
}
