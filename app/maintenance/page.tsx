import type { Metadata } from 'next';

// Prevent indexing of maintenance page
export const metadata: Metadata = {
  title: 'En maintenance | Heldonica',
  description: 'Heldonica est temporairement en maintenance. Nous revenons tres vite avec de nouvelles pepites.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MaintenancePage() {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600&family=DM+Sans:wght@400;500;600&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          body {
            background: #f5f3ef;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'DM Sans', -apple-system, sans-serif;
            color: #1a1a1a;
            padding: 2rem;
            position: relative;
            overflow-x: hidden;
          }
          
          body::before {
            content: '';
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background-image: 
              radial-gradient(circle at 20% 30%, #4A7C5908 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, #6b2a1a06 0%, transparent 50%);
            pointer-events: none;
            z-index: 0;
          }
          
          .container {
            max-width: 600px;
            width: 100%;
            text-align: center;
            position: relative;
            z-index: 1;
          }
          
          .logo {
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-size: 1.75rem;
            font-weight: 500;
            color: #6b2a1a;
            margin-bottom: 3rem;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          
          .illustration {
            margin-bottom: 2.5rem;
            animation: float 4s ease-in-out infinite;
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-8px); }
          }
          
          h1 {
            font-family: 'Cormorant Garamond', Georgia, serif;
            font-size: clamp(1.75rem, 5vw, 2.5rem);
            font-weight: 500;
            color: #1a1a1a;
            margin-bottom: 1.5rem;
            line-height: 1.3;
          }
          
          .message-card {
            background: #faf9f7;
            border-radius: 1rem;
            padding: 1.5rem 2rem;
            margin-bottom: 2.5rem;
            border: 1px solid #e8e0d8;
            position: relative;
            overflow: hidden;
            text-align: left;
          }
          
          .message-card::before {
            content: '';
            position: absolute;
            left: 0; top: 0; bottom: 0;
            width: 4px;
            background: linear-gradient(180deg, #6b2a1a, #4A7C59);
          }
          
          .message-card p {
            font-size: 1.0625rem;
            color: #6b635a;
            line-height: 1.7;
          }
          
          .features {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 2.5rem;
            flex-wrap: wrap;
          }
          
          .feature {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: #6b635a;
          }
          
          .feature svg { color: #4A7C59; flex-shrink: 0; }
          
          .social-cta {
            display: inline-flex;
            align-items: center;
            gap: 0.625rem;
            padding: 0.875rem 1.75rem;
            background: #6b2a1a;
            color: #fff;
            text-decoration: none;
            border-radius: 2rem;
            font-weight: 500;
            font-size: 0.9375rem;
            transition: all 0.25s ease;
            box-shadow: 0 4px 12px rgba(107,42,26,0.2);
          }
          
          .social-cta:hover {
            background: #4A7C59;
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(107,42,26,0.3);
          }
          
          .divider {
            width: 60px;
            height: 1px;
            background: #e8e0d8;
            margin: 2.5rem auto;
          }
          
          .footer {
            font-size: 0.8125rem;
            color: #6b635a;
            opacity: 0.7;
          }
          
          .deco-circle {
            position: fixed;
            border-radius: 50%;
            border: 1px solid #e8e0d8;
            opacity: 0.5;
            pointer-events: none;
          }
          
          .deco-1 { width: 300px; height: 300px; top: -100px; right: -100px; }
          .deco-2 { width: 200px; height: 200px; bottom: -50px; left: -50px; }
          
          @media (max-width: 640px) {
            body { padding: 1.5rem; }
            .features { flex-direction: column; gap: 1rem; }
            .message-card { padding: 1.25rem 1.5rem; }
          }
        `}</style>
      </head>
      <body>
        <div className="deco-circle deco-1"></div>
        <div className="deco-circle deco-2"></div>
        
        <main className="container">
          <div className="logo">Heldonica</div>
          
          <div className="illustration">
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="58" stroke="#e8e0d8" strokeWidth="1" fill="none" />
              <circle cx="60" cy="60" r="48" stroke="#6b2a1a" strokeWidth="1.5" fill="none" opacity="0.3" />
              <g transform="translate(60, 65)">
                <path d="M0 -30 Q-5 0 0 25" stroke="#4A7C59" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M0 -30 Q5 0 0 25" stroke="#4A7C59" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <path d="M0 -25 Q-25 -35 -35 -20 Q-20 -25 0 -20" fill="#4A7C59" opacity="0.9" />
                <path d="M0 -25 Q25 -35 35 -20 Q20 -25 0 -20" fill="#4A7C59" opacity="0.9" />
                <path d="M0 -20 Q-30 -15 -38 0 Q-25 -5 0 -10" fill="#6b8c5f" opacity="0.8" />
                <path d="M0 -20 Q30 -15 38 0 Q25 -5 0 -10" fill="#6b8c5f" opacity="0.8" />
                <path d="M0 -15 Q-20 5 -25 15 Q-15 5 0 -5" fill="#4A7C59" opacity="0.7" />
                <path d="M0 -15 Q20 5 25 15 Q15 5 0 -5" fill="#4A7C59" opacity="0.7" />
                <circle cx="-15" cy="-22" r="2" fill="#c4a77d" />
                <circle cx="18" cy="-18" r="1.5" fill="#c4a77d" />
                <circle cx="8" cy="5" r="1.5" fill="#c4a77d" />
              </g>
              <circle cx="30" cy="35" r="2" fill="#4A7C59" opacity="0.4" />
              <circle cx="90" cy="85" r="2.5" fill="#6b2a1a" opacity="0.3" />
              <circle cx="85" cy="40" r="1.5" fill="#c4a77d" opacity="0.5" />
            </svg>
          </div>
          
          <h1>On prepare quelque chose pour toi</h1>
          
          <div className="message-card">
            <p>On prepare quelque chose de nouveau pour toi. On revient tres vite avec de nouvelles destinations et des pepites toutes fraiches.</p>
          </div>
          
          <div className="features">
            <div className="feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Donnees en securite</span>
            </div>
            <div className="feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Bientot de retour</span>
            </div>
          </div>
          
          <a href="https://www.instagram.com/heldonica" className="social-cta" target="_blank" rel="noopener noreferrer">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            Nous suivre sur Instagram
          </a>
          
          <div className="divider"></div>
          <p className="footer">Merci de ta patience 🌿</p>
        </main>
      </body>
    </html>
  );
}
