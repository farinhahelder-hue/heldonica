import { getAllVaultSpots, type VaultSpotRecord } from './cms-vault-spots';
import type { CmsBlock, VaultSpotBlock } from '@/types/cms-blocks';

/**
 * Suggests VaultSpots based on the given text content.
 * It searches for VaultSpots whose titles or locations or keywords are mentioned in the text.
 * It ignores spots that are already present in the existing blocks to avoid duplicates.
 */
export function suggestVaultSpotsForContent(
  text: string,
  existingBlocks: CmsBlock[] = []
): VaultSpotRecord[] {
  if (!text || text.trim() === '') return [];

  const allSpots = getAllVaultSpots();
  const existingSpotIds = new Set<string>();
  
  for (const block of existingBlocks) {
    if (block.type === 'vault_spot' && (block as VaultSpotBlock).spotId) {
      existingSpotIds.add((block as VaultSpotBlock).spotId!);
    }
  }

  const suggestedSpots: VaultSpotRecord[] = [];
  const textLower = text.toLowerCase();

  for (const spot of allSpots) {
    if (existingSpotIds.has(spot.id)) continue;

    // Check if the spot's location or keywords (tags) are present in the text
    const locationLower = spot.location.toLowerCase();
    const titleLower = spot.title.toLowerCase();
    
    // Using simple includes for now, but considering boundaries might be better
    let isMatch = false;
    
    if (locationLower && locationLower !== 'global heldonica') {
      const regex = new RegExp(`(?:^|\\P{L})${locationLower}(?:\\P{L}|$)`, 'iu');
      if (regex.test(textLower)) {
        isMatch = true;
      }
    }
    
    if (!isMatch && titleLower && textLower.includes(titleLower)) {
       isMatch = true;
    }
    
    if (!isMatch && spot.tags && spot.tags.length > 0) {
      for (const tag of spot.tags) {
        const tagLower = tag.toLowerCase();
        const regex = new RegExp(`(?:^|\\P{L})${tagLower}(?:\\P{L}|$)`, 'iu');
        if (regex.test(textLower)) {
          isMatch = true;
          break;
        }
      }
    }

    if (isMatch) {
      suggestedSpots.push(spot);
    }
  }

  return suggestedSpots;
}
