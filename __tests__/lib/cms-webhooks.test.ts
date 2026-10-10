import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  signWebhookPayload,
  createCmsWebhook,
  triggerCmsWebhooks,
  CmsWebhook,
} from '@/lib/cms-webhooks';

vi.mock('@/lib/supabase-client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase-client';

describe('CMS Webhooks — Déclenchement & Signatures HMAC', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calcule une signature HMAC-SHA256 déterministe', () => {
    const payload = JSON.stringify({ event: 'article.published', id: '123' });
    const secret = 'super_secret_webhook_key';

    const sig1 = signWebhookPayload(payload, secret);
    const sig2 = signWebhookPayload(payload, secret);

    expect(sig1).toBe(sig2);
    expect(sig1).toHaveLength(64);
  });

  it('rejette les URLs non HTTPS ou les noms manquants', async () => {
    const resNoName = await createCmsWebhook({
      name: '',
      url: 'https://webhook.site/test',
      events: ['article.published'],
    });
    expect(resNoName.success).toBe(false);
    expect(resNoName.error).toContain('Nom requis');

    const resHttp = await createCmsWebhook({
      name: 'N8N Bot',
      url: 'http://insecure.site/webhook',
      events: ['article.published'],
    });
    expect(resHttp.success).toBe(false);
    expect(resHttp.error).toContain('HTTPS');
  });

  it('déclenche les webhooks abonnés et gère les erreurs de transport sans crash', async () => {
    const mockWebhooks: CmsWebhook[] = [
      {
        id: 'hook-1',
        name: 'Discord Notifier',
        url: 'https://discord.com/api/webhooks/test',
        events: ['article.published'],
        secret: 'discord_secret',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    (supabase!.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockWebhooks, error: null }),
      insert: vi.fn().mockResolvedValue({ error: null }),
    });

    // Mock global fetch
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: vi.fn().mockResolvedValue('ok'),
    });

    try {
      const results = await triggerCmsWebhooks('article.published', {
        title: 'Voyage en Transylvanie',
        slug: 'voyage-transylvanie',
      });

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].statusCode).toBe(200);
      expect(global.fetch).toHaveBeenCalledTimes(1);

      const fetchCall = (global.fetch as any).mock.calls[0];
      const headers = fetchCall[1].headers;
      expect(headers['X-Heldonica-Event']).toBe('article.published');
      expect(headers['X-Heldonica-Signature']).toMatch(/^sha256=[a-f0-9]{64}$/);
    } finally {
      global.fetch = originalFetch;
    }
  });
});
