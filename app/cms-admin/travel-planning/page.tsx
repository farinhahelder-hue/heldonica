import { createServiceClient } from '@/lib/supabase';
import KanbanBoard from '@/components/cms/KanbanBoard';
import KanbanBoardClient from './KanbanBoardClient';

// Colors from spec
const COLORS = {
  primary: '#2D6A4F',
  background: '#F8F5F0',
  accent: '#8B4513',
  teal: '#1A7A7A',
};

type DemandeTravel = {
  id: string;
  prenom: string;
  nom: string;
  destination: string;
  budget_fourchette: string;
  statut: string;
  created_at: string;
};

async function getDemandesTravel(): Promise<DemandeTravel[]> {
  try {
    const supabase = createServiceClient();
    const { data, error } = await supabase
      .from('demandes_travel')
      .select('id, prenom, nom, destination, budget_fourchette, statut, created_at')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching demandes_travel:', error);
      return [];
    }
    
    return data || [];
  } catch (e) {
    console.error('Exception fetching demandes_travel:', e);
    return [];
  }
}

// Loading skeleton
function KanbanSkeleton() {
  return (
    <div className="p-4 md:p-6" style={{ backgroundColor: COLORS.background }}>
      <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-6 bg-gray-200 rounded w-24"></div>
        </div>
        
        {/* Columns skeleton */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="min-w-[280px] max-w-[320px] flex-shrink-0">
              <div className="bg-gray-100 rounded-xl p-4" style={{ backgroundColor: COLORS.background }}>
                <div className="flex justify-between items-center mb-4">
                  <div className="h-6 bg-gray-200 rounded-full w-28"></div>
                  <div className="h-5 bg-gray-200 rounded-full w-6"></div>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="flex justify-between">
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function TravelPlanningKanbanPage() {
  const demandes = await getDemandesTravel();
  
  return (
    <div className="min-h-screen" style={{ backgroundColor: COLORS.background }}>
      {/* Mobile header */}
      <div 
        className="md:hidden px-4 py-3 border-b border-gray-200"
        style={{ backgroundColor: COLORS.primary }}
      >
        <h1 className="text-white text-lg font-bold">Kanban Travel</h1>
      </div>
      
      {/* Desktop header */}
      <div 
        className="hidden md:block px-6 py-4 border-b border-gray-200"
        style={{ backgroundColor: COLORS.primary }}
      >
        <h1 className="text-white text-xl font-bold">✈️ Kanban Travel Planning</h1>
      </div>
      
      {/* Kanban Board */}
      <div className="p-4 md:p-6">
        <KanbanBoardClient initialDemandes={demandes} />
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Kanban Travel Planning | CMS Admin',
};