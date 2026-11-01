import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const { revalidate } = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://fake.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'fake-key';
  return { revalidate: vi.fn().mockResolvedValue({ revalidated: [] }) };
});

vi.mock('@/lib/revalidate', () => ({ revalidateCmsTarget: revalidate, pageToPath: (p: string) => `/${p}` }));

// Table factice : chaque requete renvoie { data, error } configure.
let reponse: any = { data: { slug: 'sardaigne' }, error: null };
const chain = () => {
  const o: any = {};
  for (const m of ['select','insert','update','delete','eq','in','order','limit']) o[m] = () => o;
  o.single = () => Promise.resolve(reponse);
  o.then = (res: any) => Promise.resolve(reponse).then(res);
  return o;
};
vi.mock('@supabase/supabase-js', () => ({ createClient: () => ({ from: () => chain() }) }));
vi.mock('@/lib/cms-auth', () => ({ requireCmsAuth: async () => null }));

import { POST, PATCH, DELETE } from '@/app/api/cms/destinations/route';

const req = (body: any, method = 'POST') =>
  new NextRequest('https://x.test/api/cms/destinations', { method, body: JSON.stringify(body) });

describe('destinations — revalidation apres ecriture', () => {
  beforeEach(() => { revalidate.mockClear(); reponse = { data: { slug: 'sardaigne' }, error: null }; });

  it('POST revalide /destinations/sardaigne', async () => {
    const r = await POST(req({ slug: 'sardaigne', title: 'Sardaigne' }));
    expect(r.status).toBe(200);
    expect(revalidate).toHaveBeenCalledWith(expect.objectContaining({ page: 'destinations-sardaigne' }));
  });

  it('PATCH revalide la destination mise a jour', async () => {
    const r = await PATCH(req({ id: 'abc', title: 'x' }, 'PATCH'));
    expect(r.status).toBe(200);
    expect(revalidate).toHaveBeenCalledWith(expect.objectContaining({ page: 'destinations-sardaigne' }));
  });

  it('DELETE revalide la liste des destinations', async () => {
    const r = await DELETE(new NextRequest('https://x.test/api/cms/destinations?id=abc', { method: 'DELETE' }));
    expect(r.status).toBe(200);
    expect(revalidate).toHaveBeenCalled();
  });

  it('n appelle PAS la revalidation quand Supabase echoue', async () => {
    reponse = { data: null, error: { message: 'boom' } };
    const r = await POST(req({ slug: 's', title: 't' }));
    expect(r.status).toBe(500);
    expect(revalidate).not.toHaveBeenCalled();
  });
});
