import { describe, it, expect } from 'vitest'
import { 
  getRelatedArticlesByDestination, 
  DESTINATION_PATTERNS 
} from '@/components/RelatedArticles'
import type { BlogPost } from '@/lib/blog-supabase'

const createMockArticle = (overrides: Partial<BlogPost> = {}): BlogPost => ({
  id: 1,
  slug: 'test-article',
  title: 'Test Article',
  excerpt: null,
  content: 'Test content with some text for reading time calculation.',
  category: 'Travel',
  destination: null,
  tags: [],
  featured_image: null,
  author: null,
  published: true,
  published_at: '2023-01-01T00:00:00Z',
  created_at: null,
  updated_at: null,
  ...overrides,
})

describe('RelatedArticles - DESTINATION_PATTERNS', () => {
  it('should have patterns for roumanie', () => {
    expect(DESTINATION_PATTERNS['roumanie']).toContain('Roumanie')
    expect(DESTINATION_PATTERNS['roumanie']).toContain('Transylvanie')
    expect(DESTINATION_PATTERNS['roumanie']).toContain('Brasov')
  })

  it('should have patterns for madere', () => {
    expect(DESTINATION_PATTERNS['madere']).toContain('Madère')
    expect(DESTINATION_PATTERNS['madere']).toContain('Madeira')
    expect(DESTINATION_PATTERNS['madere']).toContain('Funchal')
  })

  it('should have patterns for colombie', () => {
    expect(DESTINATION_PATTERNS['colombie']).toContain('Colombie')
    expect(DESTINATION_PATTERNS['colombie']).toContain('Bogota')
    expect(DESTINATION_PATTERNS['colombie']).toContain('Medellín')
  })

  it('should have patterns for sicile', () => {
    expect(DESTINATION_PATTERNS['sicile']).toContain('Sicile')
    expect(DESTINATION_PATTERNS['sicile']).toContain('Palerme')
    expect(DESTINATION_PATTERNS['sicile']).toContain('Taormine')
  })
})

describe('getRelatedArticlesByDestination - tag-based matching', () => {
  it('should return empty array for unknown destination', () => {
    const articles = [
      createMockArticle({ slug: 'a1', title: 'Article 1', destination: 'Paris' }),
    ]
    const result = getRelatedArticlesByDestination(articles, 'unknown-destination')
    expect(result).toHaveLength(0)
  })

  it('should match articles by destination name in title', () => {
    const articles = [
      createMockArticle({ slug: 'a1', title: 'Voyage en Roumanie' }),
      createMockArticle({ slug: 'a2', title: 'Week-end à Paris' }),
    ]
    const result = getRelatedArticlesByDestination(articles, 'roumanie')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('a1')
  })

  it('should match articles by destination in excerpt', () => {
    const articles = [
      createMockArticle({ slug: 'a1', title: 'Mon voyage', excerpt: 'Direction la Roumanie pour découvrir la Transylvanie' }),
      createMockArticle({ slug: 'a2', title: 'Another article', excerpt: 'Pas de destination ici' }),
    ]
    const result = getRelatedArticlesByDestination(articles, 'roumanie')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('a1')
  })

  it('should match articles by destination field', () => {
    const articles = [
      createMockArticle({ slug: 'a1', destination: 'Roumanie' }),
      createMockArticle({ slug: 'a2', destination: 'France' }),
    ]
    const result = getRelatedArticlesByDestination(articles, 'roumanie')
    expect(result).toHaveLength(1)
    expect(result[0].slug).toBe('a1')
  })

  it('should be case insensitive', () => {
    const articles = [
      createMockArticle({ slug: 'a1', title: 'Voyage en ROUMANIE' }),
    ]
    const result = getRelatedArticlesByDestination(articles, 'roumanie')
    expect(result).toHaveLength(1)
  })

  it('should return maximum 3 articles', () => {
    const articles = [
      createMockArticle({ slug: 'a1', title: 'Roumanie voyage 1' }),
      createMockArticle({ slug: 'a2', title: 'Roumanie voyage 2' }),
      createMockArticle({ slug: 'a3', title: 'Roumanie voyage 3' }),
      createMockArticle({ slug: 'a4', title: 'Roumanie voyage 4' }),
      createMockArticle({ slug: 'a5', title: 'Roumanie voyage 5' }),
    ]
    const result = getRelatedArticlesByDestination(articles, 'roumanie')
    expect(result).toHaveLength(3)
  })

  it('should handle case-insensitive destination slug', () => {
    const articles = [
      createMockArticle({ slug: 'a1', title: 'Voyage en Roumanie' }),
    ]
    const result = getRelatedArticlesByDestination(articles, 'ROUMANIE')
    expect(result).toHaveLength(1)
  })
})