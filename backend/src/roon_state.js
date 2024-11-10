import { camelCaseKeys } from './utils.js';
import { io } from './server.js';
import {
  buildFrontendRoonState,
  buildZonesSeekChangedMessage,
} from './utils.js';

const coreMessageHandler = (cmd, snakeCaseData) => {
  const data = camelCaseKeys(snakeCaseData);
  switch (cmd) {
    case 'Subscribed':
      console.log(
        'roon_state.js: coreMessageHandler(): Received "Subscribed" message.',
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

            const zonesChangedMessage = buildFrontendRoonState(data[attr]);

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

export { coreMessageHandler };
