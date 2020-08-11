'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('fileAttachments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      filename: {
        type: Sequelize.STRING,
      },
      uploadDate: {
        type: Sequelize.DATE,
      },
      fileType: {
        type: Sequelize.STRING,
      },
      hoaxId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'hoaxes',
          key: 'id',
        },
      },
    });
  },

  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('fileAttachments');
  },
};
