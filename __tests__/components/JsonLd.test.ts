import { describe, it, expect } from 'vitest';
import { buildBlogBreadcrumbItems } from '../../components/JsonLd';

describe('buildBlogBreadcrumbItems', () => {
  it('should return breadcrumb items without a category', () => {
    const result = buildBlogBreadcrumbItems(null, 'Mon Article');

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ label: 'Accueil', href: '/' });
    expect(result[1]).toEqual({ label: 'Blog', href: '/blog' });
    expect(result[2]).toEqual({ label: 'Mon Article', href: '' });
  });

  it('should return breadcrumb items with a category', () => {
    const result = buildBlogBreadcrumbItems('Voyage en Europe', 'Découverte de Rome');

    expect(result).toHaveLength(4);
    expect(result[0]).toEqual({ label: 'Accueil', href: '/' });
    expect(result[1]).toEqual({ label: 'Blog', href: '/blog' });
    expect(result[2]).toEqual({
      label: 'Voyage en Europe',
      href: '/blog?categorie=Voyage%20en%20Europe',
    });
    expect(result[3]).toEqual({ label: 'Découverte de Rome', href: '' });
  });

  it('should correctly encode category names with special characters', () => {
    const result = buildBlogBreadcrumbItems('Amérique du Sud & Caraïbes', 'Voyage');

    expect(result[2].href).toBe('/blog?categorie=Am%C3%A9rique%20du%20Sud%20%26%20Cara%C3%AFbes');
  });
});
