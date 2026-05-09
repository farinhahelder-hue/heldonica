'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[cms-admin] Error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f3ef',
      padding: '2rem'
    }}>
      <div style={{
        background: 'white',
        padding: '2.5rem',
        borderRadius: '1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,.1)',
        width: '100%',
        maxWidth: 480,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#6b2a1a', marginBottom: '1rem' }}>
          Erreur de chargement
        </h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          Une erreur inattendue s&apos;est produite.
        </p>
        <button
          onClick={reset}
          style={{
            background: '#6b2a1a',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Réessayer
        </button>
      </div>
    </div>
  );
}