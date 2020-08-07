const Hoax = require('./Hoax');

const save = async (body) => {
  const hoax = {
    content: body.content,
    timestamp: Date.now(),
  };
  await Hoax.create(hoax);
};

module.exports = { save };
