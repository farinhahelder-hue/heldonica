import { describe, expect, it } from 'vitest';
import { extraireRevendications, porteLesConsignesDuPrompt } from '@/lib/revendications';

describe('revendications — ce que seul l’auteur peut confirmer', () => {
  it('extrait prix, horaires, dates, chiffres, vécu et lieux, les plus vérifiables d’abord', () => {
    const html = `
      <p>On est arrivés au Mercado dos Lavradores vers 7 h 30, avant les cars.</p>
      <p>Les fruits de la passion se vendent jusqu’à 35 €/kg sur les étals du fond.</p>
      <p>La levada fait 12 km aller-retour, comptez trois bonnes heures de marche.</p>
      <p>On a mangé une espada au marché, coupée devant nous.</p>
      <p>En avril 2026, la brume couvrait Paul da Serra dès midi.</p>
      <p>Il faisait beau et on était contents.</p>
    `;
    const { total, extraits } = extraireRevendications(html);
    expect(total).toBe(5);
    expect(extraits[0].type).toBe('prix');
    expect(extraits[0].phrase).toContain('35 €');
    expect(extraits.map((e) => e.type)).toEqual(['prix', 'horaire', 'date', 'chiffre', 'vecu']);
    expect(extraits.some((e) => e.phrase.includes('contents'))).toBe(false);
  });

  it('ne compte pas deux fois la même phrase et respecte le plafond', () => {
    const phrase = '<p>Le billet coûte 5 € et la montée dure 20 min.</p>';
    const { total, extraits } = extraireRevendications(phrase.repeat(4) + '<p>La cabine met 8 min à monter.</p>', 1);
    expect(total).toBe(2);
    expect(extraits).toHaveLength(1);
  });

  it('reconnaît un texte du générateur jamais relu par ses titres de consigne', () => {
    expect(porteLesConsignesDuPrompt('<h2>Accroche vécue</h2><p>On est partis tôt.</p>')).toBe(true);
    expect(porteLesConsignesDuPrompt('<h2>Le marché à 7 h</h2><p>On est partis tôt.</p>')).toBe(false);
  });

  it('un texte sans rien à confirmer rend une liste vide', () => {
    expect(extraireRevendications('<p>On aime prendre le temps, et on le dit sans détour.</p>')).toEqual({ total: 0, extraits: [] });
  });
});

import { ajoutsParRapportA } from '@/lib/revendications';

describe('ajoutsParRapportA — ce que le texte généré a ajouté', () => {
  const notes = 'Marché de Funchal, 7h30. On a acheté deux maracujás, 1,20 € pièce. Le vendeur a ri quand on a demandé si c’était mûr.';

  it('relève les sensations et les répliques absentes des notes', () => {
    const texte = `<p>Le brouhaha des premiers vendeurs se mêle au cliquetis des chariots. Une odeur de poisson flotte.</p>
      <p>« Ils le sont ! », répond-il en pointant la chair brillante. Le vendeur a ri quand on a demandé si c’était mûr.</p>`;
    const a = ajoutsParRapportA(texte, notes);
    expect(a.map((x) => x.type)).toEqual(expect.arrayContaining(['son', 'odeur', 'citation']));
    expect(a.find((x) => x.type === 'son')?.mot).toBe('brouhaha');
    expect(a.filter((x) => x.type === 'son').map((x) => x.mot)).toEqual(['brouhaha', 'cliquetis']);
    expect(a.find((x) => x.type === 'citation')?.mot).toContain('Ils le sont');
  });

  it('ne compte pas ce que les notes contiennent déjà', () => {
    const texte = '<p>Le vendeur a ri quand on a demandé si c’était mûr. Un cliquetis de pièces.</p>';
    const a = ajoutsParRapportA(texte, notes + ' On entendait le cliquetis de la caisse.');
    expect(a).toEqual([]);
  });

  it('ignore les guillemets courts et un texte fidèle', () => {
    expect(ajoutsParRapportA('<p>On a acheté deux maracujás, dits « mûrs ».</p>', notes)).toEqual([]);
  });
});
