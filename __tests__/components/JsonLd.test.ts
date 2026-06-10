import { describe, it, expect } from 'vitest'
import { buildBlogBreadcrumbItems } from '../../components/JsonLd'

describe('buildBlogBreadcrumbItems', () => {
  it('should build breadcrumb items with postTitle, categorySlug, and categoryName', () => {
    const items = buildBlogBreadcrumbItems('Mon super article', 'voyage', 'Voyage')
    expect(items).toEqual([
      { name: 'Accueil', item: 'https://heldonica.fr/' },
      { name: 'Blog', item: 'https://heldonica.fr/blog' },
      { name: 'Voyage', item: 'https://heldonica.fr/blog?categorie=voyage' },
      { name: 'Mon super article', item: '' }
    ])
  })

  it('should build breadcrumb items without category (only postTitle)', () => {
    const items = buildBlogBreadcrumbItems('Mon article sans catégorie')
    expect(items).toEqual([
      { name: 'Accueil', item: 'https://heldonica.fr/' },
      { name: 'Blog', item: 'https://heldonica.fr/blog' },
      { name: 'Mon article sans catégorie', item: '' }
    ])
  })

  it('should build breadcrumb items correctly with URL encoding needed in slug', () => {
    const items = buildBlogBreadcrumbItems('Mon article', 'amerique du sud', 'Amérique du Sud')
    expect(items).toEqual([
      { name: 'Accueil', item: 'https://heldonica.fr/' },
      { name: 'Blog', item: 'https://heldonica.fr/blog' },
      { name: 'Amérique du Sud', item: 'https://heldonica.fr/blog?categorie=amerique%20du%20sud' },
      { name: 'Mon article', item: '' }
    ])
  })

  it('should handle empty arguments', () => {
    const items = buildBlogBreadcrumbItems()
    expect(items).toEqual([
      { name: 'Accueil', item: 'https://heldonica.fr/' },
      { name: 'Blog', item: 'https://heldonica.fr/blog' }
    ])
  })
})
