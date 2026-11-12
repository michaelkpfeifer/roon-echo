import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { DataContext } from '../../src/DataContext';
import Artists from '../../src/Main/Artists';
import { createMockDataContext } from '../testUtils/mockDataContext';

const renderWithContext = () => {
  const dataContextValue = createMockDataContext({});
  return render(
    <DataContext.Provider value={dataContextValue}>
      <Artists />
    </DataContext.Provider>,
  );
};

describe('Artists', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Filter clear button', () => {
    it('is not present when artistsPattern is empty', () => {
      renderWithContext();

      expect(
        screen.queryByRole('button', { name: 'Clear artists filter' }),
      ).not.toBeInTheDocument();
    });

    it('is present once artistsPattern has a value, and clears it on click', async () => {
      renderWithContext();

      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'Kamasi');

      const clearButton = screen.getByRole('button', {
        name: 'Clear artists filter',
      });
      expect(clearButton).toBeInTheDocument();

      await userEvent.click(clearButton);

      expect(input).toHaveValue('');
      expect(
        screen.queryByRole('button', { name: 'Clear artists filter' }),
      ).not.toBeInTheDocument();
    });
  });
});
