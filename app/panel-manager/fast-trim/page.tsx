'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import VideoStudioNav from '@/components/admin/VideoStudioNav';

const FastTrimTool = dynamic(() => import('@/components/admin/FastTrimTool'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <p style={{ color: '#888' }}>Chargement Découpe Rapide...</p>
    </div>
  ),
});

export default function FastTrimPage() {
  return (
    <VideoStudioNav>
      <Suspense fallback={null}>
        <FastTrimTool />
      </Suspense>
    </VideoStudioNav>
  );
}
