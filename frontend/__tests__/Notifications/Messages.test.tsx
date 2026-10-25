import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, describe, it, vi } from 'vitest';

import { AppContext } from '../../src/AppContext';
import type { MessageType } from '../../src/internal/messageType';
import Messages from '../../src/Notifications/Messages';
import { createMockAppContext } from '../testUtils/mockAppContext';

const renderWithContext = (messages: MessageType[]) => {
  const appContextValue = createMockAppContext({ messages });
  return render(
    <AppContext.Provider value={appContextValue}>
      <Messages />
    </AppContext.Provider>,
  );
};

describe('Messages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders an empty element when there are no messages', () => {
    renderWithContext([]);

    const element = screen.getByLabelText('Messages');

    expect(element).toBeEmptyDOMElement();
  });

  it('renders an element with text and timestamp of the first message', () => {
    const timestamp = new Date().toISOString();
    const messages: MessageType[] = [
      {
        severity: 'error',
        message: 'backend error',
        timestamp,
      },
    ];
    renderWithContext(messages);

    const element = screen.getByLabelText('Messages');

    expect(element).toHaveTextContent('backend error');
    expect(element).toHaveTextContent(timestamp);
  });

  it('assigns the correct CSS class', () => {
    const messages: MessageType[] = [
      {
        severity: 'fatal',
        message: 'backend error',
        timestamp: new Date().toISOString(),
      },
    ];

    renderWithContext(messages);
    expect(screen.getByLabelText('Messages')).toHaveClass(
      'notifications-messages--fatal',
    );
  });
});
