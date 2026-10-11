import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BreadcrumbJsonLd } from '@/components/JsonLd';

// Mock next/script to render a standard <script> tag so its contents can be read via innerHTML
vi.mock('next/script', () => {
  return {
    default: ({ id, type, dangerouslySetInnerHTML }: any) => {
      return <script id={id} type={type} dangerouslySetInnerHTML={dangerouslySetInnerHTML} />;
    },
  };
});

describe('BreadcrumbJsonLd', () => {
  it('renders a valid BreadcrumbList schema with provided items', () => {
    const { container } = render(
      <BreadcrumbJsonLd
        items={[
          { label: 'Accueil', href: '/' },
          { label: 'Blog', href: '/blog' }
        ]}
      />
    );

    const scriptTag = container.querySelector('script');
    expect(scriptTag).toBeTruthy();
    expect(scriptTag?.getAttribute('type')).toBe('application/ld+json');
    expect(scriptTag?.getAttribute('id')).toBe('breadcrumb-jsonld');

    const jsonLd = JSON.parse(scriptTag?.innerHTML || '{}');

    expect(jsonLd['@context']).toBe('https://schema.org');
    expect(jsonLd['@type']).toBe('BreadcrumbList');
    expect(jsonLd.itemListElement).toHaveLength(2);

    expect(jsonLd.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Accueil',
      item: 'https://www.heldonica.fr/',
    });

    expect(jsonLd.itemListElement[1]).toEqual({
      '@type': 'ListItem',
      position: 2,
      name: 'Blog',
      item: 'https://www.heldonica.fr/blog',
    });
  });

  it('renders correctly with an empty items array', () => {
    const { container } = render(
      <BreadcrumbJsonLd items={[]} />
    );

    const scriptTag = container.querySelector('script');
    expect(scriptTag).toBeTruthy();

    const jsonLd = JSON.parse(scriptTag?.innerHTML || '{}');
    expect(jsonLd.itemListElement).toEqual([]);
  });
});
