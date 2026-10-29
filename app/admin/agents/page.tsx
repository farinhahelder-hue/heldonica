import ConsoleAgents from '@/components/admin/ConsoleAgents'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Console des agents — Admin Heldonica',
  description:
    'Pilotage du suivi des agents : file à valider, fil d’activité du journal système et vue de gouvernance.',
}

export default function AdminAgentsPage() {
  return (
    <div className="space-y-8">
      <ConsoleAgents />
    </div>
  )
}
