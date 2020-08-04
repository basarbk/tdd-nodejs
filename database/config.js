const profiles = require('../config');

const dbConfigs = {};

Object.keys(profiles).forEach((profile) => {
  dbConfigs[profile] = { ...profiles[profile].database };
});
module.exports = dbConfigs;
