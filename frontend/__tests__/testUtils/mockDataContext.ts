import { vi } from 'vitest';

import type { DataContextType } from '../../src/internal/dataContextType';

const createMockDataContext = (
  overrides: Partial<DataContextType>,
): DataContextType => ({
  albumAggregates: [],
  albumTags: {},
  albumTagsLoaded: false,
  setTags: vi.fn(),
  tags: [],
  ...overrides,
});

export { createMockDataContext };
