'use client'

import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#F8F6F2', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', maxWidth: '480px', padding: '2rem' }}>
          <svg width="64" height="64" viewBox="0 0 80 80" fill="none" style={{ margin: '0 auto 1.5rem' }}>
            <circle cx="40" cy="40" r="38" stroke="#006D77" strokeWidth="2" strokeDasharray="8 4" />
            <path d="M12 9v4m0 4h.01M12 3l9 16H3L12 3z" stroke="#6B2D1F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" transform="translate(28 24) scale(1)" />
          </svg>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', color: '#6B2D1F', marginBottom: '1rem' }}>
            Une erreur critique s&apos;est produite
          </h1>
          <p style={{ color: '#555', marginBottom: '2rem', lineHeight: 1.6 }}>
            Le chargement de la page a échoué. Tu peux réessayer ou retourner à l&apos;accueil.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={reset}
              style={{ padding: '.75rem 1.5rem', background: '#6B2D1F', color: 'white', border: 'none', borderRadius: '9999px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Réessayer
            </button>
            <Link
              href="/"
              style={{ padding: '.75rem 1.5rem', background: '#006D77', color: 'white', borderRadius: '9999px', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
            >
              Accueil
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
