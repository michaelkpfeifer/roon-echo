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

      // console.log(
      //   'roon_state.js: zoneSubscriptionMessageHandler(): roonState:',
      //   JSON.stringify(roonState, null, 4),
      // );

      break;
    case 'Changed':
      for (const attr in data) {
        switch (attr) {
          case 'zonesSeekChanged':
            // console.log(
            //   'roon_state.js: processing zonesSeekChanged message: data[attr]:',
            //   JSON.stringify(data[attr], null, 4),
            // );

            roonState = handleZonesSeekChanged(roonState, data[attr]);

            // console.log(
            //   'roon_state.js: emitting zonesSeekChanged message: buildZonesSeekChangedMessage(data[attr]):',
            //   JSON.stringify(buildZonesSeekChangedMessage(data[attr]), null, 4),
            // );

            io.emit(
              'zonesSeekChanged',
              buildZonesSeekChangedMessage(data[attr]),
            );
            break;

          case 'zonesChanged':
            // console.log(
            //   'roon_state.js: processing zonesChanged message: data[attr]:',
            //   JSON.stringify(data[attr], null, 4),
            // );

            console.log(
              'roon_state.js: emitting zonesChanged message: buildZonesChangedMessage(data[attr]):',
              JSON.stringify(buildZonesChangedMessage(data[attr], null, 4)),
            );

            io.emit('zonesChanged', buildZonesChangedMessage(data[attr]));
            break;

          default:
            console.log(
              'roon_state.js: unknown message: attr:',
              JSON.stringify(attr, null, 4),
            );
            console.log(
              'roon_state.js: unknown message: data[attr]',
              JSON.stringify(data[attr], null, 4),
            );

            break;
        }
      }
      break;
  }
};

const subscriptionState = () => {
  if (roonState === {}) {
    return {
      zones: {},
    };
  } else {
    return {
      zones: Object.fromEntries(
        roonState.zones.map((zone) => {
          return [
            zone.zoneId,
            {
              displayName: zone.displayName,
              queueTimeRemaining: zone.queueTimeRemaining,
              state: zone.state,
              zoneId: zone.zoneId,
            },
          ];
        }),
      ),
      nowPlaying: Object.fromEntries(
        roonState.zones
          .filter((zone) => zone.nowPlaying)
          .map((zone) => {
            return [
              zone.zoneId,
              {
                nowPlaying: zone.nowPlaying,
                seekPosition: zone.seekPosition,
                zoneId: zone.zoneId,
              },
            ];
          }),
      ),
    };
  }
};

const buildZonesSeekChangedMessage = (coreMsg) => {
  return Object.fromEntries(
    coreMsg.map((zoneData) => {
      return [
        zoneData.zoneId,
        {
          seekPosition: zoneData.seekPosition,
          queueTimeRemaining: zoneData.queueTimeRemaining,
          zoneId: zoneData.zoneId,
        },
      ];
    }),
  );
};

const buildZonesChangedMessage = (coreMsg) => {
  return Object.fromEntries(
    coreMsg.map((zoneData) => {
      return [
        zoneData.zoneId,
        {
          displayName: zoneData.displayName,
          nowPlaying: zoneData.nowPlaying ? zoneData.nowPlaying : null,
          queueTimeRemaining: zoneData.queueTimeRemaining,
          state: zoneData.state,
          zoneId: zoneData.zoneId,
        },
      ];
    }),
  );
};

export { getRoonState, subscriptionState, zoneSubscriptionMessageHandler };
