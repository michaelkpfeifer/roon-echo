import { camelCaseKeys } from './utils.js';
import { io } from './server.js';

let roonState = {};

const getRoonState = () => roonState;

const updateQueueTimeRemaining = (state, zoneId, queueTimeRemaining) => {
  return {
    ...state,
    zones: state.zones.map((zone) =>
      zone.zoneId === zoneId
        ? { ...zone, queueTimeRemaining: queueTimeRemaining }
        : zone,
    ),
  };
};

const updateSeekPosition = (state, zoneId, seekPosition) => {
  return {
    ...state,
    zones: state.zones.map((zone) =>
      zone.zoneId === zoneId && zone.nowPlaying
        ? {
            ...zone,
            nowPlaying: {
              ...zone.nowPlaying,
              seekPosition: seekPosition,
            },
          }
        : zone,
    ),
  };

  return state;
};

const handleZonesSeekChanged = (state, msg) => {
  return msg.reduce((acc, zoneMsg) => {
    const zoneId = zoneMsg['zoneId'];
    const queueTimeRemaining = zoneMsg['queueTimeRemaining'];
    const seekPosition = zoneMsg['seekPosition'];

    return updateQueueTimeRemaining(
      updateSeekPosition(acc, zoneId, seekPosition),
      zoneId,
      queueTimeRemaining,
    );
  }, state);
};

const zoneSubscriptionMessageHandler = (cmd, snakeCaseData) => {
  const data = camelCaseKeys(snakeCaseData);
  switch (cmd) {
    case 'Subscribed':
      roonState = data;
      break;
    case 'Changed':
      for (const attr in data) {
        switch (attr) {
          case 'zonesSeekChanged':
            console.log('Handling zones seek changed:', data[attr]);

            io.emit('musicUpdate', 'This is the message'); // Notify all connected users

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

export { getRoonState, zoneSubscriptionMessageHandler };
