import { camelCaseKeys } from './utils.js';
import { io } from './server.js';

let subscribedState = {};

const getSubscribedState = () => subscribedState;

const subscribedMessageHandler = (cmd, snakeCaseData) => {
  const data = camelCaseKeys(snakeCaseData);
  switch (cmd) {
    case 'Subscribed':
      subscribedState = buildSubscribedState(data);

      console.log(
        'roon_state.js: subscribedMessageHandler(): subscribedState:',
        JSON.stringify(subscribedState, null, 4),
      );

      break;
    case 'Changed':
      for (const attr in data) {
        switch (attr) {
          case 'zonesSeekChanged':
            // console.log(
            //   'roon_state.js: processing zonesSeekChanged message: data[attr]:',
            //   JSON.stringify(data[attr], null, 4),
            // );

            const zonesSeekChangedMessage = buildZonesSeekChangedMessage(
              data[attr],
            );

            // console.log(
            //   'roon_state.js: emitting zonesSeekChanged message: zonesSeekChangedMessage:',
            //   JSON.stringify(zonesSeekChangedMessage, null, 4),
            // );

            io.emit('zonesSeekChanged', zonesSeekChangedMessage);
            break;

          case 'zonesChanged':
            // console.log(
            //   'roon_state.js: processing zonesChanged message: data[attr]:',
            //   JSON.stringify(data[attr], null, 4),
            // );

            const zonesChangedMessage = buildZonesChangedMessage(data[attr]);

            // console.log(
            //   'roon_state.js: emitting zonesChanged message: zonesChangedMessage):',
            //   JSON.stringify(zonesChangedMessage, null, 4),
            // );

            io.emit('zonesChanged', zonesChangedMessage);
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

const extractZoneData = (zoneData) => {
  return {
    zoneId: zoneData.zoneId,
    displayName: zoneData.displayName,
    state: zoneData.state,
    queueTimeRemaining: zoneData.queueTimeRemaining,
    nowPlaying: zoneData.nowPlaying ? zoneData.nowPlaying : null,
  };
};

const buildSubscribedState = (data) => {
  return {
    zones: Object.fromEntries(
      data.zones.map((zoneData) => {
        return [zoneData.zoneId, extractZoneData(zoneData)];
      }),
    ),
  };
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
  return {
    zones: Object.fromEntries(
      coreMsg.map((zoneData) => {
        return [zoneData.zoneId, extractZoneData(zoneData)];
      }),
    ),
  };
};

export { getSubscribedState, subscribedMessageHandler };
