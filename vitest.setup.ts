import '@testing-library/jest-dom';
import { vi } from 'vitest';

/**
 * Vitest setup file
 * This file is run before each test file and sets up the testing environment
 */

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
    isFallback: false,
    locale: 'fr',
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
  }),
}));