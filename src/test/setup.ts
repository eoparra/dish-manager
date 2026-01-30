import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock crypto.randomUUID for consistent test IDs
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-1234',
});
