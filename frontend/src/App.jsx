import React, { useEffect, useState } from 'react';
// import axios from 'axios';
import { io } from 'socket.io-client';
import fp from 'lodash/fp.js';

const App = () => {
  const [roonState, setRoonState] = useState({
    zones: {},
  });

  // useEffect(() => {
  //   axios
  //     .get('http://localhost:4000/api')
  //     .then((response) => {
  //       console.log('response =', response);
  //     })
  //     .catch((error) => console.error(error));
  // }, []);

  useEffect(() => {
    const socket = io('http://192.168.2.102:4000');

    socket.on('subscribedState', (subscribedState) => {
      setRoonState(subscribedState);
    });

    socket.on('zonesSeekChanged', (zonesSeekChangedMessage) => {
      // console.log(
      //   'App.jsx: processing zonesSeekChanged message: zonesSeekChangedMessage =',
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

  return (
    <>
      <h1>Zones</h1>
      <ul>
        {Object.values(roonState.zones).map((zone) => (
          <li key={zone.zoneId}>
            {zone.displayName}, {zone.state}, {zone.queueTimeRemaining}
          </li>
        ))}
      </ul>
      <h1>Playing</h1>
      <ul>
        {Object.values(roonState.zones)
          .filter((zone) => zone.nowPlaying)
          .map((zone) => (
            <li key={zone.zoneId}>
              {zone.displayName} - {zone.nowPlaying.oneLine.line1} -
              {zone.nowPlaying.seekPosition}
            </li>
          ))}
      </ul>{' '}
    </>
  );
};

export default App;
