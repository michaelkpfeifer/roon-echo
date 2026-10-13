import { vi } from 'vitest';

import type { AppContextType } from '../../src/internal/appContextType';

const createMockAppContext = (
  overrides: Partial<AppContextType>,
): AppContextType => ({
  config: { selectedZoneId: null },
  coreUrl: null,
  domSelectedZoneId: null,
  isAlbumArtModalOpen: false,
  setConfig: vi.fn(),
  setDomSelectedZoneId: vi.fn(),
  setIsAlbumArtModalOpen: vi.fn(),
  ...overrides,
});

export { createMockAppContext };
