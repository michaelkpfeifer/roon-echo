import React, { useEffect, useState } from 'react';
// import axios from 'axios';
import { io } from 'socket.io-client';
import fp from 'lodash/fp.js';

const App = () => {
  const [roonState, setRoonState] = useState({
    zones: {},
    nowPlaying: {},
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

    socket.on('subscriptionState', (subscriptionState) => {
      setRoonState(subscriptionState);
    });

    socket.on('zonesSeekChanged', (zonesSeekChangedMessage) => {
      // console.log(
      //   'App.jsx: processing zonesSeekChanged message: Object.values(zonesSeekChangedMessage) =',
      //   Object.values(zonesSeekChangedMessage),
      // );

      setRoonState((currentState) => {
        return Object.values(zonesSeekChangedMessage).reduce((acc, val) => {
          const { queueTimeRemaining, seekPosition, zoneId } = val;

          return fp.flow(
            fp.set(['zones', zoneId, 'queueTimeRemaining'], queueTimeRemaining),
            fp.set(
              ['nowPlaying', zoneId, 'nowPlaying', 'seekPosition'],
              seekPosition,
            ),
          )(currentState);
        }, currentState);
      });
    });

    socket.on('zonesChanged', (zonesChangedMessage) => {
      console.log(
        'App.jsx: processing zonesChanged message: Object.values(zonesChangedMessage) =',
        Object.values(zonesChangedMessage),
      );

      setRoonState((currentState) => {
        return Object.values(zonesChangedMessage).reduce((acc, val) => {
          const { displayName, nowPlaying, queueTimeRemaining, state, zoneId } =
            val;

          return fp.flow(
            fp.set(['zones', zoneId, 'displayName'], displayName),
            fp.set(['zones', zoneId, 'queueTimeRemaining'], queueTimeRemaining),
            fp.set(['zones', zoneId, 'state'], state),
            fp.set(['nowPlaying', zoneId, 'nowPlaying'], nowPlaying),
          )(currentState);
        }, currentState);
      });
    });
  }, []);

  console.log('App.jsx: App(): roonState:', roonState);

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

      <h1>Now Playing</h1>
      <ul>
        {Object.values(roonState.nowPlaying).map((zone) => (
          <li key={zone.zoneId}>
            {zone.nowPlaying.oneLine.line1} - {zone.nowPlaying.seekPosition}
          </li>
        ))}
      </ul>
    </>
  );
};

export default App;
