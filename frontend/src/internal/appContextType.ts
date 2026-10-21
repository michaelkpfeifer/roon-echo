import type { Dispatch, SetStateAction } from 'react';

import type { Config } from './config';
import type { MessageType } from './messageType';

type AppContextType = {
  config: Config;
  coreUrl: string | null;
  domSelectedZoneId: string | null;
  isAlbumArtModalOpen: boolean;
  messages: MessageType[];
  setConfig: Dispatch<SetStateAction<Config>>;
  setDomSelectedZoneId: Dispatch<SetStateAction<string | null>>;
  setIsAlbumArtModalOpen: Dispatch<SetStateAction<boolean>>;
  setMessages: Dispatch<SetStateAction<MessageType[]>>;
};

export type { AppContextType };
