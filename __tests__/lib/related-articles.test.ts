import { describe, it, expect } from 'vitest'
import { getRelatedArticles } from '@/lib/related-articles'
import type { BlogPost as SupabaseBlogPost } from '@/lib/blog-supabase'

const MOCK_ARTICLES: SupabaseBlogPost[] = [
  {
    id: 1,
    slug: 'article-1',
    title: 'Article 1',
    excerpt: null,
    content: null,
    category: 'Travel',
    destination: 'Paris',
    tags: ['city', 'food'],
    featured_image: null,
    author: null,
    published: true,
    published_at: '2023-01-01T00:00:00Z',
    created_at: null,
    updated_at: null,
  },
  {
    id: 2,
    slug: 'article-2',
    title: 'Article 2',
    excerpt: null,
    content: null,
    category: 'Travel',
    destination: 'Paris',
    tags: ['museum', 'art'],
    featured_image: null,
    author: null,
    published: true,
    published_at: '2023-01-02T00:00:00Z',
    created_at: null,
    updated_at: null,
  },
  {
    id: 3,
    slug: 'article-3',
    title: 'Article 3',
    excerpt: null,
    content: null,
    category: 'Food',
    destination: 'Lyon',
    tags: ['food', 'wine'],
    featured_image: null,
    author: null,
    published: true,
    published_at: '2023-01-03T00:00:00Z',
    created_at: null,
    updated_at: null,
  },
  {
    id: 4,
    slug: 'article-4',
    title: 'Article 4',
    excerpt: null,
    content: null,
    category: 'Travel',
    destination: 'Lyon',
    tags: ['city', 'wine'],
    featured_image: null,
    author: null,
    published: true,
    published_at: '2023-01-04T00:00:00Z',
    created_at: null,
    updated_at: null,
  },
]

describe('getRelatedArticles', () => {
  it('should return articles scored by shared attributes', () => {
    // article-1 has destination Paris, category Travel, tags ['city', 'food']
    // Scores:
    // article-2: Travel (+2), Paris (+3) = 5
    // article-3: food (+1) = 1
    // article-4: Travel (+2), city (+1) = 3

    const related = getRelatedArticles(MOCK_ARTICLES[0], MOCK_ARTICLES, 3)

    expect(related.length).toBe(3)
    expect(related[0].slug).toBe('article-2') // score 5
    expect(related[1].slug).toBe('article-4') // score 3
    expect(related[2].slug).toBe('article-3') // score 1
  })

  it('should not include the current article in the results', () => {
    const related = getRelatedArticles(MOCK_ARTICLES[0], MOCK_ARTICLES, 3)

    const containsCurrent = related.some(article => article.slug === 'article-1')
    expect(containsCurrent).toBe(false)
  })

  it('should limit the results to the specified number', () => {
    const related = getRelatedArticles(MOCK_ARTICLES[0], MOCK_ARTICLES, 1)

    expect(related.length).toBe(1)
  })

  it('should resolve ties using published_at (newer first)', () => {
    const tieArticles = [
      ...MOCK_ARTICLES,
      {
        id: 5,
        slug: 'article-5',
        title: 'Article 5',
        excerpt: null,
        content: null,
        category: 'Travel',
        destination: 'Paris',
        tags: ['museum', 'art'],
        featured_image: null,
        author: null,
        published: true,
        published_at: '2023-01-05T00:00:00Z', // Newer than article-2
        created_at: null,
        updated_at: null,
      }
    ]

    // article-2 and article-5 will tie with a score of 5 for article-1
    // article-5 is newer, so it should come first

    const related = getRelatedArticles(tieArticles[0], tieArticles, 3)

    expect(related[0].slug).toBe('article-5')
    expect(related[1].slug).toBe('article-2')
  })
})
