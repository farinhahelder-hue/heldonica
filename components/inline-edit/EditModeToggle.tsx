'use client'

import { useEditableContext } from './InlineEditProvider'

export default function EditModeToggle() {
  const { isEditing, toggleEditing } = useEditableContext()

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-2 pointer-events-auto">
      {isEditing && (
        <span className="bg-eucalyptus text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md animate-pulse">
          Mode édition actif
        </span>
      )}
      <button
        onClick={toggleEditing}
        className={`flex h-12 w-12 items-center justify-center rounded-full shadow-2xl transition-all duration-300 ${
          isEditing
            ? 'bg-mahogany text-white hover:bg-mahogany/90 rotate-45'
            : 'bg-eucalyptus text-white hover:bg-eucalyptus/90 hover:scale-105'
        }`}
        title={isEditing ? 'Désactiver le mode édition' : 'Activer le mode édition'}
        aria-label={isEditing ? 'Désactiver le mode édition' : 'Activer le mode édition'}
      >
        {isEditing ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
          </svg>
        )}
      </button>
    </div>
  )
}
