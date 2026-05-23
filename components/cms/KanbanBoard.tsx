'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

// Colors from spec
const COLORS = {
  primary: '#2D6A4F',
  background: '#F8F5F0',
  accent: '#8B4513',
  teal: '#1A7A7A',
};

// Status configuration
const COLUMNS_CONFIG: Record<string, { label: string; badgeColor: string; textColor: string }> = {
  nouvelle_demande: { label: 'Nouvelle demande', badgeColor: '#3B82F6', textColor: '#FFFFFF' },
  en_cours: { label: 'En cours', badgeColor: '#F59E0B', textColor: '#FFFFFF' },
  devis_envoye: { label: 'Devis envoyé', badgeColor: '#F97316', textColor: '#FFFFFF' },
  confirme: { label: 'Confirmé', badgeColor: '#10B981', textColor: '#FFFFFF' },
  archive: { label: 'Archivé', badgeColor: '#6B7280', textColor: '#FFFFFF' },
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

type KanbanBoardProps = {
  initialDemandes: DemandeTravel[];
  onStatutChange: (id: string, newStatut: string) => Promise<void>;
};

function getDaysSince(dateStr: string): number {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// Sortable card component
function SortableCard({
  demande,
  isDragging,
}: {
  demande: DemandeTravel;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: demande.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  const daysSince = getDaysSince(demande.created_at);

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: 'white',
        borderRadius: '0.75rem',
        padding: '1rem',
        boxShadow: isDragging
          ? '0 8px 24px rgba(0,0,0,0.15)'
          : '0 1px 4px rgba(0,0,0,0.08)',
        marginBottom: '0.75rem',
        border: '1px solid #e8e3dc',
        position: 'relative',
      }}
      {...attributes}
      {...listeners}
    >
      {/* Drag handle */}
      <div
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.5rem',
          color: '#ccc',
          cursor: 'grab',
          padding: '0.25rem',
        }}
      >
        <GripVertical size={16} />
      </div>

      {/* Client name */}
      <div
        style={{
          fontWeight: 700,
          fontSize: '0.95rem',
          color: '#1a1a1a',
          marginBottom: '0.5rem',
          paddingRight: '1.5rem',
        }}
      >
        {demande.prenom} {demande.nom}
      </div>

      {/* Destination */}
      <div
        style={{
          fontSize: '0.85rem',
          color: COLORS.teal,
          marginBottom: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
        }}
      >
        <span>📍</span>
        {demande.destination || 'Non renseigné'}
      </div>

      {/* Budget and days */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.8rem',
          color: '#888',
          marginTop: '0.5rem',
          paddingTop: '0.5rem',
          borderTop: '1px solid #f0f0f0',
        }}
      >
        <span style={{ color: COLORS.accent, fontWeight: 600 }}>
          💰 {demande.budget_fourchette || 'N/A'}
        </span>
        <span style={{ color: daysSince > 7 ? '#dc2626' : '#888' }}>
          {daysSince}j ago
        </span>
      </div>
    </div>
  );
}

// Draggable card for overlay
function DragCard({ demande }: { demande: DemandeTravel }) {
  const daysSince = getDaysSince(demande.created_at);

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '1rem',
        boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
        width: '280px',
        cursor: 'grabbing',
      }}
    >
      <div
        style={{
          fontWeight: 700,
          fontSize: '0.95rem',
          color: '#1a1a1a',
          marginBottom: '0.5rem',
        }}
      >
        {demande.prenom} {demande.nom}
      </div>
      <div
        style={{
          fontSize: '0.85rem',
          color: COLORS.teal,
          marginBottom: '0.5rem',
        }}
      >
        📍 {demande.destination || 'Non renseigné'}
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          color: '#888',
        }}
      >
        <span style={{ color: COLORS.accent, fontWeight: 600 }}>
          💰 {demande.budget_fourchette || 'N/A'}
        </span>
        <span>{daysSince}j ago</span>
      </div>
    </div>
  );
}

// Column component
function Column({
  columnId,
  config,
  demandes,
  isOver,
}: {
  columnId: string;
  config: { label: string; badgeColor: string; textColor: string };
  demandes: DemandeTravel[];
  isOver: boolean;
}) {
  return (
    <div
      style={{
        minWidth: '280px',
        maxWidth: '320px',
        flexShrink: 0,
        background: isOver ? '#f0f9f0' : '#faf8f5',
        borderRadius: '1rem',
        padding: '1rem',
        border: `2px dashed ${isOver ? COLORS.primary : '#e8e3dc'}`,
        transition: 'background 0.2s ease',
      }}
    >
      {/* Column header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '2px solid #e8e3dc',
        }}
      >
        <span
          style={{
            background: config.badgeColor,
            color: config.textColor,
            padding: '0.35rem 0.75rem',
            borderRadius: '9999px',
            fontSize: '0.8rem',
            fontWeight: 600,
          }}
        >
          {config.label}
        </span>
        <span
          style={{
            background: '#f0e8e4',
            color: '#6b2a1a',
            padding: '0.2rem 0.6rem',
            borderRadius: '9999px',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}
        >
          {demandes.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext
        items={demandes.map(d => d.id)}
        strategy={verticalListSortingStrategy}
      >
        {demandes.map(demande => (
          <SortableCard key={demande.id} demande={demande} />
        ))}
      </SortableContext>

      {demandes.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            color: '#bbb',
            fontSize: '0.85rem',
          }}
        >
          Glissez une demande ici
        </div>
      )}
    </div>
  );
}

export default function KanbanBoard({ initialDemandes, onStatutChange }: KanbanBoardProps) {
  const [demandes, setDemandes] = useState<DemandeTravel[]>(initialDemandes);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Group demandes by statut
  const groupedDemandes = useMemo(() => {
    const groups: Record<string, DemandeTravel[]> = {};
    Object.keys(COLUMNS_CONFIG).forEach(key => {
      groups[key] = [];
    });
    demandes.forEach(d => {
      if (groups[d.statut]) {
        groups[d.statut].push(d);
      }
    });
    return groups;
  }, [demandes]);

  const activeDemande = useMemo(
    () => demandes.find(d => d.id === activeId),
    [demandes, activeId]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragEndEvent) => {
    const { over } = event;
    setOverId(over?.id as string || null);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      setOverId(null);

      if (!over) return;

      const activeDemandeId = active.id as string;
      const overId = over.id as string;

      // Find the target statut (column ID)
      let targetStatut = overId;

      // Check if over.id is a demande ID
      const overDemande = demandes.find(d => d.id === overId);
      if (overDemande) {
        targetStatut = overDemande.statut;
      }

      // Check if over.id matches a column
      if (!COLUMNS_CONFIG[targetStatut]) {
        // It's a column id
        targetStatut = overId;
      }

      // Find the active demande
      const activeDemandeItem = demandes.find(d => d.id === activeDemandeId);
      if (!activeDemandeItem || !COLUMNS_CONFIG[targetStatut]) return;

      // If same statut, no update needed
      if (activeDemandeItem.statut === targetStatut) return;

      // Optimistic update
      setDemandes(prev =>
        prev.map(d =>
          d.id === activeDemandeId ? { ...d, statut: targetStatut } : d
        )
      );

      // Persist to server
      setUpdatingIds(prev => new Set(prev).add(activeDemandeId));
      try {
        await onStatutChange(activeDemandeId, targetStatut);
      } catch (error) {
        // Revert on error
        setDemandes(prev =>
          prev.map(d =>
            d.id === activeDemandeId ? { ...d, statut: activeDemandeItem.statut } : d
          )
        );
        console.error('Failed to update statut:', error);
      } finally {
        setUpdatingIds(prev => {
          const next = new Set(prev);
          next.delete(activeDemandeId);
          return next;
        });
      }
    },
    [demandes, onStatutChange]
  );

  return (
    <div>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <h2
          style={{
            fontSize: '1.2rem',
            fontWeight: 700,
            color: COLORS.accent,
          }}
        >
          ✈️ Kanban Travel Planning
        </h2>
        <span
          style={{
            fontSize: '0.85rem',
            color: '#888',
          }}
        >
          Total: {demandes.length} demandes
        </span>
      </div>

      {/* Kanban board */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          paddingBottom: '1rem',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          {Object.entries(COLUMNS_CONFIG).map(([statut, config]) => (
            <SortableContext
              key={statut}
              items={[statut]}
              strategy={horizontalListSortingStrategy}
            >
              <Column
                columnId={statut}
                config={config}
                demandes={groupedDemandes[statut] || []}
                isOver={overId === statut}
              />
            </SortableContext>
          ))}

          <DragOverlay>
            {activeDemande ? <DragCard demande={activeDemande} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: '#faf8f5',
          borderRadius: '0.75rem',
          fontSize: '0.8rem',
          color: '#888',
        }}
      >
        <strong>💡 Astuce :</strong> Glissez les cartes pour changer leur statut.
        Les modifications sont sauvegardées automatiquement.
      </div>
    </div>
  );
}