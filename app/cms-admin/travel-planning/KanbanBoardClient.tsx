'use client';

import KanbanBoard from '@/components/cms/KanbanBoard';

type DemandeTravel = {
  id: string;
  prenom: string;
  nom: string;
  destination: string;
  budget_fourchette: string;
  statut: string;
  created_at: string;
};

type KanbanBoardClientProps = {
  initialDemandes: DemandeTravel[];
};

export default function KanbanBoardClient({ initialDemandes }: KanbanBoardClientProps) {
  const handleStatutChange = async (id: string, newStatut: string) => {
    const response = await fetch('/api/cms/demandes-travel', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, statut: newStatut }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update statut');
    }
  };

  return (
    <KanbanBoard
      initialDemandes={initialDemandes}
      onStatutChange={handleStatutChange}
    />
  );
}