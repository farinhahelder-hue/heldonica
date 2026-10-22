import { describe, it, expect } from 'vitest';
import { scanSourceForHardcodedText, compareToBaseline } from '../../scripts/check-cms-hardcode.mjs';

const kinds = (src: string) => scanSourceForHardcodedText(src, 'x.tsx').map((v: { kind: string }) => v.kind);

/**
 * Le garde-fou doit COMPTER le texte visible écrit en dur et IGNORER ce qui
 * passe déjà par le CMS (replis des helpers), le SEO et le style.
 */
describe('check-cms-hardcode', () => {
  describe('texte en dur : compté', () => {
    it('compte un texte JSX', () => {
      expect(kinds('const A = () => <p>Préparer un voyage</p>')).toEqual(['jsx']);
    });

    it('compte un attribut visible littéral', () => {
      expect(kinds('const A = () => <input placeholder="ton adresse email" />')).toEqual(['attr']);
      expect(kinds('const A = () => <img alt="Sceau officiel Heldonica" />')).toEqual(['attr']);
    });

    it('compte une phrase dans un tableau de données', () => {
      expect(kinds("const faq = [{ q: 'Combien coûte un voyage ?' }]")).toEqual(['data']);
    });

    it('compte les deux branches d\'un ternaire affiché', () => {
      expect(kinds("const A = ({ s }) => <button>{s ? 'Envoi en cours' : 'Envoyer ma demande'}</button>")).toEqual(['data', 'data']);
    });

    it('compte un message passé à un setter React', () => {
      expect(kinds("setError('Adresse email invalide')")).toEqual(['data']);
    });
  });

  describe('déjà dans le CMS ou hors sujet : ignoré', () => {
    it('ignore le repli d\'EditableZone', () => {
      expect(kinds('const A = () => <EditableZone page="home" zone="x" fallback="Préparer un voyage" />')).toEqual([]);
    });

    it('ignore les replis des helpers CMS, même imbriqués', () => {
      expect(kinds("const a = getCmsOrSetting('k', 's', 'Slow travel vécu', z, s)")).toEqual([]);
      expect(kinds("const l = getZoneLinks('nav_item', [{ label: 'Voyager avec nous', url: '/x' }], z)")).toEqual([]);
      expect(kinds("const b = Z('cta', 'text', 'Préparer un voyage')")).toEqual([]);
      expect(kinds("const c = useZoneText('form_cta', 'Échanger sur mon projet')")).toEqual([]);
    });

    it('ignore aria-label, même calculé', () => {
      expect(kinds('const A = () => <button aria-label="Fermer le menu" />')).toEqual([]);
      expect(kinds("const A = ({ o }) => <button aria-label={o ? 'Fermer le menu' : 'Ouvrir le menu'} />")).toEqual([]);
    });

    it('ignore les classes CSS et les blocs de style', () => {
      expect(kinds("const c = open ? 'bg-[#F7F3EC]/98 backdrop-blur-md border-b' : 'translate-x-full opacity-0'")).toEqual([]);
      expect(kinds('const css = `@keyframes slideUp { from { opacity: 0; } to { opacity: 1; } }`')).toEqual([]);
    });

    it('ignore le SEO et le JSON-LD', () => {
      expect(kinds("const metadata = { title: 'Heldonica — Slow travel vécu en duo' }")).toEqual([]);
      expect(kinds("const schemaOrg = { description: 'Blog slow travel en duo' }")).toEqual([]);
    });

    it('ignore les comparaisons de valeurs internes', () => {
      expect(kinds("const isTravel = p.category === 'Carnets Voyage'")).toEqual([]);
    });
  });

  describe('cliquet', () => {
    it('refuse une hausse et un nouveau fichier non nul', () => {
      const { regressions } = compareToBaseline({ 'a.tsx': 5, 'b.tsx': 1 }, { 'a.tsx': 4 });
      expect(regressions.map((r: { file: string }) => r.file)).toEqual(['a.tsx', 'b.tsx']);
    });

    it('signale une baisse comme un gain, sans échouer', () => {
      const { regressions, gains } = compareToBaseline({ 'a.tsx': 2 }, { 'a.tsx': 4 });
      expect(regressions).toEqual([]);
      expect(gains).toEqual([{ file: 'a.tsx', ref: 4, n: 2 }]);
    });
  });
});
