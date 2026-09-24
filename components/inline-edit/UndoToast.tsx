'use client'

import { useEffect, useState } from 'react'
import { useEditableContext } from './InlineEditProvider'

export default function UndoToast() {
  const { undoAction, clearUndo, updateZone } = useEditableContext()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (undoAction) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        // Delay clearing state to allow transition out
        setTimeout(clearUndo, 300)
      }, 5000)

      return () => clearTimeout(timer)
    } else {
      setVisible(false)
    }
  }, [undoAction, clearUndo])

  if (!undoAction) return null

  const handleUndo = async () => {
    setVisible(false)
    await updateZone(undoAction.page, undoAction.zone, undoAction.previousValue)
    clearUndo()
  }

  return (
    <div
      className={`fixed bottom-6 left-6 z-[9999] flex items-center justify-between gap-4 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-2xl transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      <span className="text-sm font-medium">Zone modifiée</span>
      <button
        onClick={handleUndo}
        className="text-xs font-bold text-eucalyptus uppercase tracking-wider hover:brightness-110 border border-eucalyptus/30 px-2.5 py-1 rounded bg-eucalyptus/10 transition"
      >
        Annuler
      </button>
    </div>
  )
}
