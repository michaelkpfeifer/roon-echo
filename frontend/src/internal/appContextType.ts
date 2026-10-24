import type { Dispatch, SetStateAction } from 'react';

import type { Config } from './configType';
import type { MessageType } from './messageType';

type AppContextType = {
  config: Config;
  coreUrl: string | null;
  messages: MessageType[];
  setConfig: Dispatch<SetStateAction<Config>>;
  setMessages: Dispatch<SetStateAction<MessageType[]>>;
  setSelectedZoneId: (zoneId: string) => void;
};

export type { AppContextType };
