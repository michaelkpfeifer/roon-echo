import type { MessageType } from './internal/messageType';

const addMessage = (
  messages: MessageType[],
  newMessage: MessageType,
): MessageType[] => {
  return [newMessage, ...messages];
};

export { addMessage };
