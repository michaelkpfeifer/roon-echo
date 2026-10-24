import { useApp } from '../AppContext';

function Messages() {
  const { messages } = useApp();

  if (messages.length === 0) {
    return <span>Some Message</span>;
  }

  return <span>{messages[0].message}</span>;
}

export default Messages;
