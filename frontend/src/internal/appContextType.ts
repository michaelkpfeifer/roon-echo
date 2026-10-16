import type { Dispatch, SetStateAction } from 'react';

import type { Config } from './config';

type AppContextType = {
  config: Config;
  coreUrl: string | null;
  domSelectedZoneId: string | null;
  setConfig: Dispatch<SetStateAction<Config>>;
  setDomSelectedZoneId: Dispatch<SetStateAction<string | null>>;
};

export type { AppContextType };
