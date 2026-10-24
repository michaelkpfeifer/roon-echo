import { vi } from 'vitest';

import type { AppContextType } from '../../src/internal/appContextType';

const createMockAppContext = (
  overrides: Partial<AppContextType>,
): AppContextType => ({
  config: { selectedZoneId: null },
  coreUrl: null,
  messages: [],
  setConfig: vi.fn(),
  setMessages: vi.fn(),
  setSelectedZoneId: vi.fn(),
  ...overrides,
});

export { createMockAppContext };
