// Ce qu'un texte affirme et que seul l'auteur peut confirmer.
//
// Le garde-fou de voix (validateGardeFous) mesure la ressemblance avec du
// vécu ; il note 100 % un texte inventé de bout en bout. Ici on ne juge pas,
// on extrait : chaque phrase qui porte un chiffre, un prix, un horaire, une
// date, un lieu nommé ou un « on a … » est une affirmation à confirmer avant
// publication. Déterministe, sans modèle — la liste est courte et lisible.

export type Revendication = {
  type: 'prix' | 'chiffre' | 'horaire' | 'date' | 'lieu' | 'vecu';
  phrase: string;
};

const CONSIGNES_DE_PROMPT = [
  'accroche vécue',
  'histoire humaine',
  'détail sensoriel testé',
  'infos pratiques geo-friendly',
  'verdict heldonica & nuances',
];

const MOIS = 'janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre';

const RE_PRIX = /\d+(?:[.,]\d+)?\s?(?:€|euros?|eur\b|chf|francs?)/i;
const RE_CHIFFRE = /\d+(?:[.,]\d+)?\s?(?:%|km\b|m\b|mètres?|kilomètres?|kg|°\s?c|min\b|minutes?|heures?\b|h\b|jours?\b|nuits?\b|places?\b|marches?\b)/i;
const RE_HORAIRE = /\b\d{1,2}\s?h\s?\d{0,2}\b|\b\d{1,2}:\d{2}\b/;
const RE_DATE = new RegExp(`\\b(?:\\d{1,2}(?:er)?\\s(?:${MOIS})|(?:${MOIS})\\s\\d{4}|\\b20\\d{2}\\b)`, 'i');
const RE_VECU = /\bon (?:a|est|avait|était|s'est)\s+(?:mangé|dormi|testé|payé|marché|pris|goûté|vu|croisé|attendu|dîné|déjeuné|loué|réservé|roulé|nagé|grimpé|rencontré|acheté|commandé|dégusté|découvert|passé|parti|arrivé|resté|monté|descendu)/i;
// Un nom propre qui n'ouvre pas la phrase : « … au Mercado dos Lavradores … »
const RE_LIEU = /(?<=[^.!?]\s)(?:[A-ZÀ-Ý][a-zà-ÿ'’-]{3,}(?:\s(?:d[aeiou]s?|de la|du|des|do|da|dos|das|la|le|les|von|van|del|della)\s[A-ZÀ-Ý][a-zà-ÿ'’-]{2,}|\s[A-ZÀ-Ý][a-zà-ÿ'’-]{3,})+)/;

function texteBrut(html: string): string {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<\/(p|h[1-6]|li|div|br|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;/g, '’')
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, ' ');
}

function phrases(texte: string): string[] {
  return texte
    .split(/(?<=[.!?…])\s+|\n+/)
    .map((p) => p.trim())
    .filter((p) => p.length >= 20);
}

/** Les titres de section sont encore les consignes du prompt : texte du
 *  générateur jamais relu. */
export function porteLesConsignesDuPrompt(html: string): boolean {
  const t = texteBrut(html).toLowerCase();
  return CONSIGNES_DE_PROMPT.some((c) => t.includes(c));
}

export function extraireRevendications(html: string, max = 12): { total: number; extraits: Revendication[] } {
  const vues = new Set<string>();
  const toutes: Revendication[] = [];
  for (const ph of phrases(texteBrut(html))) {
    let type: Revendication['type'] | null = null;
    if (RE_PRIX.test(ph)) type = 'prix';
    else if (RE_HORAIRE.test(ph)) type = 'horaire';
    else if (RE_DATE.test(ph)) type = 'date';
    else if (RE_CHIFFRE.test(ph)) type = 'chiffre';
    else if (RE_VECU.test(ph)) type = 'vecu';
    else if (RE_LIEU.test(ph)) type = 'lieu';
    if (!type) continue;
    const cle = ph.slice(0, 80).toLowerCase();
    if (vues.has(cle)) continue;
    vues.add(cle);
    toutes.push({ type, phrase: ph.length > 180 ? ph.slice(0, 177).trimEnd() + '…' : ph });
  }
  // Les plus vérifiables d'abord : ce qui se chiffre, puis le vécu, puis les lieux.
  const ordre: Record<Revendication['type'], number> = { prix: 0, horaire: 1, date: 2, chiffre: 3, vecu: 4, lieu: 5 };
  toutes.sort((a, b) => ordre[a.type] - ordre[b.type]);
  return { total: toutes.length, extraits: toutes.slice(0, max) };
}

export const LIBELLES_REVENDICATION: Record<Revendication['type'], string> = {
  prix: 'prix',
  horaire: 'horaire',
  date: 'date',
  chiffre: 'chiffre',
  vecu: 'vécu',
  lieu: 'lieu',
};

// ---------------------------------------------------------------------------
// Ce qu'un texte généré a AJOUTÉ par rapport à la source de l'autrice.
//
// Le contrôle des chiffres ne voit pas « le brouhaha des premiers vendeurs »,
// « le cliquetis des chariots » ni une réplique entre guillemets — mesuré le
// 21/09/2026 sur « Partir d'une idée » : notes fidèles aux chiffres près, et
// trois inventions sensorielles. Ici on compare mot à mot : une sensation ou
// une citation présente dans le texte et absente des notes est un ajout.
// Déterministe, lexique court et lisible ; il rate des choses, il n'en
// invente pas.

export type Ajout = { type: 'son' | 'odeur' | 'gout' | 'toucher' | 'temperature' | 'citation'; mot: string };

const LEXIQUE_SENSORIEL: Record<Exclude<Ajout['type'], 'citation'>, string[]> = {
  son: ['bruit', 'brouhaha', 'cliquetis', 'silence', 'murmure', 'grince', 'craque', 'chant', 'cri', 'klaxon', 'cloche', 'souffle', 'siffle', 'resonne', 'vacarme', 'bourdonn', 'clapotis', 'crisse', 'tinte', 'rumeur', 'echo'],
  odeur: ['odeur', 'parfum', 'effluve', 'fumet', 'senteur', 'embaume', 'arome', 'relent'],
  gout: ['gout', 'sucre', 'sale', 'amer', 'acide', 'croquant', 'fondant', 'juteu', 'savoureu', 'epice'],
  toucher: ['rugueu', 'lisse', 'humide', 'collant', 'texture', 'grain', 'soyeu', 'granuleu', 'velout', 'poisseu'],
  temperature: ['tiede', 'brulant', 'glace', 'frais', 'fraicheur', 'chaleur', 'moite', 'glacial'],
};

function sansAccents(t: string): string {
  return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

/** Sensations et citations présentes dans `texte` et absentes de `source`. */
export function ajoutsParRapportA(texte: string, source: string, max = 12): Ajout[] {
  const t = sansAccents(texteBrut(texte));
  const s = sansAccents(texteBrut(source));
  const ajouts: Ajout[] = [];
  const vus = new Set<string>();

  for (const [type, racines] of Object.entries(LEXIQUE_SENSORIEL) as [Exclude<Ajout['type'], 'citation'>, string[]][]) {
    for (const r of racines) {
      const re = new RegExp(`\\b${r}\\w*`, 'g');
      const dansTexte = t.match(re);
      if (!dansTexte || s.match(re)) continue;
      const mot = dansTexte[0];
      if (vus.has(mot)) continue;
      vus.add(mot);
      ajouts.push({ type, mot });
    }
  }

  // Une réplique entre guillemets — « … » ou "…" — de trois mots ou plus, que
  // la source ne contient pas : un dialogue inventé.
  for (const m of texte.matchAll(/[«"“]\s*([^»"”]{6,160}?)\s*[»"”]/g)) {
    const citation = m[1].trim();
    if (citation.split(/\s+/).length < 3) continue;
    if (s.includes(sansAccents(citation).slice(0, 40))) continue;
    const cle = `cit:${citation.slice(0, 40)}`;
    if (vus.has(cle)) continue;
    vus.add(cle);
    ajouts.push({ type: 'citation', mot: citation.length > 60 ? citation.slice(0, 57) + '…' : citation });
  }

  return ajouts.slice(0, max);
}

export const LIBELLES_AJOUT: Record<Ajout['type'], string> = {
  son: 'son',
  odeur: 'odeur',
  gout: 'goût',
  toucher: 'toucher',
  temperature: 'température',
  citation: 'citation',
};
