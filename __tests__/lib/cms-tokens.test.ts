import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hashToken, verifyApiToken, generateApiToken, CmsApiToken } from '@/lib/cms-tokens';

// Mock Supabase
vi.mock('@/lib/supabase-client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

import { supabase } from '@/lib/supabase-client';

describe('CMS API Tokens — Scopes & MCP Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calcule un hash SHA-256 déterministe', () => {
    const raw = 'held_live_test_token_123456';
    const hash1 = hashToken(raw);
    const hash2 = hashToken(raw);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64); // SHA-256 hex string is 64 chars
  });

  it('rejette la génération sans nom ou sans scopes', async () => {
    const resNoName = await generateApiToken({
      name: '  ',
      scopes: ['read:content'],
    });
    expect(resNoName.success).toBe(false);
    expect(resNoName.error).toContain('nom du token est obligatoire');

    const resNoScopes = await generateApiToken({
      name: 'Token Agent',
      scopes: [],
    });
    expect(resNoScopes.success).toBe(false);
    expect(resNoScopes.error).toContain('scope de permission est requis');
  });

  it('rejette un jeton absent ou malformé', async () => {
    const resNull = await verifyApiToken(null);
    expect(resNull.valid).toBe(false);
    expect(resNull.error).toContain('absent');

    const resEmpty = await verifyApiToken('Bearer   ');
    expect(resEmpty.valid).toBe(false);
  });

  it('autorise un jeton valide avec le scope requis', async () => {
    const testToken: CmsApiToken = {
      id: 'token-uuid-1',
      name: 'Agent OpenCode',
      token_prefix: 'held_live_abc123...',
      scopes: ['read:content', 'write:draft'],
      is_revoked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({ data: testToken, error: null });
    const mockUpdate = vi.fn().mockReturnThis();

    (supabase!.from as any).mockImplementation((table: string) => {
      if (table === 'cms_api_tokens') {
        return {
          select: mockSelect,
          eq: mockEq,
          single: mockSingle,
          update: mockUpdate,
        };
      }
      return {};
    });

    const verification = await verifyApiToken('Bearer held_live_secret_sample', 'read:content');
    expect(verification.valid).toBe(true);
    expect(verification.token?.name).toBe('Agent OpenCode');
  });

  it('rejette un jeton ne disposant pas du scope demandé', async () => {
    const testToken: CmsApiToken = {
      id: 'token-uuid-2',
      name: 'Lecteur Externe',
      token_prefix: 'held_live_reader...',
      scopes: ['read:content'],
      is_revoked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (supabase!.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: testToken, error: null }),
      update: vi.fn().mockReturnThis(),
    });

    const verification = await verifyApiToken('held_live_reader_sample', 'publish:content');
    expect(verification.valid).toBe(false);
    expect(verification.error).toContain('Permission insuffisante');
  });

  it('donne accès si le jeton a le scope admin:*', async () => {
    const testToken: CmsApiToken = {
      id: 'token-uuid-3',
      name: 'Super Admin Agent',
      token_prefix: 'held_live_super...',
      scopes: ['admin:*'],
      is_revoked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (supabase!.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: testToken, error: null }),
      update: vi.fn().mockReturnThis(),
    });

    const verification = await verifyApiToken('held_live_super_sample', 'publish:content');
    expect(verification.valid).toBe(true);
  });

  it('rejette un jeton révoqué', async () => {
    const testToken: CmsApiToken = {
      id: 'token-uuid-4',
      name: 'Agent Révoqué',
      token_prefix: 'held_live_revoked...',
      scopes: ['read:content'],
      is_revoked: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    (supabase!.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: testToken, error: null }),
    });

    const verification = await verifyApiToken('held_live_revoked_sample');
    expect(verification.valid).toBe(false);
    expect(verification.error).toContain('révoqué');
  });
});
