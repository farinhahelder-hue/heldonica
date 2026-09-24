import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Connexion | Heldonica',
  description: 'Connecte-toi à ton espace Heldonica pour retrouver tes voyages sauvegardés.',
  robots: { index: false, follow: false },
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
