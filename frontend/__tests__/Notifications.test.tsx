import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

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
  it('renders the Messages component', () => {
    renderWithContext();

    expect(screen.getByLabelText('Messages')).toBeInTheDocument();
  });
});
