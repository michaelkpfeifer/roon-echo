let roonState = {};

const getRoonState = () => roonState;

// data = {
//     "zones_seek_changed": [
//         {
//             "zone_id": "16015c7d1c89a5661d3c760db9383dd99135",
//             "queue_time_remaining": 2434,
//             "seek_position": 90
//         }
//     ]
// }

const updateQueueTimeRemaining = (state, msg) => {};

const handleZonesSeekChanged = (state, msg) => {
  console.log('state =', state);
  console.log('msg =', msg);
};

const zoneSubscriptionMessageHandler = (cmd, data) => {
  console.log('cmd =', JSON.stringify(cmd, null, 4));
  console.log('data =', JSON.stringify(data, null, 4));

  switch (cmd) {
    case 'Subscribed':
      console.log('*** data =', data);

      roonState = data;
      break;
    case 'Changed':
      for (const attr in data) {
        switch (attr) {
          case 'zones_seek_changed':
            console.log('Handling zones seek changed:', data[attr]);
            roonState = handleZonesSeekChanged(roonState, data[attr]);
            break;
          default:
            // TODO: We should raise an error if we receive a state
            // update that we are unable to handle.

            console.log('Unknown attr:', attr);
        }
      }
      break;
  }
};

module.exports = { getRoonState, zoneSubscriptionMessageHandler };
