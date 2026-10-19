import { describe, it, expect, vi, beforeEach } from 'vitest';

const completion = vi.fn();
vi.mock('@/lib/cms-auth', () => ({ requireCmsAuth: async () => null }));
vi.mock('@/lib/ai-provider', () => ({ generateAiCompletion: (a: unknown) => completion(a) }));

import { POST } from '@/app/api/cms/ai-assist/route';

const BROUILLON =
  '<p>Étape : <strong>Brașov</strong></p><p>[À TOI : odeur, lumière]</p><p>[À TOI : prix payé]</p>' +
  '<figure><img src="https://x/a.jpg" alt="[À TOI : décris la photo]" /></figure>';
const NOTES = 'Ça sentait le pain chaud dès sept heures, la lumière rasait les toits de la place du marché.';

function appel(corps: Record<string, unknown>) {
  return POST(new Request('http://t/api/cms/ai-assist', { method: 'POST', body: JSON.stringify(corps) }) as never);
}

beforeEach(() => completion.mockReset());

describe('ai-assist fill_gaps', () => {
  it('refuse un brouillon absent, des notes trop courtes et un brouillon trop long', async () => {
    expect((await appel({ action: 'fill_gaps', text: NOTES, context: {} })).status).toBe(400);
    expect((await appel({ action: 'fill_gaps', text: 'court', context: { brouillon: BROUILLON } })).status).toBe(400);
    const long = await appel({ action: 'fill_gaps', text: NOTES, context: { brouillon: 'x'.repeat(30001) } });
    expect(long.status).toBe(413);
    expect(completion).not.toHaveBeenCalled();
  });

  it('envoie le brouillon entier, les notes et les lieux à l\'IA', async () => {
    completion.mockResolvedValue({ content: BROUILLON, provider: 'mock', model: 'm' });
    const r = await appel({ action: 'fill_gaps', text: NOTES, context: { brouillon: BROUILLON, lieux: ['Brașov'] } });
    expect(r.status).toBe(200);
    const prompt = completion.mock.calls[0][0].messages.map((m: { content: string }) => m.content).join('\n');
    expect(prompt).toContain('https://x/a.jpg');   // fin du brouillon présente : rien de tronqué
    expect(prompt).toContain('pain chaud');
    expect(prompt).toContain('- Brașov');
  });

  it('signale un chiffre que ni les notes ni le brouillon ne contenaient', async () => {
    completion.mockResolvedValue({
      content: BROUILLON.replace('[À TOI : prix payé]', '12 euros'),
      provider: 'mock', model: 'm',
    });
    const r = await appel({ action: 'fill_gaps', text: NOTES, context: { brouillon: BROUILLON } });
    const corps = await r.json();
    expect(corps.ajouts_non_sources.join(' ')).toContain('12');
  });

  it('ne signale rien quand la sortie reprend seulement les notes', async () => {
    completion.mockResolvedValue({
      content: BROUILLON.replace('[À TOI : odeur, lumière]', 'Ça sentait le pain chaud.'),
      provider: 'mock', model: 'm',
    });
    const corps = await (await appel({ action: 'fill_gaps', text: NOTES, context: { brouillon: BROUILLON } })).json();
    expect(corps.ajouts_non_sources).toEqual([]);
    expect(corps.data).toContain('pain chaud');
  });
});
