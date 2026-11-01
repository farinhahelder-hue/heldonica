export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { requireCmsAuth } from '@/lib/cms-auth';
import { searchVaultSpots, getAllVaultSpots } from '@/lib/cms-vault-spots';

/**
 * GET /api/cms/vault/search
 * Recherche dans les 78 fiches du Coffre des Savoirs RAG (anecdotes vécues, lieux réels).
 * Règle AGENTS.md n°1 : On n'invente rien. Données certifiées de terrain.
 */
export async function GET(req: NextRequest) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  try {
    const q = req.nextUrl.searchParams.get('q') || '';
    const category = req.nextUrl.searchParams.get('category') || undefined;
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '10', 10);

    const spots = q ? searchVaultSpots(q, { category, limit }) : getAllVaultSpots().slice(0, limit);

    return NextResponse.json({
      ok: true,
      query: q,
      count: spots.length,
      spots,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
