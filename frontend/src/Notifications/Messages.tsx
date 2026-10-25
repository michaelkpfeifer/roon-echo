import { useApp } from '../AppContext';

function Messages() {
  const { messages } = useApp();

  if (messages.length === 0) {
    return <span className="notifications--messages" aria-label="Messages" />;
  }

  return (
    <span className="notifications-messages" aria-label="Messages">
      {messages[0].message}
    </span>
  );
}

export default Messages;
