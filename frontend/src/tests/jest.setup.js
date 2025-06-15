// Setup global para Jest - Configuración de import.meta
Object.defineProperty(global, 'import', {
  value: {
    meta: {
      env: {
        DEV: false,
        PROD: true,
        MODE: 'test',
        VITE_API_URL: 'http://localhost:3000/api'
      }
    }
  }
});

// Mock de fetch global
global.fetch = jest.fn();

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock de IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; }
};

// Mock de ResizeObserver
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  observe() { return null; }
  disconnect() { return null; }
  unobserve() { return null; };
} 