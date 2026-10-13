import { vi } from 'vitest';

import type { DataContextType } from '../../src/internal/dataContextType';

const createMockDataContext = (
  overrides: Partial<DataContextType>,
): DataContextType => ({
  albumAggregates: [],
  setTags: vi.fn(),
  tags: [],
  ...overrides,
});

export { createMockDataContext };
