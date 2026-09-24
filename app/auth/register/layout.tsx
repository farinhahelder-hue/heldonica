import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Créer un compte | Heldonica',
  description: 'Crée ton compte Heldonica pour sauvegarder tes voyages et suivre tes carnets.',
  robots: { index: false, follow: false },
}

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children
}
