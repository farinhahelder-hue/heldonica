import AgentTaskGiver from '@/components/admin/AgentTaskGiver'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Donneur de Tâches IA & Jules — Admin Heldonica',
  description: 'Distribution de tâches autonomes vers Google Jules et les modèles IA gratuits de l’environnement.',
}

export default function AdminTaskGiverPage() {
  return (
    <div className="space-y-8">
      <AgentTaskGiver />
    </div>
  )
}
