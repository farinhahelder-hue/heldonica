/**
 * lib/pillar-schema.ts
 *
 * Construction des données structurées schema.org d'une page pilier
 * (`TouristDestination`, `FAQPage`, `BreadcrumbList`).
 *
 * Ces constructeurs sont isolés du composant React pour une raison précise :
 * un JSON-LD n'est pas du rendu, c'est un contrat de données. Tant qu'il était
 * construit au milieu d'un `dangerouslySetInnerHTML`, rien ne pouvait le
 * vérifier autrement qu'à l'œil. Ici, il est testable — et un schéma malformé
 * se voit en test plutôt qu'en console de moteur de recherche.
 *
 * Aucune donnée n'est inventée : chaque constructeur ne rend que ce qu'on lui
 * transmet. Un tableau vide produit un `mainEntity: []`, jamais une question
 * fabriquée.
 */

export interface DestinationSchemaInput {
  name: string
  description: string
  url: string
  country?: string
}

export interface FaqItem {
  q: string
  a: string
}

/** `TouristDestination` — identité de la destination et son pays de rattachement. */
export function buildDestinationSchema(input: DestinationSchemaInput): Record<string, unknown> {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: input.name,
    description: input.description,
    url: input.url,
  }

  if (input.country) {
    schema.containedInPlace = { '@type': 'Country', name: input.country }
  }

  return schema
}

/** `FAQPage` — une `Question` par entrée, avec sa réponse acceptée. */
export function buildFaqSchema(faq: FaqItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

/** `BreadcrumbList` — Accueil › Destinations › la destination. */
export function buildBreadcrumbSchema(
  destination: { name: string; slug: string },
  siteUrl: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${siteUrl}/destinations` },
      {
        '@type': 'ListItem',
        position: 3,
        name: destination.name,
        item: `${siteUrl}/destinations/${destination.slug}`,
      },
    ],
  }
}
