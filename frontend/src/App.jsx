import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import fp from 'lodash/fp.js';
import AppContext from './AppContext';
import NowPlaying from './NowPlaying';

const App = () => {
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
      console.log(
        'App.jsx: processing subscribedState message: subscribedState:',
        subscribedState,
      );

      setRoonState(subscribedState);
    });

    socket.on('zonesSeekChanged', (zonesSeekChangedMessage) => {
      // console.log(
      //   'App.jsx: processing zonesSeekChanged message: zonesSeekChangedMessage:',
      //   zonesSeekChangedMessage,
      // );

      setRoonState((currentState) => {
        return Object.values(zonesSeekChangedMessage).reduce((acc, val) => {
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
        }, currentState);
      });
    });

    socket.on('zonesChanged', (zonesChangedMessage) => {
      // console.log(
      //   'App.jsx: processing zonesChanged message: zonesChangedMessage =',
      //   zonesChangedMessage,
      // );

      setRoonState((currentState) => {
        return fp.merge(currentState, zonesChangedMessage);
      });
    });
  }, []);

  // console.log('App.jsx: App(): roonState:', roonState);
  // console.log('App.jsx: App(): appState:', appState);

  return (
    <AppContext.Provider
      value={{
        appState,
        coreUrlRef,
        roonState,
        setAppState,
        setRoonState,
        socketRef,
      }}
    >
      <div className="page">
        <div className="container">
          <div className="left"></div>
          <div className="right"></div>
        </div>
        <div className="bottom">
          <NowPlaying roonState={roonState} appState={appState} />
        </div>
      </div>
    </AppContext.Provider>
  );
};

export default App;
