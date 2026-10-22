import type { ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { loadConfig, saveConfig } from './config';
import type { AppContextType } from './internal/appContextType';
import type { Config } from './internal/configType';
import type { MessageType } from './internal/messageType';
import { socket } from './socket';

const AppContext = createContext<AppContextType | null>(null);

function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error('useApp must be used inside AppProvider');
  return value;
}

function AppProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState(
    () => loadConfig() || { selectedZoneId: null },
  );
  const [coreUrl, setCoreUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => saveConfig(config), [config]);

  useEffect(() => {
    const handleCoreUrlMessage = (url: string) => setCoreUrl(url);

    socket.on('coreUrl', handleCoreUrlMessage);
    socket.connect();

    return () => {
      socket.off('coreUrl', handleCoreUrlMessage);
      socket.disconnect();
    };
  }, []);

  const setSelectedZoneId = useCallback(
    (zoneId: string) =>
      setConfig((currentConfig: Config) => ({
        ...currentConfig,
        selectedZoneId: zoneId,
      })),
    [],
  );

  const value = useMemo(
    () => ({
      config,
      coreUrl,
      messages,
      setConfig,
      setMessages,
      setSelectedZoneId,
    }),
    [config, coreUrl, messages, setSelectedZoneId],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export { AppProvider, useApp };
