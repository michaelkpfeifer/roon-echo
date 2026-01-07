import fp from 'lodash/fp';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { io } from 'socket.io-client';

import AppContext from './AppContext';
import { loadConfig, saveConfig } from './config';
import Album from './Main/Album';
import Albums from './Main/Albums';
import Artists from './Main/Artists';
import Home from './Main/Home';
import Queues from './Main/Queues';
import Tracks from './Main/Tracks';
import NowPlaying from './NowPlaying';
import Sidebar from './Sidebar';
import { mergeAlbum, mergeQueues, setAlbums } from './utils';

function App() {
  const [roonState, setRoonState] = useState({
    zones: {},
  });

  const [appState, setAppState] = useState({
    albums: {},
    queues: {},
    isZonesModalOpen: false,
    tmpSelectedZoneId: null,
  });

  const [config, setConfig] = useState(
    () => loadConfig() || { selectedZoneId: null },
  );

  const [coreUrl, setCoreUrl] = useState(null);

  useEffect(() => saveConfig(config), [config]);

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://192.168.2.102:4000');
    const socket = socketRef.current;

    socket.on('initialState', (initialState) => {
      /* eslint-disable no-console */
      console.log('App.jsx: App(): initialState:', initialState);
      /* eslint-enable no-console */

      setRoonState(initialState);

      setAppState((currentAppState) => ({
        ...currentAppState,
        tmpSelectedZoneId: loadConfig().selectedZoneId || null,
      }));
    });

    socket.on('coreUrl', (roonCoreUrl) => {
      /* eslint-disable no-console */
      // console.log(
      //   'App.jsx, processing coreUrl message: roonCoreUrl:',
      //   roonCoreUrl,
      // );
      /* eslint-enable no-console */

      setCoreUrl(roonCoreUrl);
    });

    socket.on('zonesSeekChanged', (zonesSeekChangedMessage) => {
      // console.log(
      //   'App.jsx: processing zonesSeekChanged message: zonesSeekChangedMessage:',
      //   zonesSeekChangedMessage,
      // );

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
      // console.log(
      //   'App.jsx: processing zonesChanged message: zonesChangedMessage =',
      //   zonesChangedMessage,
      // );

      setRoonState((currentState) =>
        fp.merge(currentState, zonesChangedMessage),
      );
    });

    socket.on('albums', (albums) => {
      /* eslint-disable no-console */
      console.log('App.jsx: processing albums message: albums:', albums);
      /* eslint-enable no-console */

      setAppState((currentAppState) => setAlbums(currentAppState, albums));
    });

    socket.on('albumUpdate', (album) => {
      /* eslint-disable no-console */
      console.log('App.jsx: processing albumUpdate message: album:', album);
      /* eslint-enable no-console */

      setAppState((currentAppState) => mergeAlbum(currentAppState, album));
    });

    socket.on('queueChanged', ({ zoneId, queueItems }) => {
      /* eslint-disable no-console */
      console.log('App.jsx: processing queueChanged message: zoneid:', zoneId);
      /* eslint-enable no-console */
      /* eslint-disable no-console */
      console.log(
        'App.jsx: processing queueChanged message: queueItems:',
        queueItems,
      );
      /* eslint-enable no-console */

      setAppState((currentAppState) => {
        const mergedQueues = mergeQueues(currentAppState, zoneId, queueItems);

        /* eslint-disable no-console */
        console.log(
          'App.jsx: processing queueChanged message: mergedQueues:',
          mergedQueues,
        );
        /* eslint-enable no-console */

        return mergedQueues;
      });
    });
  }, [config]);

  /* eslint-disable no-console */
  // console.log('App.jsx: App(): roonState:', roonState);
  /* eslint-enable no-console */

  /* eslint-disable no-console */
  // console.log('App.jsx: App(): appState:', appState);
  /* eslint-enable no-console */

  /* eslint-disable no-console */
  // console.log('App.jsx: App(): config:', config);
  /* eslint-enable no-console */

  const contextValue = useMemo(
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
    <AppContext.Provider value={contextValue}>
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
                <Route path="/albums/:mbAlbumId" element={<Album />} />
                <Route path="/artists" element={<Artists />} />
                <Route path="/tracks" element={<Tracks />} />
                <Route path="/queues" element={<Queues />} />
              </Routes>
            </div>
          </div>
          <div className="footer">
            <NowPlaying roonState={roonState} appState={appState} />
          </div>
        </div>
      </Router>
    </AppContext.Provider>
  );
}

export default App;
