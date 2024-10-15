let roon_state = {};

const getRoonState = () => roon_state;

// data = {
//     "zones_seek_changed": [
//         {
//             "zone_id": "16015c7d1c89a5661d3c760db9383dd99135",
//             "queue_time_remaining": 2434,
//             "seek_position": 90
//         }
//     ]
// }

const update_queue_time_remaining = (state, msg) => {};

const handle_zones_seek_changed = (state, msg) => {
  console.log('state =', state);
  console.log('msg =', msg);
};

const zone_subscription_message_handler = (cmd, data) => {
  console.log('cmd =', JSON.stringify(cmd, null, 4));
  console.log('data =', JSON.stringify(data, null, 4));

  switch (cmd) {
    case 'Subscribed':
      console.log('*** data =', data);

      roon_state = data;
      break;
    case 'Changed':
      for (const attr in data) {
        switch (attr) {
          case 'zones_seek_changed':
            console.log('Handling zones seek changed:', data[attr]);
            roon_state = handle_zones_seek_changed(roon_state, data[attr]);
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

module.exports = { getRoonState, zone_subscription_message_handler };
