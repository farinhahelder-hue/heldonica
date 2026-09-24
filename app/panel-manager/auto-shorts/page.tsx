'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import VideoStudioNav from '@/components/admin/VideoStudioNav';

const AutoShortsGenerator = dynamic(() => import('@/components/admin/AutoShortsGenerator'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <p style={{ color: '#888' }}>Chargement Auto-Shorts...</p>
    </div>
  ),
});

export default function AutoShortsPage() {
  return (
    <VideoStudioNav>
      <Suspense fallback={null}>
        <AutoShortsGenerator />
      </Suspense>
    </VideoStudioNav>
  );
}
