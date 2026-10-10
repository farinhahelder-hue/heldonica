/**
 * lib/cms-draft-from-evidence.ts
 *
 * Générateur de Brouillons Automatiques Ancrés dans les Preuves & Albums Réels.
 *
 * RÈGLE D'OR AGENTS.md : "On n'invente rien. On raconte ce qu'on a vécu."
 * Assemble des brouillons complets au format de blocs Heldonica CMS (CmsBlock[]),
 * prêts pour l'éditeur visuel (BlockCanvas) et pré-câblés pour l'Interview Éclair.
 */

import {
  VERIFIED_PHOTO_ALBUMS,
  getVerifiedAlbumById,
  type PhotoEvidenceAlbum,
  type PhotoEvidenceItem,
} from '@/lib/cms-photo-albums';
import type {
  CmsBlock,
  HeadingBlock,
  TextBlock,
  PhotoEvidenceBlock,
  VaultSpotBlock,
  ListBlock,
} from '@/types/cms-blocks';
import { blocksToHtml } from '@/lib/cms-blocks-converter';
import { generateFaqVerdictBundle } from '@/lib/cms-faq-verdict-generator';

export interface EvidenceDraftOptions {
  albumId?: string;
  destination?: string;
  title?: string;
  authorNote?: string;
}

export interface GeneratedEvidenceDraft {
  slug: string;
  title: string;
  destination: string;
  albumId?: string;
  blocks: CmsBlock[];
  htmlContent: string;
  totalPhotos: number;
  metadata: {
    createdAt: string;
    photosCount: number;
    period?: string;
    albumLink?: string;
  };
}

/**
 * Génère la structure de blocs Heldonica CMS pour un album de preuves réelles.
 */
export function generateBlocksFromAlbum(album: PhotoEvidenceAlbum, customTitle?: string): CmsBlock[] {
  const blocks: CmsBlock[] = [];
  const now = Date.now().toString(36);
  let blockIndex = 1;

  const nextId = (prefix: string) => `blk_${prefix}_${now}_${blockIndex++}`;

  // 1. Titre H1
  const titleText = customTitle || album.title;
  const h1Block: HeadingBlock = {
    id: nextId('h1'),
    type: 'heading',
    level: 1,
    text: titleText,
    subtitle: `Carnet de route slow travel — ${album.period}`,
  };
  blocks.push(h1Block);

  // 2. Chapeau introductif ancré dans le vécu
  const introBlock: TextBlock = {
    id: nextId('intro'),
    type: 'text',
    content: `<p>On a parcouru ce territoire en <strong>${album.period}</strong> en privilégiant le train, la marche et les temps lents. Voici le tracé visuel et les repères précis issus de nos carnets de terrain.</p>`,
  };
  blocks.push(introBlock);

  // 3. Blocs Preuves Photos géolocalisées
  album.photos.forEach((photo: PhotoEvidenceItem, idx: number) => {
    const photoBlock: PhotoEvidenceBlock = {
      id: nextId(`photo_${idx + 1}`),
      type: 'photo_evidence',
      imageUrl: photo.imageUrl,
      location: photo.location,
      date: photo.date,
      anecdote: photo.suggestedAnecdote || `Étape documentée à ${photo.location}.`,
      albumLink: photo.albumLink || album.albumLink,
    };
    blocks.push(photoBlock);
  });

  // 4. Section FAQ de terrain (Option C intégrée)
  const faqVerdict = generateFaqVerdictBundle({
    destination: album.destination,
    season: album.period,
    mobility: 'mobilités douces et marche',
  });

  const faqHeading: HeadingBlock = {
    id: nextId('faq_h2'),
    type: 'heading',
    level: 2,
    text: 'Repères pratiques & questions de terrain',
    subtitle: 'Ce qu’on a vérifié par nous-mêmes lors de notre passage',
  };
  blocks.push(faqHeading);

  const faqListBlock: ListBlock = {
    id: nextId('faq_list'),
    type: 'list',
    style: 'bullet',
    items: faqVerdict.faqs.map((f) => `**${f.question}** — ${f.answer}`),
  };
  blocks.push(faqListBlock);

  // 5. Section Verdict Heldonica
  const verdictHeading: HeadingBlock = {
    id: nextId('verdict_h2'),
    type: 'heading',
    level: 2,
    text: 'Notre verdict sans complaisance',
    subtitle: `Note de terrain : ${faqVerdict.verdict.verdictScore}/10`,
  };
  blocks.push(verdictHeading);

  const verdictBlock: VaultSpotBlock = {
    id: nextId('verdict_spot'),
    type: 'vault_spot',
    title: `Le bilan d’Heldonica sur ${album.destination}`,
    location: album.photos[0]?.location || album.destination,
    livedExperience: `Moment fort : ${faqVerdict.verdict.highlight} — Piège à éviter : ${faqVerdict.verdict.pitfall} — ${faqVerdict.verdict.recommendation}`,
  };
  blocks.push(verdictBlock);

  return blocks;
}

/**
 * Génère un brouillon d'article complet et prêt à injecter dans le CMS.
 */
export function generateEvidenceDraft(options: EvidenceDraftOptions): GeneratedEvidenceDraft {
  let album: PhotoEvidenceAlbum | undefined;

  if (options.albumId) {
    album = getVerifiedAlbumById(options.albumId);
  } else if (options.destination) {
    const destNorm = options.destination.toLowerCase().trim();
    album = VERIFIED_PHOTO_ALBUMS.find(
      (a) => a.destination.toLowerCase() === destNorm || a.id.toLowerCase().includes(destNorm)
    );
  }

  if (!album) {
    // Si aucun album direct, prendre le premier album vérifié disponible en fallback
    album = VERIFIED_PHOTO_ALBUMS[0];
  }

  const title = options.title || `Carnet de route : ${album.title}`;
  const slug = `carnet-${album.destination}-evidence-${new Date().toISOString().split('T')[0]}`;
  const blocks = generateBlocksFromAlbum(album, title);
  const htmlContent = blocksToHtml(blocks);

  return {
    slug,
    title,
    destination: album.destination,
    albumId: album.id,
    blocks,
    htmlContent,
    totalPhotos: album.photos.length,
    metadata: {
      createdAt: new Date().toISOString(),
      photosCount: album.photos.length,
      period: album.period,
      albumLink: album.albumLink,
    },
  };
}
