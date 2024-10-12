const RoonApi = require("node-roon-api");
const RoonApiStatus = require("node-roon-api-status");

const roon = new RoonApi({
  extension_id: "com.roon-remote.test",
  display_name: "Roon Web Remote Extension",
  display_version: "0.0.0",
  publisher: "Michael Pfeifer",
  email: "michael.k.pfeifer@googlemail.com",
  website: "https://github.com/michaelkpfeifer",
});

const svc_status = new RoonApiStatus(roon);

roon.init_services({
  provided_services: [svc_status],
});

svc_status.set_status("All is good", false);

roon.start_discovery();

module.exports = roon;
