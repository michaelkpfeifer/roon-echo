import type { Config } from './config';

type AppContextType = {
  config: Config;
  coreUrl: string | null;
  setSelectedZoneId: (zoneId: string) => void;
};

export type { AppContextType };
