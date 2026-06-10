import { describe, it, expect } from 'vitest';
import { generateRobotsMeta } from '../../lib/seo';

describe('seo generateRobotsMeta', () => {
  it('should generate correct meta for index and follow', () => {
    expect(generateRobotsMeta(true, true)).toBe('index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  });

  it('should generate correct meta for noindex and nofollow', () => {
    expect(generateRobotsMeta(false, false)).toBe('noindex, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  });

  it('should generate correct meta for index and nofollow', () => {
    expect(generateRobotsMeta(true, false)).toBe('index, nofollow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  });

  it('should generate correct meta for noindex and follow', () => {
    expect(generateRobotsMeta(false, true)).toBe('noindex, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');
  });
});
