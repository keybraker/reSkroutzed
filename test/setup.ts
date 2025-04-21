// Setup global mocks and environment for tests
import { vi } from 'vitest';

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
} as any;

// Mock localStorage
global.localStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
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
