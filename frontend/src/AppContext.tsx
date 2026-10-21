import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { loadConfig, saveConfig } from './config';
import type { AppContextType } from './internal/appContextType';
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
  const [domSelectedZoneId, setDomSelectedZoneId] = useState<string | null>(
    null,
  );
  const [isAlbumArtModalOpen, setIsAlbumArtModalOpen] = useState(false);
  const [messages, setMessages] = useState<MessageType[]>([]);

  useEffect(() => saveConfig(config), [config]);

  useEffect(() => {
    const handleInitialState = () => {
      setDomSelectedZoneId(loadConfig().selectedZoneId || null);
    };
    const handleCoreUrl = (url: string) => setCoreUrl(url);

    socket.on('initialState', handleInitialState);
    socket.on('coreUrl', handleCoreUrl);
    socket.connect();

    return () => {
      socket.off('initialState', handleInitialState);
      socket.off('coreUrl', handleCoreUrl);
      socket.disconnect();
    };
  }, []);

  const value = useMemo(
    () => ({
      config,
      coreUrl,
      domSelectedZoneId,
      isAlbumArtModalOpen,
      messages,
      setConfig,
      setDomSelectedZoneId,
      setIsAlbumArtModalOpen,
      setMessages,
    }),
    [config, coreUrl, domSelectedZoneId, isAlbumArtModalOpen, messages],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export { AppProvider, useApp };
