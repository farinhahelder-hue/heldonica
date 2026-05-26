import type { Metadata } from 'next';

// Prevent indexing of maintenance page
export const metadata: Metadata = {
  title: 'En maintenance — Heldonica',
  robots: {
    index: false,
    follow: false,
  },
};

// Default message if no custom message from cookie
const DEFAULT_MESSAGE = 'On revient très vite avec de nouvelles pépites ! 🌿';

export default async function MaintenancePage() {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            background: #f5f3ef;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'DM Sans', system-ui, sans-serif;
            color: #1a1a1a;
            padding: 1.5rem;
          }
          .container {
            max-width: 500px;
            width: 100%;
            text-align: center;
          }
          .logo {
            font-family: 'Playfair Display', serif;
            font-size: 2rem;
            font-weight: 600;
            color: #6b2a1a;
            margin-bottom: 2.5rem;
            letter-spacing: 0.02em;
          }
          .icon-container {
            margin-bottom: 2rem;
          }
          .icon {
            display: inline-block;
            animation: float 3s ease-in-out infinite;
          }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          h1 {
            font-family: 'Playfair Display', serif;
            font-size: 2rem;
            font-weight: 500;
            color: #1a1a1a;
            margin-bottom: 1.5rem;
            line-height: 1.3;
          }
          .message {
            font-size: 1.125rem;
            color: #555;
            line-height: 1.7;
            margin-bottom: 2.5rem;
            padding: 1.25rem;
            background: #faf9f7;
            border-radius: 0.75rem;
            border-left: 3px solid #6b2a1a;
            text-align: left;
          }
          .cta {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.875rem 1.5rem;
            background: #6b2a1a;
            color: #fff;
            text-decoration: none;
            border-radius: 0.5rem;
            font-weight: 500;
            font-size: 0.9375rem;
            transition: background 0.2s ease, transform 0.2s ease;
          }
          .cta:hover {
            background: #7a3220;
            transform: translateY(-2px);
          }
          .divider {
            width: 40px;
            height: 2px;
            background: #e8e0d8;
            margin: 2rem auto;
          }
          .footer-note {
            font-size: 0.8125rem;
            color: #888;
            margin-top: 2rem;
          }
          @media (max-width: 480px) {
            .logo {
              font-size: 1.75rem;
            }
            h1 {
              font-size: 1.625rem;
            }
            .message {
              font-size: 1rem;
            }
          }
        `}</style>
      </head>
      <body>
        <main className="container">
          <div className="logo">Heldonica</div>
          
          <div className="icon-container">
            <span className="icon" role="img" aria-label="Feuille de palmier">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="31" stroke="#6b2a1a" strokeWidth="2" fill="none"/>
                <path 
                  d="M32 48C32 48 18 38 18 26C18 18 24 14 32 18C40 22 46 30 46 38C46 44 40 48 32 48Z" 
                  fill="#4A7C59" 
                  stroke="#6b2a1a" 
                  strokeWidth="1.5"
                />
                <path 
                  d="M32 18V48" 
                  stroke="#6b2a1a" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                />
                <path 
                  d="M32 24C26 22 22 26 22 26" 
                  stroke="#6b2a1a" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                  fill="none"
                />
                <path 
                  d="M32 32C38 30 42 34 42 34" 
                  stroke="#6b2a1a" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                  fill="none"
                />
                <path 
                  d="M32 40C26 38 22 40 22 40" 
                  stroke="#6b2a1a" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </span>
          </div>

          <h1>On prépare quelque chose pour toi…</h1>

          <div className="message">
            {DEFAULT_MESSAGE}
          </div>

          <a 
            href="https://www.instagram.com/heldonica" 
            className="cta"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Suivre nos aventures sur Instagram"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Suivre nos aventures
          </a>

          <div className="divider"></div>

          <p className="footer-note">
            Merci de ta patience 🌿
          </p>
        </main>
      </body>
    </html>
  );
}