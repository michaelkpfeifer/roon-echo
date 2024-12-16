import fp from 'lodash/fp';
import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

import AppContext from './AppContext';
import { loadConfig, saveConfig } from './config';
import Main from './Main';
import NowPlaying from './NowPlaying';
import Sidebar from './Sidebar';
import { setAlbums, setArtists, setTracks } from './utils';

function App() {
  const [roonState, setRoonState] = useState({
    zones: {},
  });

  const [appState, setAppState] = useState({
    albums: [],
    artists: [],
    isZonesModalOpen: false,
    selectedScreen: null,
    tmpSelectedZoneId: null,
    tracks: [],
  });

  const [config, setConfig] = useState(
    () => loadConfig() || { selectedZoneId: null },
  );

  useEffect(() => saveConfig(config), [config]);

  const socketRef = useRef(null);
  const coreUrlRef = useRef('');

  useEffect(() => {
    socketRef.current = io('http://192.168.2.102:4000');
    const socket = socketRef.current;

    socket.on('coreUrl', (coreUrl) => {
      // console.log('App.jsx, processing coreUrl message: coreUrl:', coreUrl);

      coreUrlRef.current = coreUrl;
    });

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

    socket.on('allAlbums', (allAlbums) => {
      /* eslint-disable no-console */
      console.log(
        'App.jsx: processing allAlbums message: allAlbums:',
        allAlbums,
      );
      /* eslint-enable no-console */

      setAppState((currentAppState) => setAlbums(currentAppState, allAlbums));
    });

    socket.on('allArtists', (allArtists) => {
      /* eslint-disable no-console */
      console.log(
        'App.jsx: processing allArtists message: allArtists:',
        allArtists,
      );
      /* eslint-enable no-console */

      setAppState((currentAppState) => setArtists(currentAppState, allArtists));
    });

    socket.on('allTracks', (allTracks) => {
      /* eslint-disable no-console */
      console.log(
        'App.jsx: processing allTracks message: allTracks:',
        allTracks,
      );
      /* eslint-enable no-console */

      setAppState((currentAppState) => setTracks(currentAppState, allTracks));
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
      setAppState,
      roonState,
      setRoonState,
      config,
      setConfig,
      coreUrlRef,
      socketRef,
    }),
    [config, appState, coreUrlRef, roonState, socketRef],
  );

  return (
    <AppContext.Provider value={contextValue}>
      <div className="page">
        <div className="container">
          <div className="left">
            <Sidebar />
          </div>
          <div className="right">
            <Main />
          </div>
        </div>
        <div className="bottom">
          <NowPlaying roonState={roonState} appState={appState} />
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
