import { useApp } from '../AppContext';

function Messages() {
  const { messages } = useApp();

  if (messages.length === 0) {
    return <p></p>;
  }

  return <p>{messages[0].message}</p>;
}

export default Messages;
