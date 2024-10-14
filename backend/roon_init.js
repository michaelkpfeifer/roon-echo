const RoonApi = require("node-roon-api");
const RoonApiStatus = require("node-roon-api-status");
const RoonApiTransport = require("node-roon-api-transport");

const { zone_subscription_message_handler } = require("./roon_state.js");

let roon = new RoonApi({
  extension_id: "com.roon-remote.test",
  display_name: "Roon Web Remote Extension",
  display_version: "0.0.0",
  publisher: "Michael Pfeifer",
  email: "michael.k.pfeifer@googlemail.com",
  website: "https://github.com/michaelkpfeifer",

  core_paired: function (core) {
    let transport = core.services.RoonApiTransport;
    transport.subscribe_zones(zone_subscription_message_handler);
  },

  core_unpaired: function (_core) {},
});

let svc_status = new RoonApiStatus(roon);

roon.init_services({
  required_services: [RoonApiTransport],
  provided_services: [svc_status],
});

svc_status.set_status("All is good", false);

module.exports = { roon };
