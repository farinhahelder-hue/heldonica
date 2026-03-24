import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Heldonica - L\'Expert de l\'Aventure | Slow Travel & Consulting',
  description: 'Slow travel en couple écoresponsable & Consulting hôtelier. Voyages authentiques, itinéraires hors sentiers, expertise RevPAR +30%.',
  keywords: 'slow travel, travel planning, consulting hôtelier, revenue management, voyages en couple',
  authors: [{ name: 'Heldonica' }],
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
  return (
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-cloud-dancer text-charcoal">
        {children}
      </body>
    </html>
  )
}
