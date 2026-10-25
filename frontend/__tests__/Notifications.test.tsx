import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import Notifications from '../src/Notifications';
import { createMockAppContext } from './testUtils/mockAppContext';
import { AppContext } from '../src/AppContext';

const renderWithContext = () => {
  const appContextValue = createMockAppContext({});
  return render(
    <AppContext.Provider value={appContextValue}>
      <Notifications />
    </AppContext.Provider>,
  );
};

describe('Notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders the Messages component', () => {
    renderWithContext();

    expect(screen.getByLabelText('Messages')).toBeInTheDocument();
  });
});
