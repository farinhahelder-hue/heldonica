'use client';

import dynamic from 'next/dynamic';

const CmsAdminContent = dynamic(
  () => Promise.resolve(() => (
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
  )),
  { ssr: false }
);

export default function CMSAdmin() {
  return <CmsAdminContent />;
}
