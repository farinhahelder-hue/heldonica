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
