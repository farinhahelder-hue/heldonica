import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/ai/generate/route';

vi.mock('@/lib/cms-auth', () => ({
  requireCmsAuth: vi.fn(),
}));

import { requireCmsAuth } from '@/lib/cms-auth';

describe('API /api/ai/generate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejette les requêtes non authentifiées sur POST (401)', async () => {
    const { NextResponse } = await import('next/server');
    (requireCmsAuth as any).mockResolvedValue(
      NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    );

    const req = new NextRequest('http://localhost:3000/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ topic: 'Madère' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('rejette les requêtes non authentifiées sur GET (401)', async () => {
    const { NextResponse } = await import('next/server');
    (requireCmsAuth as any).mockResolvedValue(
      NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    );

    const req = new NextRequest('http://localhost:3000/api/ai/generate', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(401);
  });

  it('génère du contenu pour Heldonica avec auth valide', async () => {
    (requireCmsAuth as any).mockResolvedValue(null);

    // Mock fetch pour Ollama
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        message: { content: 'Madère slow travel authentique #heldonica' },
      }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const req = new NextRequest('http://localhost:3000/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ topic: 'Madère', platform: 'instagram' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.content).toContain('Madère slow travel');

    // Vérifier que le prompt contient bien Heldonica et non l'ancienne coquille
    const callArgs = mockFetch.mock.calls[0];
    const requestBody = JSON.parse(callArgs[1].body);
    expect(requestBody.messages[0].content).toContain('Heldonica');
    expect(requestBody.messages[0].content).not.toContain('Heldica');

    vi.unstubAllGlobals();
  });
});
