const Hoax = require('./Hoax');
const User = require('../user/User');

const save = async (body, user) => {
  const hoax = {
    content: body.content,
    timestamp: Date.now(),
    userId: user.id,
  };
  await Hoax.create(hoax);
};

const getHoaxes = async (page, size) => {
  const hoaxesWithCount = await Hoax.findAndCountAll({
    attributes: ['id', 'content', 'timestamp'],
    include: {
      model: User,
      as: 'user',
      attributes: ['id', 'username', 'email', 'image'],
    },
    order: [['id', 'DESC']],
    limit: size,
    offset: page * size,
  });
  return {
    content: hoaxesWithCount.rows,
    page,
    size,
    totalPages: Math.ceil(hoaxesWithCount.count / size),
  };
};

module.exports = { save, getHoaxes };
