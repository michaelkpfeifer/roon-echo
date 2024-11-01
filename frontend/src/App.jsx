import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import fp from 'lodash/fp.js';

const App = () => {
  const [roonState, setRoonState] = useState({
    zones: {},
  });

  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io('http://192.168.2.102:4000');
    const socket = socketRef.current;

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

  const zoneDisplay = (
    <>
      <h1>Zones</h1>
      {Object.values(roonState.zones).map((zone) => (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '60%',
          }}
          key={zone.zoneId}
        >
          <span style={{ flex: 1 }}>{zone.displayName}</span>
          <span style={{ flex: 1 }}>{zone.state}</span>
          <span style={{ flex: 1 }}>{zone.queueTimeRemaining}</span>
        </div>
      ))}
    </>
  );

  const nowPlayingDisplay = (
    <>
      <h1>Playing</h1>
      {Object.values(roonState.zones)
        .filter((zone) => zone.nowPlaying)
        .map((zone) => (
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '60%',
            }}
            key={zone.zoneId}
          >
            <span style={{ flex: 3 }}>{zone.displayName}</span>
            <span style={{ flex: 3 }}>{zone.nowPlaying.oneLine.line1}</span>
            <span style={{ flex: 1 }}>{zone.nowPlaying.seekPosition}</span>
            <span style={{ flex: 1 }}>
              <button
                onClick={() => {
                  socketRef.current.emit('pause', { zoneId: zone.zoneId });
                }}
                disabled={zone.state === 'paused'}
              >
                Pause
              </button>
            </span>
            <span style={{ flex: 1 }}>
              <button
                onClick={() => {
                  socketRef.current.emit('play', { zoneId: zone.zoneId });
                }}
                disabled={zone.state === 'playing'}
              >
                Play
              </button>
            </span>
          </div>
        ))}
    </>
  );

  return (
    <>
      {zoneDisplay}
      {nowPlayingDisplay}
    </>
  );
};

export default App;
