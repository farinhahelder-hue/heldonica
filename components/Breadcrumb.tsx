'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumb() {
  const pathname = usePathname();

  // Ne pas afficher sur la page d'accueil
  if (pathname === '/') {
    return null;
  }

  // Générer les segments du breadcrumb
  const segments = pathname.split('/').filter(Boolean);
  
  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    ...segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/');
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { label, href };
    }),
  ];

  // Cas spéciaux pour les pages de détail
  const breadcrumbsWithNames = breadcrumbs.map((crumb, index) => {
    if (index === breadcrumbs.length - 1 && segments.length > 1) {
      // Dernière page (détail)
      const lastSegment = segments[segments.length - 1];
      
      // Décoder l'URL et formater le titre
      const decodedSegment = decodeURIComponent(lastSegment);
      const formattedLabel = decodedSegment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return { ...crumb, label: formattedLabel };
    }
    
    // Noms personnalisés pour les pages principales
    if (crumb.href === '/blog') return { ...crumb, label: 'Blog' };
    if (crumb.href === '/destinations') return { ...crumb, label: 'Destinations' };
    if (crumb.href === '/travel-planning-form') return { ...crumb, label: 'Planifier un voyage' };
    if (crumb.href === '/contact') return { ...crumb, label: 'Contact' };
    if (crumb.href === '/mentions-legales') return { ...crumb, label: 'Mentions légales' };
    
    return crumb;
  });

  return (
    <nav className="bg-white border-b border-gray-200 py-2 sm:py-3 px-4 sm:px-6 mt-16">
      <div className="max-w-7xl mx-auto">
        <ol className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm">
          {breadcrumbsWithNames.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-1 sm:gap-2">
              {index > 0 && <span className="text-gray-400">/</span>}
              {index === breadcrumbsWithNames.length - 1 ? (
                <span className="text-gray-600 font-medium truncate">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-amber-900 hover:text-amber-700 transition font-medium truncate"
                >
                  {crumb.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
