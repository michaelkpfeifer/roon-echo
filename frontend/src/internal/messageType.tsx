type MessageType = {
  severity: 'fatal' | 'error' | 'warn' | 'info' | 'debug'
  message: string;
  timestamp: string;
}

export type { MessageType }
