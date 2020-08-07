'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: async (queryInterface, Sequelize) => {
    const hash = await bcrypt.hash('P4ssword', 10);
    const users = [];
    for (let i = 0; i < 25; i++) {
      users.push({
        username: `user${i + 1}`,
        email: `user${i + 1}@mail.com`,
        inactive: false,
        password: hash,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    await queryInterface.bulkInsert('users', users, {});
  },

  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkdDelete('users', null, {});
  },
};
