/**
 * Heldonica CMS — registre des schemas de blocs.
 *
 * Une seule verite par type de bloc : les champs attendus, leurs bornes, les
 * valeurs admises. Ce registre est consomme par la validation d'ecriture
 * (`validateBlocks`), et verifie en CI par `scripts/check-cms-schema.mjs` :
 * un type present dans `BlockType` sans entree ici fait echouer les
 * garde-fous, donc on ne peut plus ajouter un bloc « a moitie ».
 *
 * Les types TypeScript de `types/cms-blocks.ts` restent la projection de ce
 * registre cote code. Les deux doivent dire la meme chose ; c'est le garde-fou
 * qui le verifie, pas la bonne volonte.
 */

import type { CmsBlock } from '@/types/cms-blocks';
import type { BlockSchema, BlockIssue } from './validate';
import { validateBlock } from './validate';

// Le registre re-exporte le moteur : un appelant n'a qu'un import a connaitre.
export { validateBlock, formatIssues } from './validate';
export type { BlockIssue, BlockSchema, FieldKind, FieldSpec } from './validate';

const HOTSPOT: BlockSchema['fields'][number] = {
  name: 'hotspot',
  kind: 'object',
  fields: [
    { name: 'x', kind: 'number', required: true, min: 0, max: 1 },
    { name: 'y', kind: 'number', required: true, min: 0, max: 1 },
  ],
};

export const BLOCK_SCHEMAS: ReadonlyArray<BlockSchema> = [
  {
    type: 'text',
    title: 'Texte',
    fields: [{ name: 'content', kind: 'string', required: true }],
  },
  {
    type: 'heading',
    title: 'Titre',
    fields: [
      { name: 'level', kind: 'enum', required: true, values: [1, 2, 3, 4] },
      { name: 'text', kind: 'string', required: true },
      { name: 'subtitle', kind: 'string' },
    ],
  },
  {
    type: 'image',
    title: 'Image',
    fields: [
      { name: 'url', kind: 'url', required: true },
      { name: 'alt', kind: 'string', required: true },
      { name: 'caption', kind: 'string' },
      { name: 'layout', kind: 'enum', required: true, values: ['inline', 'wide', 'fullwidth'] },
      { name: 'aspectRatio', kind: 'enum', values: ['16:9', '4:3', '1:1', 'auto'] },
      HOTSPOT,
    ],
  },
  {
    type: 'gallery',
    title: 'Galerie',
    fields: [
      {
        name: 'images',
        kind: 'array',
        required: true,
        item: {
          name: 'image',
          kind: 'object',
          fields: [
            { name: 'url', kind: 'url', required: true },
            { name: 'alt', kind: 'string', required: true },
            { name: 'caption', kind: 'string' },
            HOTSPOT,
          ],
        },
      },
      {
        name: 'displayMode',
        kind: 'enum',
        required: true,
        values: ['carousel', 'grid_2', 'grid_3', 'masonry'],
      },
    ],
  },
  {
    type: 'button',
    title: 'Bouton',
    fields: [
      { name: 'label', kind: 'string', required: true },
      { name: 'url', kind: 'url', required: true },
      {
        name: 'variant',
        kind: 'enum',
        required: true,
        values: ['primary_gold', 'outline', 'subtle'],
      },
      { name: 'openInNewTab', kind: 'boolean' },
    ],
  },
  {
    type: 'list',
    title: 'Liste',
    fields: [
      {
        name: 'items',
        kind: 'array',
        required: true,
        item: { name: 'item', kind: 'string', required: true },
      },
      { name: 'style', kind: 'enum', required: true, values: ['bullet', 'numbered', 'checklist'] },
    ],
  },
  {
    type: 'video',
    title: 'Video',
    fields: [
      { name: 'source', kind: 'enum', required: true, values: ['local', 'youtube'] },
      { name: 'url', kind: 'url', required: true },
      { name: 'aspectRatio', kind: 'enum', required: true, values: ['16:9', '9:16'] },
      { name: 'autoPlay', kind: 'boolean' },
      { name: 'caption', kind: 'string' },
    ],
  },
  {
    type: 'vault_spot',
    title: 'Pepite du Coffre',
    fields: [
      { name: 'spotId', kind: 'string' },
      { name: 'title', kind: 'string', required: true },
      { name: 'location', kind: 'string', required: true },
      { name: 'livedExperience', kind: 'string', required: true },
    ],
  },
  {
    type: 'photo_evidence',
    title: 'Preuve photo',
    fields: [
      { name: 'imageUrl', kind: 'url', required: true },
      { name: 'location', kind: 'string', required: true },
      { name: 'date', kind: 'date', required: true },
      // Charte : une anecdote de preuve tient en 200 caracteres
      // (types/cms-blocks.ts). Au-dela, ce n'est plus une legende de preuve.
      { name: 'anecdote', kind: 'string', required: true, maxLength: 200 },
      { name: 'albumLink', kind: 'url' },
      { name: 'cameraInfo', kind: 'string' },
      HOTSPOT,
    ],
  },
  {
    type: 'map',
    title: 'Carte',
    fields: [
      {
        name: 'center',
        kind: 'object',
        required: true,
        fields: [
          { name: 'lat', kind: 'number', required: true, min: -90, max: 90 },
          { name: 'lng', kind: 'number', required: true, min: -180, max: 180 },
        ],
      },
      { name: 'zoom', kind: 'number', required: true, min: 1, max: 18 },
      {
        name: 'markers',
        kind: 'array',
        item: {
          name: 'marker',
          kind: 'object',
          fields: [
            { name: 'id', kind: 'string', required: true },
            { name: 'lat', kind: 'number', required: true, min: -90, max: 90 },
            { name: 'lng', kind: 'number', required: true, min: -180, max: 180 },
            { name: 'label', kind: 'string', required: true },
            { name: 'description', kind: 'string' },
          ],
        },
      },
      { name: 'caption', kind: 'string' },
      { name: 'mapStyle', kind: 'enum', values: ['topo', 'minimal', 'voyage'] },
    ],
  },
  {
    type: 'table_of_contents',
    title: 'Sommaire',
    fields: [
      { name: 'title', kind: 'string' },
      { name: 'maxLevel', kind: 'enum', values: [2, 3] },
      { name: 'displayStyle', kind: 'enum', values: ['list', 'numbered', 'cards'] },
    ],
  },
  {
    type: 'hospitality_spot',
    title: 'Hebergement',
    fields: [
      { name: 'name', kind: 'string', required: true },
      { name: 'location', kind: 'string', required: true },
      { name: 'hostName', kind: 'string' },
      {
        name: 'ethicalCriteria',
        kind: 'object',
        required: true,
        fields: [
          { name: 'localFood', kind: 'boolean', required: true },
          { name: 'lowCarbonAccess', kind: 'boolean', required: true },
          { name: 'quietAtmosphere', kind: 'boolean', required: true },
          { name: 'fairPricing', kind: 'boolean', required: true },
        ],
      },
      { name: 'livedAnecdote', kind: 'string' },
      { name: 'directBookingUrl', kind: 'url' },
      { name: 'priceIndication', kind: 'string' },
    ],
  },
];

const PAR_TYPE = new Map(BLOCK_SCHEMAS.map((schema) => [schema.type, schema]));

export function blockSchemaFor(type: string): BlockSchema | undefined {
  return PAR_TYPE.get(type);
}

/** Types couverts par le registre, dans l'ordre de declaration. */
export function schemaTypes(): string[] {
  return BLOCK_SCHEMAS.map((schema) => schema.type);
}

export interface BlockValidationIssue extends BlockIssue {
  /** Index du bloc dans le document, absent pour un bloc seul. */
  index?: number;
  /** Type annonce par le bloc, meme s'il n'existe pas dans le registre. */
  blockType?: string;
}

/**
 * Valide une liste de blocs. Un type inconnu est signale au lieu d'etre
 * ignore : un bloc ajoute par un agent plus recent que le registre doit
 * apparaitre, pas disparaitre silencieusement du rendu.
 */
export function validateBlocks(blocks: unknown): BlockValidationIssue[] {
  if (!Array.isArray(blocks)) {
    return [{ path: '', message: 'tableau de blocs attendu' }];
  }

  const issues: BlockValidationIssue[] = [];

  blocks.forEach((bloc, index) => {
    const type = typeof bloc === 'object' && bloc !== null ? (bloc as { type?: unknown }).type : undefined;
    const schema = typeof type === 'string' ? PAR_TYPE.get(type) : undefined;

    if (!schema) {
      issues.push({
        index,
        blockType: typeof type === 'string' ? type : undefined,
        path: 'type',
        message: typeof type === 'string' ? `type de bloc inconnu : ${type}` : 'type de bloc manquant',
      });
      return;
    }

    for (const issue of validateBlock(bloc, schema)) {
      issues.push({ ...issue, index, blockType: schema.type });
    }
  });

  return issues;
}

/** Vrai si le document ne contient aucune erreur de bloc. */
export function areBlocksValid(blocks: unknown): blocks is CmsBlock[] {
  return validateBlocks(blocks).length === 0;
}
