const Sequelize = require('sequelize');

const sequelize = new Sequelize('hoaxify', 'my-db-user', 'db-p4ss', {
  dialect: 'sqlite',
  storage: './database.sqlite',
  logging: false,
});

module.exports = sequelize;
