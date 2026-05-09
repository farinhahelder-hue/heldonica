'use client';

import { Suspense } from 'react';

function CMSAdminInner() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f5f3ef' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#6b2a1a', fontSize: '2rem' }}>Heldonica CMS</h1>
        <p style={{ color: '#666' }}>Simple test page</p>
      </div>
    </div>
  );
}

export default function CMSAdmin() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f3ef' }}>
        <div style={{ background: 'white', padding: '2.5rem', borderRadius: '1rem', boxShadow: '0 8px 32px rgba(0,0,0,.1)', width: '100%', maxWidth: 380, textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>⏳</div>
          <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#6b2a1a' }}>Heldonica CMS</h1>
          <p style={{ color: '#888', fontSize: '.9rem' }}>Chargement…</p>
        </div>
      </div>
    }>
      <CMSAdminInner />
    </Suspense>
  );
}