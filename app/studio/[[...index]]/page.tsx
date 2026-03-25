'use client'

import dynamic from 'next/dynamic'
import { config } from '@/sanity.config'

const Studio = dynamic(() => import('sanity').then(mod => ({ default: mod.Studio })), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center min-h-screen">Chargement du Studio...</div>,
})

export default function StudioPage() {
  return <Studio config={config} />
}
