'use client';

export default function TestPage() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: '#f5f3ef' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ color: '#6b2a1a', fontSize: '2rem' }}>Test Admin</h1>
        <p style={{ color: '#666' }}>Test page</p>
      </div>
    </div>
  );
}
