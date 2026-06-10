import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isInstagramFeedConfigured } from '@/lib/instagram-feed';

describe('isInstagramFeedConfigured', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.BEHOLD_API_KEY;
    delete process.env.INSTAGRAM_USERNAME;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should return false if neither BEHOLD_API_KEY nor INSTAGRAM_USERNAME is set', () => {
    expect(isInstagramFeedConfigured()).toBe(false);
  });

  it('should return true if only BEHOLD_API_KEY is set', () => {
    process.env.BEHOLD_API_KEY = 'test_key';
    expect(isInstagramFeedConfigured()).toBe(true);
  });

  it('should return true if only INSTAGRAM_USERNAME is set', () => {
    process.env.INSTAGRAM_USERNAME = 'test_user';
    expect(isInstagramFeedConfigured()).toBe(true);
  });

  it('should return true if both BEHOLD_API_KEY and INSTAGRAM_USERNAME are set', () => {
    process.env.BEHOLD_API_KEY = 'test_key';
    process.env.INSTAGRAM_USERNAME = 'test_user';
    expect(isInstagramFeedConfigured()).toBe(true);
  });

  it('should return false if keys are set but empty', () => {
    process.env.BEHOLD_API_KEY = '';
    process.env.INSTAGRAM_USERNAME = '';
    expect(isInstagramFeedConfigured()).toBe(false);
  });
});
