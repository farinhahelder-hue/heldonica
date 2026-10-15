import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/ai/mobile-brain/route';
import * as aiAuth from '@/lib/ai-auth';
import * as aiProvider from '@/lib/ai-provider';

vi.mock('@/lib/ai-auth', () => ({
  verifyAiAuth: vi.fn(),
  logAiRequest: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/ai-provider', () => ({
  generateAiCompletion: vi.fn(),
}));

describe('API Route /api/ai/mobile-brain', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refuse les requêtes non authentifiées (401)', async () => {
    vi.mocked(aiAuth.verifyAiAuth).mockResolvedValueOnce({
      ok: false,
      status: 401,
      error: 'Non autorisé',
    });

    const req = new NextRequest('http://localhost/api/ai/mobile-brain', {
      method: 'POST',
      body: JSON.stringify({ message: 'Hello' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Non autorisé');
  });

  it('refuse les requêtes sans message (400)', async () => {
    vi.mocked(aiAuth.verifyAiAuth).mockResolvedValueOnce({
      ok: true,
      agentName: 'mobile_apk',
      keyId: 'test_key',
    });

    const req = new NextRequest('http://localhost/api/ai/mobile-brain', {
      method: 'POST',
      body: JSON.stringify({ message: '' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Message requis');
  });

  it('applique freeOnly: true et filtre la confidentialité avant la complétion', async () => {
    vi.mocked(aiAuth.verifyAiAuth).mockResolvedValueOnce({
      ok: true,
      agentName: 'mobile_apk',
      keyId: 'test_key',
    });

    vi.mocked(aiProvider.generateAiCompletion).mockResolvedValueOnce({
      content: 'Ceci est une réponse lente et contemplative.',
      provider: 'groq',
      model: 'llama-3.3-70b-versatile',
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 },
    });

    const secretPrompt = 'Mon mot de passe cms_password="secret123" et ma clé sk-ant-api03-1234567890abcdefgh';
    const req = new NextRequest('http://localhost/api/ai/mobile-brain', {
      method: 'POST',
      headers: {
        'x-heldonica-client': 'mobile-poco-x6pro',
      },
      body: JSON.stringify({
        message: secretPrompt,
        mode: 'coach',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    // Vérification de l'appel à generateAiCompletion
    expect(aiProvider.generateAiCompletion).toHaveBeenCalledTimes(1);
    const callArgs = vi.mocked(aiProvider.generateAiCompletion).mock.calls[0][0];

    // Vérifie la garantie stricte 0€
    expect(callArgs.freeOnly).toBe(true);

    // Vérifie la désensibilisation (privacy sanitization)
    const userMsg = callArgs.messages.find(m => m.role === 'user');
    expect(userMsg?.content).not.toContain('secret123');
    expect(userMsg?.content).not.toContain('sk-ant-api03');
    expect(userMsg?.content).toContain('[PROTEGE]');
    expect(userMsg?.content).toContain('[CLE_PROTEGEE]');
  });
});
