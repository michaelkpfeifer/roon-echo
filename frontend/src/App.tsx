import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import AppContext from './AppContext';
import { loadConfig, saveConfig } from './config';
import { DataProvider } from './DataContext';
import type { AppContextType } from './internal/appContextType';
import Album from './Main/Album';
import Albums from './Main/Albums';
import Artists from './Main/Artists';
import Home from './Main/Home';
import Queues from './Main/Queues';
import Tags from './Main/Tags';
import Tracks from './Main/Tracks';
import Zones from './Main/Zones';
import NowPlaying from './NowPlaying';
import { PlaybackProvider } from './PlaybackContext';
import Sidebar from './Sidebar';
import { socket } from './socket';

function App() {
  const [config, setConfig] = useState(
    () => loadConfig() || { selectedZoneId: null },
  );
  const [coreUrl, setCoreUrl] = useState<string | null>(null);
  const [domSelectedZoneId, setDomSelectedZoneId] = useState<string | null>(
    null,
  );
  const [isAlbumArtModalOpen, setIsAlbumArtModalOpen] = useState(false);

  useEffect(() => saveConfig(config), [config]);

  useEffect(() => {
    socket.connect();

    const handleCoreUrlMessage = (roonCoreUrl: string) => {
      setCoreUrl(roonCoreUrl);
    };

    socket.on('coreUrl', handleCoreUrlMessage);

    return () => {
      socket.off('coreUrl', handleCoreUrlMessage);
      socket.disconnect();
    };
  }, []);

  /* eslint-disable no-console */
  // console.log('App.jsx: App(): config:', config);
  /* eslint-enable no-console */

  const appContextValue: AppContextType = {
    config,
    coreUrl,
    domSelectedZoneId,
    isAlbumArtModalOpen,
    setConfig,
    setDomSelectedZoneId,
    setIsAlbumArtModalOpen,
  };

  return (
    <AppContext.Provider value={appContextValue}>
      <DataProvider>
        <PlaybackProvider>
          <Router>
            <div className="page">
              <div className="header" />
              <div className="container">
                <div className="left">
                  <Sidebar />
                </div>
                <div className="right">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/albums" element={<Albums />} />
                    <Route path="/albums/:id" element={<Album />} />
                    <Route path="/artists" element={<Artists />} />
                    <Route path="/tracks" element={<Tracks />} />
                    <Route path="/queues" element={<Queues />} />
                    <Route path="/tags" element={<Tags />} />
                    <Route path="/zones" element={<Zones />} />
                  </Routes>
                </div>
              </div>
              <div className="footer">
                <NowPlaying />
              </div>
            </div>
          </Router>
        </PlaybackProvider>
      </DataProvider>
    </AppContext.Provider>
  );
}

export default App;
