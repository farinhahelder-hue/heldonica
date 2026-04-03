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

  // Cas spéciaux pour les pages principales
  const breadcrumbsWithNames = breadcrumbs.map((crumb) => {
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

  return (
    <nav className="bg-stone-50/80 backdrop-blur-sm border-b border-stone-100 py-3 px-4 md:px-6 mt-16">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center gap-1.5 text-xs md:text-sm overflow-x-auto no-scrollbar">
          {breadcrumbsWithNames.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-1.5 whitespace-nowrap">
              {index > 0 && (
                <svg className="w-3 h-3 text-stone-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {index === breadcrumbsWithNames.length - 1 ? (
                <span className="text-stone-500 font-medium">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-stone-400 hover:text-amber-700 transition-colors"
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
