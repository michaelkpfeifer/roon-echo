const RoonApi = require("node-roon-api");
const RoonApiStatus = require("node-roon-api-status");
const RoonApiTransport = require("node-roon-api-transport");

var roon = new RoonApi({
  extension_id: "com.roon-remote.test",
  display_name: "Roon Web Remote Extension",
  display_version: "0.0.0",
  publisher: "Michael Pfeifer",
  email: "michael.k.pfeifer@googlemail.com",
  website: "https://github.com/michaelkpfeifer",

  core_paired: function (core) {
    let transport = core.services.RoonApiTransport;
    transport.subscribe_zones(function (cmd, data) {
      console.log(
        core.core_id,
        core.display_name,
        core.display_version,
        "-",
        cmd,
        JSON.stringify(data, null, "  "),
      );
    });
  },

  core_unpaired: function (core) {
    console.log(
      core.core_id,
      core.display_name,
      core.display_version,
      "-",
      "LOST",
    );
  },
});

var svc_status = new RoonApiStatus(roon);

roon.init_services({
  required_services: [RoonApiTransport],
  provided_services: [svc_status],
});

svc_status.set_status("All is good", false);

roon.start_discovery();
