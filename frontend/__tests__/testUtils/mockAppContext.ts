import { vi } from 'vitest';

import type { AppContextType } from '../../src/internal/appContextType';

const createMockAppContext = (
  overrides: Partial<AppContextType>,
): AppContextType => ({
  albumAggregates: [],
  config: { selectedZoneId: null },
  coreUrl: null,
  domSelectedZoneId: null,
  isAlbumArtModalOpen: false,
  queues: {},
  setConfig: vi.fn(),
  setDomSelectedZoneId: vi.fn(),
  setIsAlbumArtModalOpen: vi.fn(),
  setQueues: vi.fn(),
  setTags: vi.fn(),
  tags: [],
  zones: {},
  ...overrides,
});

export { createMockAppContext };
