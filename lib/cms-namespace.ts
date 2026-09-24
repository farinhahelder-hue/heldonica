/**
 * Devine le namespace CMS (`page`) d'une zone éditable depuis un chemin de site.
 *
 * Convention observée dans le code : `getPageZones('destinations-roumanie-sibiu')`
 * pour `/destinations/roumanie/sibiu`. Utilisé par l'éditeur avancé pour
 * pré-remplir l'inspecteur de zones depuis l'URL affichée dans l'iframe.
 * Retourne null quand aucun namespace plausible (racine gérée à part).
 */
export function pathToNamespace(path: string): string | null {
  const clean = path.split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '');
  if (!clean) return 'home';
  const slug = clean
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || null;
}
