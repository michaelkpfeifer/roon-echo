import RoonApi from 'node-roon-api';
import RoonApiStatus from 'node-roon-api-status';
import RoonApiTransport from 'node-roon-api-transport';
import { subscribedMessageHandler } from './roon_state.js';

let transport;

let roon = new RoonApi({
  /* eslint-disable camelcase */
  extension_id: 'com.roon-remote-backend.test',
  display_name: 'Roon Web Remote Extension',
  display_version: '0.0.0',
  publisher: 'Michael Pfeifer',
  email: 'michael.k.pfeifer@googlemail.com',
  website: 'https://github.com/michaelkpfeifer',

  core_paired: function (core) {
    transport = core.services.RoonApiTransport;
    transport.subscribe_zones(subscribedMessageHandler);
  },

  core_unpaired: function (_core) {},
  /* eslint-enable camelcase */
});

let serviceStatus = new RoonApiStatus(roon);

roon.init_services({
  /* eslint-disable camelcase */
  required_services: [RoonApiTransport],
  provided_services: [serviceStatus],
  /* eslint-enable camelcase */
});

serviceStatus.set_status('All is good', false);

export { roon, transport };
