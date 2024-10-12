var RoonApi = require("node-roon-api");

var roon = new RoonApi({
  extension_id:        'com.roon-remote.test',
  display_name:        "Roon Web Remote Extension",
  display_version:     "0.0.0",
  publisher:           'Michael Pfeifer',
  email:               'michael.k.pfeifer@googlemail.com',
  website:             'https://github.com/michaelkpfeifer'
});

roon.init_services({});

roon.start_discovery();

module.exports = roon;
