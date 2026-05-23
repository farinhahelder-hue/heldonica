'use client'

import dynamic from 'next/dynamic'

const InstagramFeed = dynamic(() => import('./InstagramFeed'), { ssr: false })

export default function HomeClient() {
  return <InstagramFeed />
}
