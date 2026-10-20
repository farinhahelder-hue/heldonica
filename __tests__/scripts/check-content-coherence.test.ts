import { describe, it, expect } from 'vitest';
import { classerLignesContenu, motsBannisDans, articlesPubliesAvecMotBanniMeta } from '../../scripts/check-content-coherence.mjs';

/**
 * Ce contrôle ne lisait QUE cms_blog_posts : un mot banni dans une zone CMS,
 * une destination d'accueil, une sous-destination ou un item de guide ne faisait
 * jamais rougir la CI. C'est là que vivaient 7 fuites actives trouvées à la main
 * le 20/10/2026 (audit éditorial lot 2). On teste donc la distinction qui compte :
 * ce qui est SERVI bloque, ce qui est inactif ou quarantainé est de la dette.
 */
describe('check-content-coherence — mots bannis hors articles', () => {
  it('détecte un mot banni par sous-chaîne, pas seulement au mot entier', () => {
    // L'angle mort du lot 2 : un matcher à frontières de mot ratait les formes
    // fléchies. « circuits », « spots », « incroyables » doivent matcher.
    expect(motsBannisDans('hors des circuits habituels')).toContain('circuit');
    expect(motsBannisDans('Restaurants, sentiers, spots photo')).toContain('spot');
    expect(motsBannisDans('on a trouvé des trucs incroyables')).toContain('incroyable');
  });

  it('ignore un texte sans mot banni', () => {
    expect(motsBannisDans('On a testé ce sentier au lever du jour.')).toEqual([]);
    expect(motsBannisDans('')).toEqual([]);
    expect(motsBannisDans(null)).toEqual([]);
  });

  it('classe une zone active sur page publiée comme fuite bloquante', () => {
    const { fuites, dette } = classerLignesContenu({
      zones: [{ page: 'destinations-alentejo', zone_key: 'faq_1_a', is_active: true, value: 'hors des circuits habituels' }],
    });
    expect(fuites).toHaveLength(1);
    expect(fuites[0].ou).toBe('destinations-alentejo / faq_1_a');
    expect(dette).toHaveLength(0);
  });

  it('classe une zone inactive comme dette non bloquante', () => {
    const { fuites, dette } = classerLignesContenu({
      zones: [{ page: 'nos-services', zone_key: 'faq_3_answer', is_active: false, value: 'les voyageurs' }],
    });
    expect(fuites).toHaveLength(0);
    expect(dette).toHaveLength(1);
    expect(dette[0].actif).toBe(false);
  });

  it('classe une zone active sur page quarantainée comme dette, pas fuite', () => {
    const quarantaine = new Set(['destinations-roumanie-itineraire-7-jours']);
    const { fuites, dette } = classerLignesContenu(
      { zones: [{ page: 'destinations-roumanie-itineraire-7-jours', zone_key: 'blurb', is_active: true, value: 'couleurs incroyables' }] },
      quarantaine
    );
    expect(fuites).toHaveLength(0);
    expect(dette).toHaveLength(1);
    expect(dette[0].quarantaine).toBe(true);
  });

  it('couvre les quatre sources : zones, accueil, sous-destinations, guides', () => {
    const { fuites } = classerLignesContenu({
      homeDests: [{ slug: 'madere', is_active: true, title: 'Madère', description: '', eyebrow: 'Destination coup de cœur' }],
      guideItems: [{ guide_slug: 'top-10-pepites-madere', rank: 3, is_active: true, title: 'Porto Moniz', description: 'les autres spots', secret: '' }],
    });
    const ou = fuites.map((f) => f.ou);
    expect(ou).toContain('cms_home_destinations / madere');
    expect(ou).toContain('cms_guide_items / top-10-pepites-madere #3');
  });

  it('ne signale rien quand tout est propre', () => {
    const { fuites, dette } = classerLignesContenu({
      zones: [{ page: 'home', zone_key: 'hero', is_active: true, value: 'On a testé ce sentier.' }],
    });
    expect(fuites).toEqual([]);
    expect(dette).toEqual([]);
  });
});

/**
 * Les champs meta (meta_title, meta_description, seo_title, seo_description)
 * étaient hors du scan : un mot banni publié dans une meta_description partait
 * dans les balises <meta> et les aperçus de partage, CI au vert. On teste la
 * distinction publié (fuite bloquante) / brouillon (dette, non bloquante).
 */
describe('check-content-coherence — mots bannis dans les champs meta', () => {
  it('signale un article publié avec un mot banni dans meta_description', () => {
    const r = articlesPubliesAvecMotBanniMeta([
      { id: 1, slug: 'canal-saint-martin', published: true, meta_description: 'cinq spots calmes', meta_title: null },
    ]);
    expect(r).toHaveLength(1);
    expect(r[0].slug).toBe('canal-saint-martin');
    expect(r[0].mots).toContain('spot');
  });

  it('couvre les quatre champs meta', () => {
    const r = articlesPubliesAvecMotBanniMeta([
      { id: 1, slug: 'a', published: true, meta_title: 'un circuit' },
      { id: 2, slug: 'b', published: true, seo_title: 'des astuces' },
      { id: 3, slug: 'c', published: true, seo_description: 'expérience inoubliable' },
      { id: 4, slug: 'd', published: true, meta_description: 'au cœur de Paris' },
    ]);
    expect(r.map((x) => x.slug)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('ne bloque pas un brouillon (dette), même avec un mot banni en meta', () => {
    const r = articlesPubliesAvecMotBanniMeta([
      { id: 1, slug: 'brouillon', published: false, meta_description: 'les meilleurs spots' },
    ]);
    expect(r).toEqual([]);
  });

  it('ne signale rien quand les champs meta sont propres ou absents', () => {
    const r = articlesPubliesAvecMotBanniMeta([
      { id: 1, slug: 'propre', published: true, meta_description: 'On a testé ce sentier au lever du jour.', meta_title: null },
    ]);
    expect(r).toEqual([]);
  });
});
