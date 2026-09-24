'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import VideoStudioNav from '@/components/admin/VideoStudioNav';

const SubtitlesEditor = dynamic(() => import('@/components/admin/SubtitlesEditor'), {
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <p style={{ color: '#888' }}>Chargement Sous-titres IA...</p>
    </div>
  ),
});

export default function SubtitlesPage() {
  return (
    <VideoStudioNav>
      <Suspense fallback={null}>
        <SubtitlesEditor />
      </Suspense>
    </VideoStudioNav>
  );
}
