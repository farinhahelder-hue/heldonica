'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Import dynamique avec ssr: false pour éviter les erreurs ESM/Browser-only sur le serveur
const CmsAdminClient = dynamic(() => import('./CmsAdminClient'), { 
  ssr: false,
  loading: () => (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ef' }}>
      <div style={{ background: 'white', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,.1)', width: '100%', maxWidth: 380, textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>⏳</div>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#6b2a1a' }}>Heldonica CMS</h1>
        <p style={{ color: '#888', fontSize: '.9rem' }}>Chargement de l&apos;interface...</p>
      </div>
    </div>
  )
});

export default function CMSAdminPage() {
  return (
    <Suspense fallback={null}>
      <CmsAdminClient />
    </Suspense>
  );
}
