import { NextResponse } from 'next/server';
import { getMaintenanceMode, isSupabaseConfigured } from '@/lib/supabase-edge';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function GET() {
  const envMode = process.env.MAINTENANCE_MODE?.trim().toLowerCase() ?? null;
  const cmsValue = await getMaintenanceMode();
  let effectiveMaintenance: boolean;
  if (cmsValue !== null) {
    effectiveMaintenance = cmsValue;
  } else if (envMode === 'false' || envMode === '0') {
    effectiveMaintenance = false;
  } else if (envMode === 'true' || envMode === '1') {
    effectiveMaintenance = true;
  } else {
    effectiveMaintenance = true;
  }
  return NextResponse.json({
    isSupabaseConfigured: isSupabaseConfigured(),
    urlConfigured: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
    serviceKeyConfigured: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY),
    envMode,
    cmsValue,
    effectiveMaintenance,
    now: new Date().toISOString(),
  });
}