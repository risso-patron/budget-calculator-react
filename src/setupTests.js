import * as matchers from '@testing-library/jest-dom/matchers'
// Extend the global expect with jest-dom matchers.
// Using import '@testing-library/jest-dom/vitest' fails in Vitest 4 because that
// entry imports expect from 'vitest' which creates a fresh module context — a
// different object than the globalThis.expect injected by the runner.
expect.extend(matchers)

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
global.localStorage = localStorageMock

// Mock de matchMedia para responsive tests
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}
