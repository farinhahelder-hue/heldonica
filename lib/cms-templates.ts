/**
 * Heldonica CMS — Bibliothèque de Gabarits de Carnets & Pages par Blocs
 * Phase 9 de la refonte CMS.
 *
 * Gabarits modulaires préconfigurés pour initier un article ou carnet en 1 clic :
 * - slow_travel_diary : Récit d'immersion lente avec carnet sensoriel, photo de terrain et checklist.
 * - step_by_step_guide : Guide d'itinéraire étape par étape avec pépites du Coffre des Savoirs.
 * - hospitality_spotlight : Focus hôtel de charme indépendant & hospitalité sincère.
 * - photo_essay : Essai visuel et carrousel d'ambiance basé sur des preuves photographiques réelles.
 *
 * Règle AGENTS.md n°1 : Aucun mot banni (FORBIDDEN_WORDS de lib/brand-voice.ts).
 * Règle n°2 : Typage TypeScript strict pur, zéro Zod.
 */

import { CmsBlock, createDefaultBlock } from '@/types/cms-blocks';
import { FORBIDDEN_WORDS } from '@/lib/brand-voice';

export type CmsTemplateId = 
  | 'slow_travel_diary' 
  | 'step_by_step_guide' 
  | 'hospitality_spotlight' 
  | 'photo_essay';

export interface CmsTemplate {
  id: CmsTemplateId;
  title: string;
  description: string;
  category: 'diary' | 'guide' | 'hospitality' | 'visual';
  estimatedReadingMinutes: number;
  tags: string[];
  generateBlocks: (options?: { destination?: string }) => CmsBlock[];
}

function generateId(prefix = 'blk'): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

export const CMS_TEMPLATES: Record<CmsTemplateId, CmsTemplate> = {
  slow_travel_diary: {
    id: 'slow_travel_diary',
    title: 'Carnet d\'immersion lente',
    description: 'Récit sensoriel axé sur la mémoire du lieu, le temps ralenti et une preuve visuelle de terrain.',
    category: 'diary',
    estimatedReadingMinutes: 5,
    tags: ['récit', 'immersion', 'mémoire', 'slow travel'],
    generateBlocks: (opts) => {
      const dest = opts?.destination || 'cette étape';
      return [
        {
          id: generateId('tpl_heading'),
          type: 'heading',
          level: 1,
          text: `Prendre le temps à ${dest} : carnet d'immersion`,
          subtitle: 'Loin du tumulte, une traversée attentive guidée par la lumière de l\'aube.',
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_text'),
          type: 'text',
          content: `<p>Arriver sans hâte change la texture du voyage. Plutôt que d'accumuler les kilomètres, nous avons choisi de nous arrêter là où le quotidien des habitants reprend ses droits dès les premières heures de la matinée.</p>`,
          spacing: 'normal',
        },
        {
          id: generateId('tpl_photo'),
          type: 'photo_evidence',
          imageUrl: 'https://heldonica.fr/images/destinations/montenegro/moraca_millennium.jpg',
          location: `${dest} — premier matin`,
          date: '2026-05-18',
          anecdote: 'Le silence matinal le long de la berge avant l\'éveil de la ville.',
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_heading2'),
          type: 'heading',
          level: 2,
          text: 'Ralentir le pas : repères et sensations',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_text2'),
          type: 'text',
          content: `<p>Observer la nuance de la pierre, écouter le murmure des conversations de comptoir et emprunter les ruelles secondaires. C'est dans ces interstices discrets que se révèle l'âme sincère d'une région.</p>`,
          spacing: 'normal',
        },
        {
          id: generateId('tpl_list'),
          type: 'list',
          style: 'checklist',
          items: [
            'Privilégier la marche et les trains régionaux pour savourer le paysage.',
            'S\'attabler dans les petites tables familiales tenues par des artisans locaux.',
            'Laisser une demi-journée entièrement libre sans programme fixé.',
          ],
          spacing: 'normal',
        },
        {
          id: generateId('tpl_btn'),
          type: 'button',
          label: 'Parcourir notre carnet de route complet',
          url: '/destinations',
          variant: 'primary_gold',
          spacing: 'relaxed',
        },
      ];
    },
  },

  step_by_step_guide: {
    id: 'step_by_step_guide',
    title: 'Itinéraire pas à pas',
    description: 'Guide structuré étape par étape reliant des adresses vécues et des haltes du Coffre des Savoirs.',
    category: 'guide',
    estimatedReadingMinutes: 7,
    tags: ['itinéraire', 'étapes', 'territoire', 'coffre'],
    generateBlocks: (opts) => {
      const dest = opts?.destination || 'l\'itinéraire';
      return [
        {
          id: generateId('tpl_heading'),
          type: 'heading',
          level: 1,
          text: `Itinéraire raisonné : traverser ${dest} à votre rythme`,
          subtitle: 'Une trame équilibrée entre patrimoine préservé et chemins de traverse.',
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_text'),
          type: 'text',
          content: `<p>Cet itinéraire a été conçu pour éviter la fatigue des sauts de puce quotidiens. Chaque arrêt permet de poser ses valises pour au moins deux nuits et d'explorer les environs sans précipitation.</p>`,
          spacing: 'normal',
        },
        {
          id: generateId('tpl_h2_1'),
          type: 'heading',
          level: 2,
          text: 'Étape 1 : Le point d\'ancrage historique',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_vault'),
          type: 'vault_spot',
          title: 'Haut plateau préservé & mémoire locale',
          location: `${dest} — sentier des crêtes`,
          livedExperience: 'Une halte hors du flux où les bergers perpétuent la fabrication traditionnelle du fromage d\'alpage.',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_h2_2'),
          type: 'heading',
          level: 2,
          text: 'Étape 2 : Les rives et la vallée calme',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_list'),
          type: 'list',
          style: 'numbered',
          items: [
            'Matinée consacrée à l\'architecture vernaculaire et aux placettes ombragées.',
            'Pause méridienne auprès d\'une auberge de producteurs indépendants.',
            'Balade crépusculaire le long du sentier côtier ou de la rivière.',
          ],
          spacing: 'normal',
        },
        {
          id: generateId('tpl_btn'),
          type: 'button',
          label: 'Planifier un accompagnement sur-mesure',
          url: '/travel-planning',
          variant: 'primary_gold',
          spacing: 'relaxed',
        },
      ];
    },
  },

  hospitality_spotlight: {
    id: 'hospitality_spotlight',
    title: 'Hôtel de charme & Hospitalité sincère',
    description: 'Mise en valeur d\'une maison d\'hôtes ou d\'un établissement indépendant alliant authenticité et art de vivre.',
    category: 'hospitality',
    estimatedReadingMinutes: 4,
    tags: ['hôtellerie', 'indépendant', 'hospitalité', 'b2b-b2c'],
    generateBlocks: (opts) => {
      const dest = opts?.destination || 'notre sélection';
      return [
        {
          id: generateId('tpl_heading'),
          type: 'heading',
          level: 1,
          text: `Maison d\'hôtes & caractère à ${dest}`,
          subtitle: 'Un lieu habité par la passion de ses propriétaires et le respect des matières nobles.',
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_text'),
          type: 'text',
          content: `<p>Ce qui distingue une véritable maison de repos d'un hébergement standard, c'est l'attention délicate portée aux détails : le linge séché au grand air, le petit-déjeuner composé de vergers voisins et la discrétion bienveillante de l'accueil.</p>`,
          spacing: 'normal',
        },
        {
          id: generateId('tpl_gallery'),
          type: 'gallery',
          displayMode: 'carousel',
          images: [
            {
              url: 'https://heldonica.fr/images/destinations/madere/fanal-arbres-centenaires.jpg',
              alt: 'Atmosphère feutrée de la cour intérieure',
              caption: 'La cour intérieure ombragée aux premières heures.',
            },
            {
              url: 'https://heldonica.fr/images/destinations/montenegro/sahat_kula.jpg',
              alt: 'Chambre aux matières brutes et naturelles',
              caption: 'Pierres apparentes et bois patiné.',
            },
          ],
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_h2'),
          type: 'heading',
          level: 2,
          text: 'L\'expérience vécue lors de notre passage',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_text2'),
          type: 'text',
          content: `<p>Se réveiller au chant des oiseaux sans aucun bruit de moteur alentour. Nous y avons séjourné pour vérifier la tenue des engagements environnementaux et la sincérité de l'accueil hôtelier.</p>`,
          spacing: 'normal',
        },
        {
          id: generateId('tpl_btn'),
          type: 'button',
          label: 'Découvrir nos accompagnements hôteliers',
          url: '/expert-hotelier',
          variant: 'outline',
          spacing: 'relaxed',
        },
      ];
    },
  },

  photo_essay: {
    id: 'photo_essay',
    title: 'Essai visuel & Poésie du territoire',
    description: 'Une narration épurée articulée autour de photos de terrain certifiées et de fragments poétiques.',
    category: 'visual',
    estimatedReadingMinutes: 3,
    tags: ['photos', 'ambiance', 'lumière', 'regard'],
    generateBlocks: (opts) => {
      const dest = opts?.destination || 'ces horizons';
      return [
        {
          id: generateId('tpl_heading'),
          type: 'heading',
          level: 1,
          text: `Fragments de lumière : regards sur ${dest}`,
          subtitle: 'Quand l\'image se fait le témoin d\'un instant suspendu.',
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_photo1'),
          type: 'photo_evidence',
          imageUrl: 'https://heldonica.fr/images/destinations/suisse/stoos_sommet_croix.jpg',
          location: `${dest} — crête panoramique`,
          date: '2025-07-14',
          anecdote: 'L\'instant précis où la brume s\'efface pour laisser apparaître le relief.',
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_text'),
          type: 'text',
          content: `<p>Il y a des paysages qui ne se laissent appréhender que par le silence. L'œil apprend à délaisser la vue d'ensemble pour s'attarder sur la texture du roc, le frémissement de l'eau ou la couleur dorée d'un sous-bois automnal.</p>`,
          spacing: 'normal',
        },
        {
          id: generateId('tpl_photo2'),
          type: 'photo_evidence',
          imageUrl: 'https://heldonica.fr/images/destinations/madere/achadas-da-cruz-telepherique.jpg',
          location: `${dest} — sentier escarpé`,
          date: '2024-10-12',
          anecdote: 'Entre ciel et océan, le sentier vertigineux vers les parcelles cultivées.',
          spacing: 'relaxed',
        },
      ];
    },
  },
};

/**
 * Retourne la liste de tous les gabarits disponibles.
 */
export function getCmsTemplates(): CmsTemplate[] {
  return Object.values(CMS_TEMPLATES);
}

/**
 * Instancie les blocs d'un gabarit avec des identifiants uniques garantis.
 */
export function instantiateCmsTemplate(
  templateId: CmsTemplateId,
  options?: { destination?: string }
): CmsBlock[] {
  const template = CMS_TEMPLATES[templateId];
  if (!template) {
    throw new Error(`Gabarit introuvable : ${templateId}`);
  }
  return template.generateBlocks(options);
}

/**
 * Contrôle qualité éditorial et technique : vérifie que les blocs d'un template
 * ne contiennent aucun mot banni et disposent de structures valides.
 */
export function validateTemplateBlocks(blocks: CmsBlock[]): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!Array.isArray(blocks) || blocks.length === 0) {
    issues.push('Le gabarit ne contient aucun bloc.');
    return { valid: false, issues };
  }

  const seenIds = new Set<string>();

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (!block.id) {
      issues.push(`Le bloc à l'index ${i} n'a pas d'identifiant unique.`);
    } else if (seenIds.has(block.id)) {
      issues.push(`Identifiant de bloc en doublon : ${block.id}`);
    } else {
      seenIds.add(block.id);
    }

    // Analyse textuelle contre les mots bannis (AGENTS.md)
    let fullText = '';
    if (block.type === 'heading') fullText += ` ${block.text} ${block.subtitle || ''}`;
    if (block.type === 'text') fullText += ` ${block.content}`;
    if (block.type === 'button') fullText += ` ${block.label}`;
    if (block.type === 'list') fullText += ` ${block.items.join(' ')}`;
    if (block.type === 'vault_spot') fullText += ` ${block.title} ${block.livedExperience}`;
    if (block.type === 'photo_evidence') fullText += ` ${block.anecdote} ${block.location}`;

    const lower = fullText.toLowerCase();
    for (const forbidden of FORBIDDEN_WORDS) {
      if (lower.includes(forbidden.toLowerCase())) {
        issues.push(`Mot interdit "${forbidden}" détecté dans le bloc ${block.id} (${block.type})`);
      }
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
