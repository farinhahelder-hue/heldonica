'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { useContentLoader } from '@/hooks/useContentLoader';

const LABEL_DEFAULTS: Record<string, string> = {
  '/blog': 'Blog',
  '/destinations': 'Destinations',
  '/a-propos': 'À propos',
  '/travel-planning': 'Travel Planning',
  '/travel-planning-form': 'Planifier',
  '/hotel-consulting': 'Consulting',
  '/contact': 'Contact',
  '/mentions-legales': 'Mentions légales',
  '/guides': 'Guides',
  '/nos-services': 'Nos services',
  '/expert-hotelier': 'Expert Hôtelier',
  '/politique-confidentialite': 'Confidentialité',
  '/politique-affiliation': 'Affiliation',
  '/slow-travel': 'Slow Travel',
}

export default function Breadcrumb() {
  const pathname = usePathname();
  const { settings } = useContentLoader();

  if (!pathname || pathname === '/') {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  const safeSegments = Array.isArray(segments) ? segments : [];

  const breadcrumbs = [
    { label: settings?.breadcrumb_home || 'Accueil', href: '/' },
    ...safeSegments.map((segment, index) => {
      const href = '/' + safeSegments.slice(0, index + 1).join('/');
      const settingKey = `breadcrumb_${href.replace(/\//g, '_').replace(/^_/, '') || 'home'}`;
      const label = settings?.[settingKey] || LABEL_DEFAULTS[href] || segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return { label, href };
    }),
  ];

  const safeBreadcrumbs = Array.isArray(breadcrumbs) ? breadcrumbs : [];

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: safeBreadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `https://www.heldonica.fr${crumb.href}`,
    })),
  };

  return (
    <>
      <Script
        id="global-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    <nav aria-label="Fil d'Ariane" className="bg-cloud-dancer/80 backdrop-blur-sm border-b border-cloud-dancer py-3 px-4 md:px-6 mt-16">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center gap-1.5 text-xs md:text-sm overflow-x-auto no-scrollbar">
          {safeBreadcrumbs.map((crumb, index) => (
            <li key={crumb.href} className="flex items-center gap-1.5 whitespace-nowrap">
              {index > 0 && (
                <svg aria-hidden="true" className="w-3 h-3 text-charcoal/40 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
              {index === breadcrumbs.length - 1 ? (
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
    </>
  );
}
