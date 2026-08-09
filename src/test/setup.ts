/**
 * RAVO OS — Test Setup
 * Configuração global para testes
 */

import { afterEach, vi, beforeAll } from 'vitest';

// Cleanup após cada teste
afterEach(() => {
  document.body.innerHTML = '';
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as any;

// Mock ResizeObserver (recharts ResponsiveContainer depende dele)
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
} as any;

// Silence console warnings em testes
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = vi.fn((...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Not implemented: HTMLFormElement.prototype.submit')) {
      return;
    }
    originalWarn.call(console, ...args);
  });
});
