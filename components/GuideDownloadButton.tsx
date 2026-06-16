'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import GuideDownloadModal from './GuideDownloadModal'

interface GuideDownloadButtonProps {
  slug: string
  title: string
  variant?: 'default' | 'compact' | 'card'
}

export default function GuideDownloadButton({ slug, title, variant = 'default' }: GuideDownloadButtonProps) {
  const [open, setOpen] = useState(false)

  if (variant === 'card') {
    return (
      <>
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen(true) }}
          className="flex items-center gap-1.5 text-xs text-eucalyptus font-semibold hover:underline"
          title={`Télécharger le guide ${title}`}
        >
          <Download size={12} /> Guide PDF
        </button>
        <GuideDownloadModal destinationSlug={slug} destinationTitle={title} open={open} onClose={() => setOpen(false)} />
      </>
    )
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full bg-eucalyptus px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-eucalyptus/90"
      >
        <Download size={16} /> Télécharger le guide PDF
      </button>
      <GuideDownloadModal destinationSlug={slug} destinationTitle={title} open={open} onClose={() => setOpen(false)} />
    </>
  )
}
