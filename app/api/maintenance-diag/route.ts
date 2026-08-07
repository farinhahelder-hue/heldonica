import { NextResponse } from 'next/server';
import { getMaintenanceMode } from '@/lib/supabase-edge';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

async function probe(label: string, headers: Record<string, string>) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  try {
    const r = await fetch(`${url}/rest/v1/site_settings?key=eq.maintenance_mode&select=value`, { headers });
    return { label, status: r.status, ok: r.ok, body: (await r.text()).slice(0, 200) };
  } catch (e) {
    return { label, error: String((e as Error)?.message ?? e).slice(0, 200) };
  }
}

export async function GET() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || null;
  const envMode = process.env.MAINTENANCE_MODE?.trim().toLowerCase() ?? null;
  const cmsValue = await getMaintenanceMode();

  const probes: unknown[] = [];
  if (serviceKey) {
    probes.push(await probe('service-key', { apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: 'single object' }));
  }
  if (anonKey) {
    probes.push(await probe('anon-key', { apikey: anonKey, Authorization: `Bearer ${anonKey}`, Prefer: 'single object' }));
  }

  return NextResponse.json({
    envMode,
    cmsValue,
    serviceKeyConfigured: Boolean(serviceKey),
    anonKeyConfigured: Boolean(anonKey),
    probes,
    now: new Date().toISOString(),
  });
}