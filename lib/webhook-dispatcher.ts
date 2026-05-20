/**
 * Webhook Dispatcher — Send events to n8n, Slack, Discord, etc.
 * 
 * Usage:
 *   import { dispatchWebhook } from '@/lib/webhook-dispatcher'
 *   
 *   // Send to n8n
 *   await dispatchWebhook('article.published', { id: 42, title: '...' })
 *   
 *   // Send to Slack
 *   await dispatchWebhook('article.published', article, { channel: 'slack' })
 */

import { WebhookEvent } from './webhook-events'

interface WebhookConfig {
  // n8n webhook URL
  n8n_url?: string
  // Slack webhook URL  
  slack_url?: string
  // Discord webhook URL
  discord_url?: string
  // Custom endpoints
  custom?: Array<{ url: string; events: string[] }>
}

const CONFIG: WebhookConfig = {
  n8n_url: process.env.N8N_WEBHOOK_URL || undefined,
  slack_url: process.env.SLACK_WEBHOOK_URL || undefined,
  discord_url: process.env.DISCORD_WEBHOOK_URL || undefined,
  custom: process.env.WEBHOOK_CUSTOM 
    ? JSON.parse(process.env.WEBHOOK_CUSTOM)
    : undefined,
}

/**
 * Dispatch a webhook event to configured endpoints
 */
export async function dispatchWebhook(
  eventType: WebhookEvent['type'],
  article: { id: number; title: string; slug: string; category: string; country?: string; city?: string },
  options?: { skip?: Array<keyof WebhookConfig> }
): Promise<void> {
  const skip = options?.skip || []
  const promises: Promise<any>[] = []

  const payload: WebhookEvent = {
    type: eventType,
    timestamp: new Date().toISOString(),
    article,
  }

  // n8n
  if (!skip.includes('n8n_url') && CONFIG.n8n_url) {
    promises.push(sendToN8n(CONFIG.n8n_url, payload))
  }

  // Slack
  if (!skip.includes('slack_url') && CONFIG.slack_url) {
    promises.push(sendToSlack(CONFIG.slack_url, payload))
  }

  // Discord
  if (!skip.includes('discord_url') && CONFIG.discord_url) {
    promises.push(sendToDiscord(CONFIG.discord_url, payload))
  }

  // Custom webhooks
  if (CONFIG.custom) {
    for (const custom of CONFIG.custom) {
      if (custom.events.includes(eventType)) {
        promises.push(sendJson(custom.url, payload))
      }
    }
  }

  await Promise.all(promises)
}

/**
 * Dispatch validation results
 */
export async function dispatchValidationFailure(
  article: { id: number; title: string; slug: string; category: string },
  validation: { score: number; issues: Array<{ type: string; field: string; message: string }> }
): Promise<void> {
  const payload: WebhookEvent = {
    type: 'validation.failed',
    timestamp: new Date().toISOString(),
    article,
    validation,
  }

  const promises: Promise<any>[] = []

  if (CONFIG.n8n_url) {
    promises.push(sendToN8n(CONFIG.n8n_url, payload))
  }

  if (CONFIG.slack_url) {
    promises.push(sendToSlack(CONFIG.slack_url, payload, true))
  }

  await Promise.all(promises)
}

// --- Private senders ---

async function sendToN8n(url: string, payload: WebhookEvent): Promise<void> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.error('[webhook] n8n failed:', res.status)
    }
  } catch (e) {
    console.error('[webhook] n8n error:', e)
  }
}

async function sendToSlack(url: string, payload: WebhookEvent, isError = false): Promise<void> {
  const { type, article } = payload
  
  const emoji = type === 'article.published' ? '✅' 
    : type === 'validation.failed' ? '⚠️' 
    : '📝'
  
  const color = type === 'article.published' ? '#10b981'
    : type === 'validation.failed' ? '#f59e0b'
    : '#6b7280'

  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `${emoji} *${article?.title}*`
      }
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `Category: ${article?.category} | Country: ${article?.country || '—'}`
        }
      ]
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Voir article' },
          url: `https://www.heldonica.fr/blog/${article?.slug}`,
        }
      ]
    }
  ]

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ blocks }),
    })
  } catch (e) {
    console.error('[webhook] slack error:', e)
  }
}

async function sendToDiscord(url: string, payload: WebhookEvent): Promise<void> {
  const { type, article } = payload
  
  const emoji = type === 'article.published' ? '✅' 
    : type === 'validation.failed' ? '⚠️' 
    : '📝'

  const embed = {
    title: `${emoji} ${article?.title}`,
    url: `https://www.heldonica.fr/blog/${article?.slug}`,
    fields: [
      { name: 'Category', value: article?.category || '—', inline: true },
      { name: 'Country', value: article?.country || '—', inline: true },
    ],
    timestamp: payload.timestamp,
  }

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ embeds: [embed] }),
    })
  } catch (e) {
    console.error('[webhook] discord error:', e)
  }
}

async function sendJson(url: string, payload: any): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.error('[webhook] custom error:', e)
  }
}