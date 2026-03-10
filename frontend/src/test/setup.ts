/**
 * ============================================================================
 * VITEST SETUP FILE
 * ============================================================================
 * Configuration for React Testing Library with Vitest
 */

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock matchMedia for responsive components
global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    };
  };

// Mock IntersectionObserver for scroll animations
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
};

// Clean up after each test
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
