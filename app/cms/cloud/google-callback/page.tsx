'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function GoogleCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('Traitement en cours...');
  
  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');
    
    if (error) {
      setStatus('❌ Autorisation refusée');
      setTimeout(() => router.push('/cms-admin?error=oauth_denied'), 2000);
      return;
    }
    
    if (code) {
      fetch('/api/cms/cloud/google/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, state }),
      })
      .then(res => res.json())
      .then(data => {
        if (data.success && data.accessToken) {
          localStorage.setItem('google_photos_token', data.accessToken);
          if (data.refreshToken) {
            localStorage.setItem('google_photos_refresh', data.refreshToken);
          }
          setStatus('✅ Connecté ! Redirection...');
          setTimeout(() => router.push('/cms-admin?connected=google'), 1000);
        } else {
          setStatus('❌ Erreur: ' + (data.error || 'inconnue'));
          setTimeout(() => router.push('/cms-admin?error=token_exchange'), 3000);
        }
      })
      .catch(e => {
        setStatus('❌ Erreur de connexion');
        setTimeout(() => router.push('/cms-admin?error=api'), 3000);
      });
    } else {
      setStatus('❌ Code manquant');
      setTimeout(() => router.push('/cms-admin?error=no_code'), 2000);
    }
  }, [searchParams, router]);
  
  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: '#faf8f5',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔄</div>
        <h1 style={{ fontSize: '1.5rem', color: '#333', marginBottom: '0.5rem' }}>
          Connexion Google Photos
        </h1>
        <p style={{ color: '#666', fontSize: '1.1rem' }}>{status}</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <GoogleCallbackContent />
    </Suspense>
  );
}