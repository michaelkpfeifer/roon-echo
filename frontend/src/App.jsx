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
  }, []);

  console.log('roonState:', roonState);

  return (
    <>
      <h1>Roon Zones</h1>
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
