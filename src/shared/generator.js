const crypto = require('crypto');

const randomString = (length) => {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
};

module.exports = {
  randomString,
};
