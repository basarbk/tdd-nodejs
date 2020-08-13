'use strict';

module.exports = {
  // eslint-disable-next-line no-unused-vars
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const constraints = await queryInterface.getForeignKeysForTables(['fileAttachments']);
      for (let i = 0; i < constraints.fileAttachments.length; i++) {
        const constraintName = constraints.fileAttachments[i];
        if (constraintName.includes('hoaxId')) {
          await queryInterface.removeConstraint('fileAttachments', constraintName, { transaction });
        }
      }
      await queryInterface.addConstraint('fileAttachments', {
        fields: ['hoaxId'],
        type: 'foreign key',
        references: {
          table: 'hoaxes',
          field: 'id',
        },
        onDelete: 'cascade',
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
    }
  },

  // eslint-disable-next-line no-unused-vars
  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      const constraints = await queryInterface.getForeignKeysForTables(['fileAttachments']);
      for (let i = 0; i < constraints.fileAttachments.length; i++) {
        const constraintName = constraints.fileAttachments[i];
        if (constraintName.includes('hoaxId')) {
          await queryInterface.removeConstraint('fileAttachments', constraintName, { transaction });
        }
      }
      await queryInterface.addConstraint('fileAttachments', {
        fields: ['hoaxId'],
        type: 'foreign key',
        references: {
          table: 'hoaxes',
          field: 'id',
        },
        transaction,
      });
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
    }
  },
};
