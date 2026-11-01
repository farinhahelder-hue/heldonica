import { describe, it, expect, vi, beforeEach } from 'vitest';
vi.mock('next/cache', () => ({ revalidatePath: vi.fn(), revalidateTag: vi.fn() }));
import { revalidatePath, revalidateTag } from 'next/cache';
import { revalidateCmsTarget } from '@/lib/revalidate';

describe('revalidateCmsTarget — chemins reellement revalides', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('revalide /guides/<slug> pour une cle de guide', async () => {
    const r = await revalidateCmsTarget({ page: 'guides-top-10-pepites-madere' });
    expect(revalidatePath).toHaveBeenCalledWith('/guides/top-10-pepites-madere');
    expect(r.revalidated).toContain('/guides/top-10-pepites-madere');
  });

  it('revalide /destinations/cote-d-azur/beausoleil', async () => {
    await revalidateCmsTarget({ page: 'destinations-cote-d-azur-beausoleil', type: 'destination' });
    expect(revalidatePath).toHaveBeenCalledWith('/destinations/cote-d-azur/beausoleil');
  });

  it('revalide /temoignages', async () => {
    await revalidateCmsTarget({ page: 'temoignages' });
    expect(revalidatePath).toHaveBeenCalledWith('/temoignages');
  });

  it('revalide /blog', async () => {
    await revalidateCmsTarget({ page: 'blog' });
    expect(revalidatePath).toHaveBeenCalledWith('/blog');
  });

  it('invalide le tag cms-zones a chaque appel', async () => {
    await revalidateCmsTarget({ page: 'destinations-sardaigne' });
    expect(revalidateTag).toHaveBeenCalledWith('cms-zones');
  });

  it('revalide la destination parente pour une sous-destination', async () => {
    await revalidateCmsTarget({ page: 'destinations-madere-funchal' });
    expect(revalidatePath).toHaveBeenCalledWith('/destinations/madere/funchal');
    expect(revalidatePath).toHaveBeenCalledWith('/destinations/madere');
  });
});
