'use client'

import dynamic from 'next/dynamic'

const InteractiveAtlas = dynamic(() => import('@/components/InteractiveAtlas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-96 flex items-center justify-center bg-[#FAF7F2] text-charcoal/50 text-sm">
      Chargement de l&apos;Atlas cartographique...
    </div>
  ),
})

export default function DynamicAtlas() {
  return <InteractiveAtlas />
}
