'use client';

import { useEffect } from 'react';

/**
 * Force le panneau d'admin en thème clair.
 *
 * Le layout racine pose `dark` sur <html> (préférence OS ou localStorage),
 * mais aucun des 25 écrans de /panel-manager ne déclare de variantes `dark:`.
 * Résultat : panneau illisible en mode sombre. Plutôt qu'un vrai thème
 * (25 écrans à reprendre), on neutralise la classe ici, avec restauration
 * à la sortie pour ne pas fuiter sur le site public.
 */
function readSavedTheme(): 'dark' | 'light' | null {
  try {
    const saved = window.localStorage.getItem('theme');
    if (saved === 'dark' || saved === 'light') return saved;
  } catch {
    /* stockage indisponible : on ne restaure rien */
  }
  return null;
}

export default function ForceLightMode() {
  useEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains('dark');
    root.classList.remove('dark');
    const prevColorScheme = root.style.colorScheme;
    root.style.colorScheme = 'light';
    return () => {
      root.style.colorScheme = prevColorScheme;
      // Ne réapplique `dark` que si c'était l'état d'entrée ou le choix
      // enregistré — jamais par défaut.
      if (hadDark || readSavedTheme() === 'dark') {
        root.classList.add('dark');
      }
    };
  }, []);

  return null;
}
