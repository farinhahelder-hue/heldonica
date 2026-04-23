// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { ReactNode } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion Google - Heldonica',
  robots: 'noindex, nofollow',
};

export default function CloudCallbackLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}