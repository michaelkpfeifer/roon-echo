import clsx from 'clsx';

import { useApp } from '../AppContext';

function Messages() {
  const { messages } = useApp();

  if (messages.length === 0) {
    return <span className="notifications--messages" aria-label="Messages" />;
  }

  const message = messages[0];
  const messageStyle = `notifications-messages--${message.severity}`;

  return (
    <div
      className={clsx('notifications-messages', messageStyle)}
      aria-label="Messages"
    >
      {message.timestamp}: {message.message}
    </div>
  );
}

export default Messages;
