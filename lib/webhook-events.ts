// Webhook events from Heldonica CMS
// These are sent to n8n or other agents when certain actions happen

export interface WebhookEvent {
  type: 'article.created' | 'article.updated' | 'article.published' | 'article.deleted' | 'validation.failed'
  timestamp: string
  article?: {
    id: number
    title: string
    slug: string
    category: string
    country?: string
    city?: string
  }
  validation?: {
    score: number
    issues: Array<{ type: string; field: string; message: string }>
  }
}

// Quick reference: Webhook payloads
export const WEBHOOK_EXAMPLES = {
  'article.published': {
    type: 'article.published',
    timestamp: '2024-01-15T10:30:00Z',
    article: {
      id: 42,
      title: 'Weekend à Lisbonne',
      slug: 'weekend-a-lisbonne',
      category: 'destinations',
      country: 'Portugal',
      city: 'Lisbonne'
    }
  },
  'validation.failed': {
    type: 'validation.failed',
    timestamp: '2024-01-15T10:30:00Z',
    article: {
      id: 43,
      title: 'Guide Madère',
      slug: 'guide-madere',
      category: 'destinations'
    },
    validation: {
      score: 45,
      issues: [
        { type: 'warning', field: 'featured_image', message: 'Image manquante' },
        { type: 'error', field: 'country', message: 'Pays requis pour destinations' }
      ]
    }
  }
} as const