import { vi } from 'vitest';

import type { AppContextType } from '../../src/internal/appContextType';

const createMockAppContext = (
  overrides: Partial<AppContextType>,
): AppContextType => ({
  config: { selectedZoneId: null },
  coreUrl: null,
  setSelectedZoneId: vi.fn(),
  ...overrides,
});

export { createMockAppContext };
