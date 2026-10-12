import type { Dispatch, SetStateAction } from 'react';

import type { Config } from './config';

type AppContextType = {
  config: Config;
  coreUrl: string | null;
  domSelectedZoneId: string | null;
  isAlbumArtModalOpen: boolean;
  setConfig: Dispatch<SetStateAction<Config>>;
  setDomSelectedZoneId: Dispatch<SetStateAction<string | null>>;
  setIsAlbumArtModalOpen: Dispatch<SetStateAction<boolean>>;
};

export type { AppContextType };
