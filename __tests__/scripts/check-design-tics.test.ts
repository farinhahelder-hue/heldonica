import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import { scanSourceForDesignTics, runDesignTicsCheck, runApiEmojiCheck } from '../../scripts/check-design-tics.mjs';

/**
 * Le garde-fou doit REFUSER les tics « IA / SaaS » (preuve par le cas fautif)
 * et ACCEPTER la référence « carnet de route imprimé ».
 */
describe('check-design-tics', () => {
  describe('cas fautifs : le garde-fou échoue', () => {
    it('refuse un emoji décoratif dans le JSX', () => {
      const v = scanSourceForDesignTics('<span>✨ Bienvenue</span>', 'x.tsx');
      expect(v.map((x) => x.kind)).toEqual(['emoji']);
    });

    it('refuse une prop flag_emoji en dur (code ISO ou nom d\'icone)', () => {
      const v1 = scanSourceForDesignTics('<ComingSoonDestination flag_emoji="CO" />', 'x.tsx');
      expect(v1.map((x) => x.kind)).toEqual(['flag-prop']);
      const v2 = scanSourceForDesignTics('<ComingSoonDestination flag_emoji="Landmark" />', 'x.tsx');
      expect(v2.map((x) => x.kind)).toEqual(['flag-prop']);
    });

    it('refuse un drapeau emoji dans les données', () => {
      const v = scanSourceForDesignTics("const p = { flag: '🇫🇷' }", 'x.tsx');
      expect(v.some((x) => x.kind === 'emoji')).toBe(true);
    });

    it('refuse un symbole hors des plages historiques (⏰ ⭐)', () => {
      expect(scanSourceForDesignTics('emoji: "⏰"').length).toBe(1);
      expect(scanSourceForDesignTics('<b>⭐⭐⭐</b>').length).toBe(1);
    });

    it('refuse bg-white + rounded-2xl', () => {
      const v = scanSourceForDesignTics('<div className="bg-white rounded-2xl p-6 border">', 'x.tsx');
      expect(v.map((x) => x.kind)).toEqual(['saas-card']);
    });

    it('refuse bg-stone-50 + shadow-lg', () => {
      const v = scanSourceForDesignTics('<div className="bg-stone-50 p-6 shadow-lg">', 'x.tsx');
      expect(v.map((x) => x.kind)).toEqual(['saas-card']);
    });

    it('refuse rounded-3xl seul', () => {
      const v = scanSourceForDesignTics('<div className="rounded-3xl border">', 'x.tsx');
      expect(v.map((x) => x.kind)).toEqual(['saas-radius']);
    });

    it('refuse une pilule rounded-full + ombre lourde', () => {
      const v = scanSourceForDesignTics('<a className="rounded-full px-6 shadow-xl">', 'x.tsx');
      expect(v.map((x) => x.kind)).toEqual(['saas-pill']);
    });
  });

  describe('cas conformes : le garde-fou passe', () => {
    it('accepte une carte « carnet » (coton, filet lin, rounded-sm)', () => {
      const src = '<div className="bg-[#FAF7F2] rounded-sm border border-[#DED5C6] p-6">';
      expect(scanSourceForDesignTics(src)).toEqual([]);
    });

    it('accepte l\'étoile pleine ★ et une flèche au milieu du texte', () => {
      expect(scanSourceForDesignTics('<i>★★★</i> <span>Paris → Lyon</span>')).toEqual([]);
    });

    it('accepte une flèche de trajet entre deux lieux (Évora → Monsaraz)', () => {
      const src = "{Z('transport_1_desc', 'html', \"Les distances sont grandes (Évora → Monsaraz = 1h30)\")}";
      expect(scanSourceForDesignTics(src)).toEqual([]);
    });

    it('accepte une flèche de tête « ← Retour »', () => {
      expect(scanSourceForDesignTics('<a>← Toutes les destinations</a>')).toEqual([]);
    });

    it('accepte la puce CSS content: \'→\' du FAQ', () => {
      const src = '          content: \'→\';\n          font-size: 1.1rem;';
      expect(scanSourceForDesignTics(src)).toEqual([]);
    });

    it('accepte une flèche isolée en pastille', () => {
      expect(scanSourceForDesignTics('<span className="rounded-full">→</span>')).toEqual([]);
    });

    it('refuse une flèche en fin de libellé JSX', () => {
      const v = scanSourceForDesignTics('<span className="text-xs">Voir le guide →</span>', 'x.tsx');
      expect(v.map((x) => x.kind)).toEqual(['trailing-arrow']);
    });

    it('refuse une flèche en fin de fallback JSX', () => {
      const src = '<EditableZone page="a-propos" zone="service_1_cta" fallback="Lire les carnets →" />';
      expect(scanSourceForDesignTics(src, 'x.tsx').map((x) => x.kind)).toEqual(['trailing-arrow']);
    });

    it('refuse une flèche en fin de littéral', () => {
      const v = scanSourceForDesignTics("hotelier_form_submit: 'Échanger sur mon projet →',", 'x.ts');
      expect(v.map((x) => x.kind)).toEqual(['trailing-arrow']);
    });

    it('accepte une icône Lucide nommée plutôt qu\'un emoji', () => {
      expect(scanSourceForDesignTics("{ icon: 'Leaf' }")).toEqual([]);
    });

    it('ignore les commentaires', () => {
      const src = '// bg-white rounded-2xl ✨\n/* shadow-lg bg-white ✨ */\n<p>ok</p>';
      expect(scanSourceForDesignTics(src)).toEqual([]);
    });

    it('refuse un attribut className dans une chaîne HTML', () => {
      const src = '<p>{Z(\'intro_1\', \'html\', "<strong className=\\"text-mahogany\\">x</strong>")}</p>';
      expect(scanSourceForDesignTics(src, 'x.tsx').map((x) => x.kind)).toEqual(['jsx-in-string']);
    });

    it('refuse un className dans un fallback en guillemets simples', () => {
      const src = '<EditableZone fallback="a<br /><em className=\'text-eucalyptus\'>b</em>" />';
      expect(scanSourceForDesignTics(src, 'x.tsx').map((x) => x.kind)).toEqual(['jsx-in-string']);
    });

    it('accepte du JSX légitime avec plusieurs className hors chaîne', () => {
      const src = '<div className="bg-[#FAF7F2] rounded-sm"><span className="text-eucalyptus">x</span></div>';
      expect(scanSourceForDesignTics(src, 'x.tsx')).toEqual([]);
    });

    it('accepte un className passé en prop JSX', () => {
      const src = '<EditableZone className="text-eucalyptus" fallback="ok" />';
      expect(scanSourceForDesignTics(src, 'x.tsx')).toEqual([]);
    });
  });

  describe('routes API (mode emoji seul)', () => {
    it('refuse un emoji dans une route API', () => {
      const src = "subject: `✈️ Nouvelle demande — ${nom}`";
      const v = scanSourceForDesignTics(src, 'app/api/x/route.ts', { emojiOnly: true });
      expect(v.map((x) => x.kind)).toEqual(['emoji']);
    });

    it('n\'applique pas les règles SaaS au code d\'API (pas de JSX)', () => {
      const src = 'const style = { background: "bg-white rounded-2xl" }';
      expect(scanSourceForDesignTics(src, 'app/api/x/route.ts', { emojiOnly: true })).toEqual([]);
    });

    it('ne détecte aucun emoji sur les routes réelles', () => {
      const { filesScanned, violations } = runApiEmojiCheck();
      expect(filesScanned).toBeGreaterThan(100);
      expect(violations).toEqual([]);
    });
  });

  describe('dépôt réel', () => {
    it('ne détecte aucun tic sur les pages publiques', () => {
      const { filesScanned, violations } = runDesignTicsCheck();
      expect(filesScanned).toBeGreaterThan(100);
      expect(violations).toEqual([]);
    });

    it('sort en 0 via la CLI', () => {
      const out = execFileSync('node', ['scripts/check-design-tics.mjs'], { encoding: 'utf8' });
      expect(out).toContain('0 tic visuel');
    });
  });
});
