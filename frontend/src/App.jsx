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

    socket.on('frontendState', (frontendState) => {
      setRoonState(frontendState);
    });

    socket.on('broadcastMessage', (msg) => {});
  }, []);

  return (
    <>
      <h1>Roon Zones</h1>
      <ul>
        {Object.values(roonState.zones).map((zone) => (
          <li>{zone.displayName}</li>
        ))}
      </ul>
    </>
  );
};

export default App;
