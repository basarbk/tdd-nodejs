const Sequelize = require('sequelize');
const sequelize = require('../config/database');

const Model = Sequelize.Model;

class Token extends Model {}

Token.init(
  {
    token: {
      type: Sequelize.STRING,
    },
  },
  {
    sequelize,
    modelName: 'token',
  }
);

module.exports = Token;
