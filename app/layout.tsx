import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

export const metadata: Metadata = {
  title: 'Heldonica - L\'Expert de l\'Aventure | Slow Travel & Consulting',
  description: 'Slow travel en couple écoresponsable & Consulting hôtelier. Voyages authentiques, itinéraires hors sentiers, expertise RevPAR +30%.',
  keywords: 'slow travel, travel planning, consulting hôtelier, revenue management, voyages en couple',
  authors: [{ name: 'Heldonica' }],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://heldonica.fr',
    siteName: 'Heldonica',
    title: 'Heldonica - L\'Expert de l\'Aventure',
    description: 'Slow travel en couple & Consulting hôtelier',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const gaId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID

  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {gaId && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}');
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="bg-cloud-dancer text-charcoal">
        {children}
      </body>
    </html>
  )
}
