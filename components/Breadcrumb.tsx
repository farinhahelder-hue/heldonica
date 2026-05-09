'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Breadcrumb() {
  const pathname = usePathname();

  // Guard against null during SSR/prerendering
  if (!pathname || pathname === '/') {
    return null;
  }

  // Générer les segments du breadcrumb
  const segments = pathname.split('/').filter(Boolean);
  
  // S'assurer que segments est toujours un tableau avant le spread
  const safeSegments = Array.isArray(segments) ? segments : [];

  const breadcrumbs = [
    { label: 'Accueil', href: '/' },
    ...safeSegments.map((segment, index) => {
      const href = '/' + safeSegments.slice(0, index + 1).join('/');
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { label, href };
    }),
  ];

  // S'assurer que breadcrumbs est toujours un tableau
  const safeBreadcrumbs = Array.isArray(breadcrumbs) ? breadcrumbs : [];

  // Cas spéciaux pour les pages principales
  const breadcrumbsWithNames = safeBreadcrumbs.map((crumb) => {
    if (crumb.href === '/blog') return { ...crumb, label: 'Blog' };
    if (crumb.href === '/destinations') return { ...crumb, label: 'Destinations' };
    if (crumb.href === '/a-propos') return { ...crumb, label: 'À propos' };
    if (crumb.href === '/travel-planning') return { ...crumb, label: 'Travel Planning' };
    if (crumb.href === '/travel-planning-form') return { ...crumb, label: 'Planifier' };
    if (crumb.href === '/hotel-consulting') return { ...crumb, label: 'Consulting' };
    if (crumb.href === '/contact') return { ...crumb, label: 'Contact' };
    if (crumb.href === '/mentions-legales') return { ...crumb, label: 'Mentions légales' };
    return crumb;
  });

  // S'assurer que le résultat final est un tableau
  const safeBreadcrumbsWithNames = Array.isArray(breadcrumbsWithNames) ? breadcrumbsWithNames : [];

  return (
    <nav className="bg-cloud-dancer/80 backdrop-blur-sm border-b border-cloud-dancer py-3 px-4 md:px-6 mt-16">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center gap-1.5 text-xs md:text-sm overflow-x-auto no-scrollbar">
          {safeBreadcrumbsWithNames.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-1.5 whitespace-nowrap">
              {index > 0 && (
                <svg className="w-3 h-3 text-charcoal/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {index === breadcrumbsWithNames.length - 1 ? (
                <span className="text-charcoal/60 font-medium">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-charcoal/40 hover:text-eucalyptus transition-colors"
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
