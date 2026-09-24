import { describe, it, expect } from 'vitest';
import { generateRobotsMeta } from '../../lib/seo';

describe('seo utilities', () => {
  describe('generateRobotsMeta', () => {
    it('should generate correctly when both indexSite and followLinks are true', () => {
      const result = generateRobotsMeta(true, true);
      expect(result).toBe('index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    });

    it('should generate correctly when indexSite is true and followLinks is false', () => {
      const result = generateRobotsMeta(true, false);
      expect(result).toBe('index, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    });

    it('should generate correctly when indexSite is false and followLinks is true', () => {
      const result = generateRobotsMeta(false, true);
      expect(result).toBe('noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    });

    it('should generate correctly when both indexSite and followLinks are false', () => {
      const result = generateRobotsMeta(false, false);
      expect(result).toBe('noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
    });
  });
});
