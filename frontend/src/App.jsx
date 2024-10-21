import React, { useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const App = () => {
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

    socket.on('welcome', (msg) => {
      console.log('This is the server response: ', msg);
    });

    socket.on('broadcastMessage', (msg) => {
      console.log('broadcastMessage:', msg);
    });
  }, []);

  return <h1>Roon Zones</h1>;
};

export default App;
