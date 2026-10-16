import type { Config } from './configType';

type AppContextType = {
  config: Config;
  coreUrl: string | null;
  setSelectedZoneId: (zoneId: string) => void;
};

export type { AppContextType };
