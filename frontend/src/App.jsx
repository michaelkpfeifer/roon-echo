import fp from 'lodash/fp';
import { useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

import AppContext from './AppContext';
import NowPlaying from './NowPlaying';

function App() {
  const [roonState, setRoonState] = useState({
    zones: {},
  });
  const [appState, setAppState] = useState({
    selectedZoneId: null,
  });

  const socketRef = useRef(null);
  const coreUrlRef = useRef('');

  useEffect(() => {
    socketRef.current = io('http://192.168.2.102:4000');
    const socket = socketRef.current;

    socket.on('coreUrl', (coreUrl) => {
      // console.log('App.jsx, processing coreUrl message: coreUrl:', coreUrl);

      coreUrlRef.current = coreUrl;
    });

    socket.on('subscribedState', (subscribedState) => {
      /* eslint-disable no-console */
      console.log(
        'App.jsx: processing subscribedState message: subscribedState:',
        subscribedState,
      );
      /* eslint-enable no-console */

      setRoonState(subscribedState);
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
  }, []);

  // console.log('App.jsx: App(): roonState:', roonState);
  // console.log('App.jsx: App(): appState:', appState);

  const contextValue = useMemo(
    () => ({
      appState,
      coreUrlRef,
      roonState,
      setAppState,
      setRoonState,
      socketRef,
    }),
    [appState, coreUrlRef, roonState, setAppState, setRoonState, socketRef],
  );

  return (
    <AppContext.Provider value={contextValue}>
      <div className="page">
        <div className="container">
          <div className="left" />
          <div className="right" />
        </div>
        <div className="bottom">
          <NowPlaying roonState={roonState} appState={appState} />
        </div>
      </div>
    </AppContext.Provider>
  );
}

export default App;
