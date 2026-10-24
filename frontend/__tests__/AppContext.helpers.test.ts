import { describe, expect, it } from 'vitest';

import { addMessage } from '../src/AppContext.helpers';
import type { MessageType } from '../src/internal/messageType';

describe('addMessage', () => {
  it('adds a message to an emtpy list of messages', () => {
    const messages: MessageType[] = [];
    const newMessage: MessageType = {
      severity: 'error',
      message: 'backend error',
      timestamp: new Date().toISOString(),
    };

    const newMessages = addMessage(messages, newMessage);

    expect(newMessages).toStrictEqual([newMessage]);
  });

  it('pushes a new message to the front of a list of messages', () => {
    const oldMessage: MessageType = {
      severity: 'error',
      message: 'old backend error',
      timestamp: new Date().toISOString(),
    };
    const messages: MessageType[] = [oldMessage];
    const newMessage: MessageType = {
      severity: 'error',
      message: 'backend error',
      timestamp: new Date().toISOString(),
    };

    const newMessages = addMessage(messages, newMessage);

    expect(newMessages).toStrictEqual([newMessage, oldMessage]);
  });
});
