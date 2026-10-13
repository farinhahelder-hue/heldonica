import { describe, it, expect } from 'vitest'
import {
  buildDestinationSchema,
  buildFaqSchema,
  buildBreadcrumbSchema,
} from '@/lib/pillar-schema'

/**
 * Ces tests remplacent une vérification qui n'existait pas : le JSON-LD des
 * pages piliers était construit à l'intérieur d'un `dangerouslySetInnerHTML`,
 * donc invérifiable. On mesure ici la forme du contrat schema.org, pas le rendu.
 */
describe('pillar-schema — données structurées des pages piliers', () => {
  describe('buildDestinationSchema', () => {
    it('émet un TouristDestination avec nom, description et url', () => {
      const s = buildDestinationSchema({
        name: 'Madère',
        description: 'Slow travel en couple',
        url: 'https://heldonica.fr/destinations/madere',
      })
      expect(s['@context']).toBe('https://schema.org')
      expect(s['@type']).toBe('TouristDestination')
      expect(s.name).toBe('Madère')
      expect(s.description).toBe('Slow travel en couple')
      expect(s.url).toBe('https://heldonica.fr/destinations/madere')
    })

    it('rattache le pays quand il est fourni', () => {
      const s = buildDestinationSchema({
        name: 'Madère',
        description: 'x',
        url: 'u',
        country: 'Portugal',
      })
      expect(s.containedInPlace).toEqual({ '@type': 'Country', name: 'Portugal' })
    })

    it("n'invente pas de pays quand il est absent", () => {
      const s = buildDestinationSchema({ name: 'X', description: 'x', url: 'u' })
      expect(s).not.toHaveProperty('containedInPlace')
    })
  })

  describe('buildFaqSchema', () => {
    it('produit une Question par entrée avec sa réponse acceptée', () => {
      const s = buildFaqSchema([
        { q: 'Quand partir ?', a: 'En mai.' },
        { q: 'Quel budget ?', a: 'Environ 900 €.' },
      ])
      expect(s['@type']).toBe('FAQPage')
      const main = s.mainEntity as Array<Record<string, unknown>>
      expect(main).toHaveLength(2)
      expect(main[0]).toEqual({
        '@type': 'Question',
        name: 'Quand partir ?',
        acceptedAnswer: { '@type': 'Answer', text: 'En mai.' },
      })
    })

    it("rend une liste vide plutôt qu'une question fabriquée", () => {
      const s = buildFaqSchema([])
      expect(s.mainEntity).toEqual([])
    })
  })

  describe('buildBreadcrumbSchema', () => {
    it('hiérarchise Accueil › Destinations › destination avec des positions croissantes', () => {
      const s = buildBreadcrumbSchema({ name: 'Madère', slug: 'madere' }, 'https://heldonica.fr')
      const items = s.itemListElement as Array<Record<string, unknown>>
      expect(items.map((i) => i.position)).toEqual([1, 2, 3])
      expect(items[2].item).toBe('https://heldonica.fr/destinations/madere')
      expect(items[0].item).toBe('https://heldonica.fr')
    })

    it('produit un JSON sérialisable sans erreur', () => {
      const s = buildBreadcrumbSchema({ name: 'Roumanie', slug: 'roumanie' }, 'https://heldonica.fr')
      expect(() => JSON.stringify(s)).not.toThrow()
      expect(JSON.parse(JSON.stringify(s))['@type']).toBe('BreadcrumbList')
    })
  })
})
