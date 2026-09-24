import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demande reçue | Heldonica',
  description: "Ton projet de voyage a bien été reçu. On revient vers toi sous 48h pour un échange personnalisé.",
  robots: { index: false, follow: false },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
