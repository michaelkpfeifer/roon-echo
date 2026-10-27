import type { Dispatch, SetStateAction } from 'react';

import type { Config } from './configType';
import type { MessageType } from './messageType';

type AppContextType = {
  config: Config;
  coreUrl: string | null;
  messages: MessageType[];
  pushMessage: (message: MessageType) => void;
  setConfig: Dispatch<SetStateAction<Config>>;
  setSelectedZoneId: (zoneId: string) => void;
};

export type { AppContextType };
