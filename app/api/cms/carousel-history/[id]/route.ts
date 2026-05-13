export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCmsAuth } from '@/lib/cms-auth';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const supabase = (url && key) ? createClient(url, key) : null;

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const authResponse = await requireCmsAuth(req);
  if (authResponse) return authResponse;

  if (!supabase) return NextResponse.json({ error: 'DB unavailable' }, { status: 503 })

  try {
    const { error } = await supabase
      .from('cms_carousel_history')
      .delete()
      .eq('id', params.id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Delete error:', e);
    return NextResponse.json({ error: 'delete_failed' }, { status: 500 });
  }
}
