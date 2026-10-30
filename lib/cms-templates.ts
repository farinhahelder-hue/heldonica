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
  | 'photo_essay'
  | 'verdict_counter_tourism'
  | 'dispatch_field_notes'
  | 'sensory_micro_escape'
  | 'terroir_artisan_table'
  | 'train_escape_zero_carbon';

export type TemplateAtmosphere =
  | 'aube_brume'
  | 'soleil_crepuscule'
  | 'altitude_mineral'
  | 'fajas_ocean'
  | 'foret_silence';

export type TemplateSeason =
  | 'printemps'
  | 'ete'
  | 'automne'
  | 'hiver';

export type TemplateCameraPreset =
  | 'nikon_35mm'
  | 'nikon_zoom'
  | 'pixel_raw';

export interface CmsTemplateOptions {
  destination?: string;
  atmosphere?: TemplateAtmosphere;
  season?: TemplateSeason;
  cameraPreset?: TemplateCameraPreset;
  mobility?: string;
}

export const ATMOSPHERE_PRESETS: Record<TemplateAtmosphere, {
  label: string;
  subtitleSuffix: string;
  sensorySnippet: string;
  blockTheme: 'forest_fog' | 'terracotta' | 'parchment' | 'dark' | 'sand';
}> = {
  aube_brume: {
    label: 'Brume d’aube & Silence',
    subtitleSuffix: 'au fil de la brume suspendue au petit matin',
    sensorySnippet: 'L’air vif du matin pique délicatement le visage. La rosée perle sur les pierres et le sentier appartient à ceux qui partent tôt.',
    blockTheme: 'forest_fog',
  },
  soleil_crepuscule: {
    label: 'Crépuscule & Pierre chaude',
    subtitleSuffix: 'quand la roche ocre restitue la tiédeur du jour écoulé',
    sensorySnippet: 'Les senteurs de pinède et d’herbes sèches montent avec la fraîcheur tombante. Le soleil rasant découpe des ombres nettes sur les murs patinés.',
    blockTheme: 'terracotta',
  },
  altitude_mineral: {
    label: 'Crête & Silence minéral',
    subtitleSuffix: 'sur la ligne de crête où le calcaire côtoie le ciel',
    sensorySnippet: 'Le silence n’est troublé que par le vent d’altitude et l’écho assourdi d’une clarine. Le pas se fait attentif sur le roc brut.',
    blockTheme: 'parchment',
  },
  fajas_ocean: {
    label: 'Falaises & Océan sauvage',
    subtitleSuffix: 'entre parois basaltiques et ressac puissant de l’Atlantique',
    sensorySnippet: 'L’embrun salé se dépose sur la peau. En contrebas des falaises verticales, quelques parcelles cultivées témoignent de l’obstination des anciens.',
    blockTheme: 'dark',
  },
  foret_silence: {
    label: 'Forêt ancienne & Sous-bois',
    subtitleSuffix: 'sous la voûte des mousses et des lauriers centenaires',
    sensorySnippet: 'Chaque pas s’enfonce dans un tapis d’aiguilles et d’humus. La lumière filtre timidement, créant des clairières suspendues hors du temps.',
    blockTheme: 'forest_fog',
  },
};

export const SEASON_PRESETS: Record<TemplateSeason, {
  label: string;
  seasonSnippet: string;
  seasonKicker: string;
}> = {
  printemps: {
    label: "Printemps — Réveil floral & Brumes d'avril",
    seasonSnippet: "Les sentiers s’éveillent, les sous-bois reverdissent et les ruisseaux dévalent avec force sous la fonte des neiges.",
    seasonKicker: "Printemps sauvage",
  },
  ete: {
    label: "Été — Lumière rase & Matins d'altitude",
    seasonSnippet: "On se lève aux premières lueurs pour devancer la tiédeur de midi et goûter la fraîcheur des crêtes aériennes.",
    seasonKicker: "Été d’altitude",
  },
  automne: {
    label: "Automne — Cuivre, mousses & Mélèzes dorés",
    seasonSnippet: "Les forêts flamboient, les mélèzes s’embrasent d’or et les brumes du soir s’attardent au creux des vallons.",
    seasonKicker: "Automne flamboyant",
  },
  hiver: {
    label: "Hiver — Clarté minérale & Pas feutrés",
    seasonSnippet: "L’air vif cristallise sur le visage. Le givre habille les roches et le silence règne en maître absolu.",
    seasonKicker: "Hiver feutré",
  },
};

export const CAMERA_PRESETS: Record<TemplateCameraPreset, string> = {
  nikon_35mm: 'Nikon D7200 • Nikkor 35mm f/1.8 DX',
  nikon_zoom: 'Nikon D7200 • Nikkor 18-105mm f/3.5-5.6 VR',
  pixel_raw: 'Pixel 8 Pro RAW',
};

export interface CmsTemplate {
  id: CmsTemplateId;
  title: string;
  description: string;
  category: 'diary' | 'guide' | 'hospitality' | 'visual';
  estimatedReadingMinutes: number;
  tags: string[];
  generateBlocks: (options?: CmsTemplateOptions) => CmsBlock[];
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
      const atmo = opts?.atmosphere ? ATMOSPHERE_PRESETS[opts.atmosphere] : undefined;
      const camera = opts?.cameraPreset ? CAMERA_PRESETS[opts.cameraPreset] : undefined;
      const theme = atmo?.blockTheme || 'sand';
      return [
        {
          id: generateId('tpl_heading'),
          type: 'heading',
          level: 1,
          text: `Prendre le temps à ${dest} : carnet d'immersion`,
          subtitle: atmo ? `Loin du tumulte, une traversée attentive ${atmo.subtitleSuffix}.` : 'Loin du tumulte, une traversée attentive guidée par la lumière de l\'aube.',
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_text'),
          type: 'text',
          content: `<p>Arriver sans hâte change la texture du voyage. Plutôt que d'accumuler les kilomètres, on a choisi de s'arrêter là où le quotidien des habitants reprend ses droits dès les premières heures de la matinée.</p>`,
          spacing: 'normal',
        },
        {
          id: generateId('tpl_photo'),
          type: 'photo_evidence',
          imageUrl: 'https://www.heldonica.fr/images/destinations/montenegro/petrovac_mer.jpg',
          location: `${dest} — premier matin`,
          date: '2026-05-18',
          anecdote: atmo ? atmo.sensorySnippet : 'Le silence matinal le long de la berge avant l\'éveil de la ville.',
          cameraInfo: camera,
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
          label: 'Parcourir le carnet de route complet',
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
          text: `Itinéraire raisonné : traverser ${dest} à ton rythme`,
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
      const dest = opts?.destination || 'la sélection du carnet';
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
              url: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/roumanie/IMG_20260827_135023.jpg',
              alt: 'Atmosphère feutrée de la cour intérieure',
              caption: 'La cour intérieure ombragée aux premières heures.',
            },
            {
              url: 'https://www.heldonica.fr/images/destinations/montenegro/petrovac_mer.jpg',
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
          text: 'L\'expérience vécue lors du passage',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_text2'),
          type: 'text',
          content: `<p>Se réveiller au chant des oiseaux sans aucun bruit de moteur alentour. On y a séjourné pour vérifier la tenue des engagements environnementaux et la sincérité de l'accueil hôtelier.</p>`,
          spacing: 'normal',
        },
        {
          id: generateId('tpl_btn'),
          type: 'button',
          label: 'Découvrir l’accompagnement hôtelier Heldonica',
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
      const atmo = opts?.atmosphere ? ATMOSPHERE_PRESETS[opts.atmosphere] : undefined;
      const camera = opts?.cameraPreset ? CAMERA_PRESETS[opts.cameraPreset] : undefined;
      const theme = atmo?.blockTheme || 'parchment';
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
          imageUrl: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/blog-images/stoos-01.jpg',
          location: `${dest} — crête panoramique`,
          date: '2025-07-14',
          anecdote: atmo ? atmo.sensorySnippet : 'L\'instant précis où la brume s\'efface pour laisser apparaître le relief.',
          cameraInfo: camera,
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
          imageUrl: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/achadas_da_cruz.jpg',
          location: `${dest} — sentier escarpé`,
          date: '2024-10-12',
          anecdote: 'Entre ciel et océan, le sentier vertigineux vers les parcelles cultivées.',
          cameraInfo: camera,
          spacing: 'relaxed',
        },
      ];
    },
  },
  verdict_counter_tourism: {
    id: 'verdict_counter_tourism',
    title: 'Bilan sans complaisance & Anti-surtourisme',
    description: 'Analyse critique du duo : note de terrain /10, piège commercial à éviter et alternative secrète préservée.',
    category: 'diary',
    estimatedReadingMinutes: 6,
    tags: ['verdict', 'anti-surtourisme', 'vérité', 'alternative'],
    generateBlocks: (opts) => {
      const dest = opts?.destination || 'cette étape';
      const atmo = opts?.atmosphere ? ATMOSPHERE_PRESETS[opts.atmosphere] : undefined;
      const camera = opts?.cameraPreset ? CAMERA_PRESETS[opts.cameraPreset] : undefined;
      const theme = atmo?.blockTheme || 'sand';
      return [
        {
          id: generateId('tpl_heading'),
          type: 'heading',
          level: 1,
          text: `Bilan sans complaisance à ${dest} : ce qui vaut le voyage`,
          subtitle: 'Dans le vacarme promotionnel ambiant, un retour d’expérience direct sans aucun partenariat rémunéré.',
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_text'),
          type: 'text',
          content: '<p>Voyager à contre-courant exige de regarder les réalités en face. Certains lieux vantés par les brochures ont perdu leur âme sous la pression des autocars ; d’autres, protégés par l’exigence de la marche, conservent une pureté intacte.</p>',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_vault'),
          type: 'vault_spot',
          title: 'Halte préservée : le sentier des bergers',
          location: `${dest} — versant sauvage`,
          livedExperience: 'À trois kilomètres du parking payant, on a retrouvé le silence minéral et la mémoire des transhumances.',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_photo'),
          type: 'photo_evidence',
          imageUrl: 'https://www.heldonica.fr/images/destinations/montenegro/petrovac_mer.jpg',
          location: `${dest} — au lever du jour`,
          date: '2026-05-18',
          anecdote: 'Le village avant le premier bus : preuve que la tranquillité appartient à ceux qui se lèvent tôt.',
          cameraInfo: camera,
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_h2'),
          type: 'heading',
          level: 2,
          text: 'Les trois repères clés du duo',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_list'),
          type: 'list',
          style: 'checklist',
          items: [
            'Fuir les boutiques de souvenirs standardisées de la rue principale.',
            'S’attabler chez les aubergistes qui cuisinent les légumes de leur propre potager.',
            'Demander le chemin de traverse aux anciens du village plutôt que de suivre les flèches balisées.',
          ],
          spacing: 'normal',
        },
        {
          id: generateId('tpl_btn'),
          type: 'button',
          label: 'Lire le manifeste Slow Travel',
          url: '/a-propos',
          variant: 'primary_gold',
          spacing: 'relaxed',
        },
      ];
    },
  },

  dispatch_field_notes: {
    id: 'dispatch_field_notes',
    title: 'Chronique de marche & Journal d’expédition',
    description: 'Récit brut de terrain : météo, relevé altimétrique, matières naturelles et carnet manuscrit.',
    category: 'visual',
    estimatedReadingMinutes: 4,
    tags: ['carnet', 'randonnée', 'météo', 'nature'],
    generateBlocks: (opts) => {
      const dest = opts?.destination || 'les crêtes';
      const atmo = opts?.atmosphere ? ATMOSPHERE_PRESETS[opts.atmosphere] : undefined;
      const camera = opts?.cameraPreset ? CAMERA_PRESETS[opts.cameraPreset] : undefined;
      const theme = atmo?.blockTheme || 'forest_fog';
      return [
        {
          id: generateId('tpl_heading'),
          type: 'heading',
          level: 1,
          text: `Journal de marche : traverser ${dest}`,
          subtitle: 'Relevé de terrain à 1 200 mètres d’altitude, entre roche nue et forêt silencieuse.',
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_text'),
          type: 'text',
          content: '<p>Départ 06h40. La température affiche 9 degrés sous un ciel d’ardoise. La vapeur du souffle accompagne chaque foulée sur le sol encore mouillé par la bruine nocturne.</p>',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_image'),
          type: 'image',
          url: 'https://smxnruefmrmfyfhuxygq.supabase.co/storage/v1/object/public/media/destinations/madere/achadas_da_cruz.jpg',
          alt: 'Ligne de crête découpée dans la brume matinale',
          caption: 'La sente à pic plongeant vers l’océan à perte de vue.',
          layout: 'wide',
          aspectRatio: '16:9',
          hotspot: { x: 0.5, y: 0.25 },
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_h2'),
          type: 'heading',
          level: 2,
          text: 'Sensations et matières du sentier',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_text2'),
          type: 'text',
          content: '<p>L’odeur forte du pin résineux se mêle à l’humus frais. En ralentissant la cadence, on perçoit le bruissement discret d’une source cachée sous les fougères.</p>',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_btn'),
          type: 'button',
          label: 'Parcourir les autres étapes de randonnée',
          url: '/destinations',
          variant: 'outline',
          spacing: 'relaxed',
        },
      ];
    },
  },

  sensory_micro_escape: {
    id: 'sensory_micro_escape',
    title: 'Micro-échappée 48h déconnectée (Sans voiture)',
    description: 'Format week-end en mobilités douces : train, auberge de caractère, marche au grand air et déconnexion.',
    category: 'guide',
    estimatedReadingMinutes: 5,
    tags: ['week-end', 'train', 'mobilités douces', 'déconnexion'],
    generateBlocks: (opts) => {
      const dest = opts?.destination || 'cette vallée';
      const atmo = opts?.atmosphere ? ATMOSPHERE_PRESETS[opts.atmosphere] : undefined;
      const camera = opts?.cameraPreset ? CAMERA_PRESETS[opts.cameraPreset] : undefined;
      const theme = atmo?.blockTheme || 'parchment';
      return [
        {
          id: generateId('tpl_heading'),
          type: 'heading',
          level: 1,
          text: `48 heures déconnectées à ${dest} (En train et à pied)`,
          subtitle: 'Partir léger un vendredi soir, savourer le temps long, rentrer transformé.',
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_text'),
          type: 'text',
          content: '<p>À moins de deux heures de rail, le paysage se transforme. On a laissé la voiture derrière pour redécouvrir le plaisir simple d’arriver par le train et de tout faire à pied.</p>',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_h2_1'),
          type: 'heading',
          level: 2,
          text: 'Le fil conducteur des deux journées',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_list'),
          type: 'list',
          style: 'numbered',
          items: [
            'Vendredi soir : Trajet en train régional, installation à la maison d’hôtes et dîner de saison.',
            'Samedi : Traversée du sentier de crête avec pique-nique de producteurs locaux.',
            'Dimanche : Matinée de repos, lecture sous les tilleuls et retour en train au crépuscule.',
          ],
          spacing: 'normal',
        },
        {
          id: generateId('tpl_vault'),
          type: 'vault_spot',
          title: 'Refuge éthique & hospitalité sans artifice',
          location: `${dest} — fin de piste`,
          livedExperience: 'Chambres aux murs de chaux, cuisine paysanne au feu de bois et accueil familial profondément sincère.',
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_btn'),
          type: 'button',
          label: 'Demander un carnet de voyage sur-mesure',
          url: '/travel-planning',
          variant: 'primary_gold',
          spacing: 'relaxed',
        },
      ];
    },
  },

  terroir_artisan_table: {
    id: 'terroir_artisan_table',
    title: 'Halte de Terroir & Table d’Artisan',
    description: 'Tasca de pêcheurs, fromagerie d’alpage ou vignoble en terrasses : immersion culinaire brute sans intermédiaire commercial.',
    category: 'diary',
    estimatedReadingMinutes: 5,
    tags: ['terroir', 'cuisine de saison', 'artisans', 'adresses vécues'],
    generateBlocks: (opts) => {
      const dest = opts?.destination || 'cette étape';
      const atmo = opts?.atmosphere ? ATMOSPHERE_PRESETS[opts.atmosphere] : undefined;
      const camera = opts?.cameraPreset ? CAMERA_PRESETS[opts.cameraPreset] : undefined;
      const theme = atmo?.blockTheme || 'terracotta';
      return [
        {
          id: generateId('tpl_heading'),
          type: 'heading',
          level: 1,
          text: `Table d’artisan à ${dest} : ce que le terroir a de plus vrai`,
          subtitle: atmo ? `Des assiettes dictées par la pêche ou la récolte du jour, ${atmo.subtitleSuffix}.` : 'Des assiettes dictées par la pêche du matin ou la récolte du jour.',
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_text'),
          type: 'text',
          content: '<p>On s’attable là où il n’y a pas de menu imprimé sous plastique. Les propriétaires cuisinent ce que la terre ou la marée leur donne, sans chercher à flatter les habitudes des foules de passage.</p>',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_vault'),
          type: 'vault_spot',
          title: 'Tasca de village & cuisine de mémoire',
          location: `${dest} — quartier des pêcheurs`,
          livedExperience: 'Poissons grillés à la braise de sarments de vigne, huile d’olive de première pression et accueil spontané.',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_photo'),
          type: 'photo_evidence',
          imageUrl: 'https://www.heldonica.fr/images/destinations/montenegro/petrovac_mer.jpg',
          location: `${dest} — au marché du matin`,
          date: '2026-05-18',
          anecdote: 'Le patron choisit lui-même ses légumes à l’aube : le secret d’une cuisine authentique.',
          cameraInfo: camera,
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_h2'),
          type: 'heading',
          level: 2,
          text: 'Les repères du goût de saison',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_list'),
          type: 'list',
          style: 'checklist',
          items: [
            'Commander le poisson ou le plat du jour noté sur l’ardoise à la craie.',
            'Demander d’où provient le vin de table (souvent tiré du tonneau voisin).',
            'Prendre le temps d’échanger avec les artisans au moment du café.',
          ],
          spacing: 'normal',
        },
        {
          id: generateId('tpl_btn'),
          type: 'button',
          label: 'Explorer les autres adresses de terroir vérifiées',
          url: '/destinations',
          variant: 'primary_gold',
          spacing: 'relaxed',
        },
      ];
    },
  },

  train_escape_zero_carbon: {
    id: 'train_escape_zero_carbon',
    title: 'Échappée Sans Voiture & De Gare en Gare',
    description: 'Itinéraire 100% ferroviaire et pédestre : départ sur le quai, traversée de crêtes et bilan carbone minime.',
    category: 'guide',
    estimatedReadingMinutes: 6,
    tags: ['train', 'mobilités douces', 'bas carbone', 'randonnée'],
    generateBlocks: (opts) => {
      const dest = opts?.destination || 'cette vallée';
      const atmo = opts?.atmosphere ? ATMOSPHERE_PRESETS[opts.atmosphere] : undefined;
      const camera = opts?.cameraPreset ? CAMERA_PRESETS[opts.cameraPreset] : undefined;
      const theme = atmo?.blockTheme || 'forest_fog';
      return [
        {
          id: generateId('tpl_heading'),
          type: 'heading',
          level: 1,
          text: `De gare en gare : traverser ${dest} sans voiture`,
          subtitle: 'Laisser la clé de contact derrière soi pour redécouvrir le temps du rail et le rythme du pas.',
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_text'),
          type: 'text',
          content: '<p>Descendre du train régional, lacer ses chaussures de marche et s’engager sur le sentier directement depuis le bout du quai. Voyager sans voiture libère l’esprit de toute contrainte de circulation ou de parking.</p>',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_list'),
          type: 'list',
          style: 'numbered',
          items: [
            '08h15 : Arrivée en gare avec sacs à dos légers.',
            '09h00 : Montée par le vieux chemin pavé vers le col.',
            '13h30 : Halte contemplative au refuge avec panorama dégagé.',
            '17h45 : Descente vers la seconde gare et train du retour.',
          ],
          spacing: 'normal',
        },
        {
          id: generateId('tpl_vault'),
          type: 'vault_spot',
          title: 'Viaduc historique & belvédère sans foule',
          location: `${dest} — bifurcation du sentier haut`,
          livedExperience: 'Vue plongeante sur la combe silencieuse, accessible uniquement par deux heures de marche soutenue.',
          spacing: 'normal',
        },
        {
          id: generateId('tpl_photo'),
          type: 'photo_evidence',
          imageUrl: 'https://www.heldonica.fr/images/destinations/montenegro/petrovac_mer.jpg',
          location: `${dest} — en fin d’après-midi`,
          date: '2026-05-18',
          anecdote: 'Lumière rasante sur les rails au moment où le train s’arrête dans le calme du crépuscule.',
          cameraInfo: camera,
          spacing: 'relaxed',
        },
        {
          id: generateId('tpl_btn'),
          type: 'button',
          label: 'Parcourir nos échappées en train',
          url: '/destinations',
          variant: 'primary_gold',
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
  options?: CmsTemplateOptions
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
