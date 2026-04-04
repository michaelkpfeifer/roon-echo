import fp from 'lodash/fp';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

import AppContext from './AppContext';
import { loadConfig, saveConfig } from './config';
import type { AppContextType } from './internal/appContextType';
import type { AppState } from './internal/appState';
import type { RoonState } from './internal/roonState';
import Album from './Main/Album';
import Albums from './Main/Albums';
import Artists from './Main/Artists';
import Home from './Main/Home';
import Queues from './Main/Queues';
import Tracks from './Main/Tracks';
import NowPlaying from './NowPlaying';
import Sidebar from './Sidebar';
import { mergeAlbum, mergeQueues, setAlbums } from './utils';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
} from '../../shared/internal/socket';

function App() {
  const [roonState, setRoonState] = useState<RoonState>({
    zones: {},
  });

  const [appState, setAppState] = useState<AppState>({
    albums: [],
    queues: {},
    isZonesModalOpen: false,
    tmpSelectedZoneId: null,
  });

  const [config, setConfig] = useState(
    () => loadConfig() || { selectedZoneId: null },
  );

  const [coreUrl, setCoreUrl] = useState<string | null>(null);

  useEffect(() => saveConfig(config), [config]);

  const socketRef = useRef<Socket<
    ServerToClientEvents,
    ClientToServerEvents
  > | null>(null);

  useEffect(() => {
    socketRef.current = io('http://192.168.2.102:4000');
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> =
      socketRef.current;

    socket.on('initialState', (initialState) => {
      setRoonState(initialState);

      setAppState((currentAppState) => ({
        ...currentAppState,
        tmpSelectedZoneId: loadConfig().selectedZoneId || null,
      }));
    });

    socket.on('coreUrl', (roonCoreUrl) => {
      setCoreUrl(roonCoreUrl);
    });

    socket.on('zonesSeekChanged', (zonesSeekChangedMessage) => {
      setRoonState((currentState) =>
        Object.values(zonesSeekChangedMessage).reduce((acc, val) => {
          const { queueTimeRemaining, seekPosition, zoneId } = val;
          if (seekPosition) {
            return fp.merge(acc, {
              zones: {
                [zoneId]: {
                  queueTimeRemaining,
                  nowPlaying: {
                    seekPosition,
                  },
                },
              },
            });
          } else {
            return fp.merge(acc, {
              zones: {
                [zoneId]: {
                  queueTimeRemaining,
                },
              },
            });
          }
        }, currentState),
      );
    });

    socket.on('zonesChanged', (zonesChangedMessage) => {
      setRoonState((currentState) =>
        fp.merge(currentState, zonesChangedMessage),
      );
    });

    socket.on('albums', (albums) => {
      setAppState((currentAppState) => setAlbums(currentAppState, albums));
    });

    socket.on('albumUpdate', (album) => {
      setAppState((currentAppState) => mergeAlbum(currentAppState, album));
    });

    socket.on('queueChanged', ({ zoneId, queueItems }) => {
      setAppState((currentAppState) => {
        const mergedQueues = mergeQueues(currentAppState, zoneId, queueItems);

        return mergedQueues;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  /* eslint-disable no-console */
  // console.log('App.jsx: App(): roonState:', roonState);
  /* eslint-enable no-console */

  /* eslint-disable no-console */
  // console.log('App.jsx: App(): appState:', appState);
  /* eslint-enable no-console */

  /* eslint-disable no-console */
  // console.log('App.jsx: App(): config:', config);
  /* eslint-enable no-console */

  const appContextValue: AppContextType = useMemo(
    () => ({
      appState,
      config,
      coreUrl,
      roonState,
      setAppState,
      setConfig,
      setRoonState,
      socketRef,
    }),
    [config, appState, coreUrl, roonState, socketRef],
  );

  return (
    <AppContext.Provider value={appContextValue}>
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
              </Routes>
            </div>
          </div>
          <div className="footer">
            <NowPlaying />
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
