/**
 * Heldonica CMS — Types de contenu à démarrer en un clic.
 *
 * Un article ne devrait pas commencer par une page blanche : selon qu'on
 * raconte un carnet, un itinéraire, une adresse ou une table, la structure et
 * la rubrique diffèrent. Ce fichier porte ce choix, et rien d'autre.
 *
 * Miroir de `app/engine/content_studio.py` (Cerveau, Studio mobile) : mêmes ids,
 * mêmes catégories, mêmes sections. Ajouter un type se fait aux deux endroits —
 * sinon le brouillon créé depuis le téléphone atterrirait dans une rubrique
 * que le panneau ne connaît pas.
 *
 * Les sections sont posées VIDES, volontairement : on n'invente rien
 * (AGENTS.md, règle 1). C'est l'auteur qui remplit.
 */

export type CmsContentTypeId = 'carnet' | 'guide' | 'adresse' | 'table';

export interface CmsContentType {
  id: CmsContentTypeId;
  label: string;
  /** Valeur exacte de `cms_blog_posts.category` (voir CategorySelect). */
  category: string;
  summary: string;
  tags: string[];
  /** Titres de sections, dans l'ordre éditorial. */
  sections: string[];
  placeLabel: string;
  notesLabel: string;
}

export const CMS_CONTENT_TYPES: CmsContentType[] = [
  {
    id: 'carnet',
    label: 'Carnet de voyage',
    category: 'Carnets Voyage',
    summary: 'Un récit vécu, du premier pas au dernier soir.',
    tags: ['carnet', 'slow travel'],
    sections: [
      "L'accroche vécue",
      'Le récit',
      'Les pépites',
      "Ce qu'on a moins aimé",
      'Repères pratiques',
    ],
    placeLabel: 'Où était-on',
    notesLabel: "Ce qu'on a vécu",
  },
  {
    id: 'guide',
    label: 'Guide pépites',
    category: 'Guides Pratiques',
    summary: 'Un itinéraire ou un quartier, étape par étape.',
    tags: ['guide', 'itinéraire'],
    sections: ["Pourquoi y aller", "L'itinéraire", 'Les étapes', 'Repères pratiques'],
    placeLabel: 'Destination',
    notesLabel: 'Ce qui mérite le détour',
  },
  {
    id: 'adresse',
    label: 'Adresse dénichée',
    category: 'Découvertes Locales',
    summary: "Un lieu précis, ce qu'on y a trouvé, comment y aller.",
    tags: ['adresse', 'pépite'],
    sections: ["L'adresse", "Ce qu'on y a trouvé", 'Comment y aller', 'Repères pratiques'],
    placeLabel: 'Ville / quartier',
    notesLabel: "Ce qu'on y a vu, goûté, entendu",
  },
  {
    id: 'table',
    label: 'Table & goût',
    category: 'Nourriture',
    summary: 'Un comptoir, une assiette, une ambiance.',
    tags: ['table', 'goût'],
    sections: ['La table', "Ce qu'on a goûté", "L'ambiance", 'Repères pratiques'],
    placeLabel: 'Ville / quartier',
    notesLabel: "Ce qu'on a goûté, senti, remarqué",
  },
];

export function getCmsContentType(id: string): CmsContentType | undefined {
  return CMS_CONTENT_TYPES.find((type) => type.id === id);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Structure de départ : un titre de section par étape, paragraphe vide.
 * Aucune phrase pré-écrite — un texte générique sonnerait juste et se
 * tromperait, exactement ce que la règle « on n'invente rien » interdit.
 */
export function starterContent(type: CmsContentType): string {
  return type.sections
    .map((section) => `<h2>${escapeHtml(section)}</h2>\n<p></p>`)
    .join('\n');
}
