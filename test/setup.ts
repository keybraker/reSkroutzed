// Setup global mocks and environment for tests
import { vi } from 'vitest';
import * as crypto from 'crypto';

// Polyfill crypto for Node environments that don't have it globally (like Node 18)
if (typeof globalThis.crypto === 'undefined') {
  // @ts-ignore - assigning to read-only but works in Node
  globalThis.crypto = crypto.webcrypto;
}

// Set up document body
document.body.innerHTML = '';

// Mock Chrome API
global.chrome = {
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Mock window properties that might not be available in jsdom
if (!window.location.hostname) {
  Object.defineProperty(window, 'location', {
    value: {
      hostname: 'www.skroutz.gr',
    },
    writable: true,
  });
}

if (!window.innerWidth) {
  Object.defineProperty(window, 'innerWidth', {
    value: 1024,
    writable: true,
  });
}

// Make sure document.documentElement.lang is defined
document.documentElement.lang = 'el';
