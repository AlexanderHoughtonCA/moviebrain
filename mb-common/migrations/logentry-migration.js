'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LogEntry', {
      id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('(UUID())'),
          allowNull: false,
          primaryKey: true
      },
      level: {
        type: Sequelize.STRING
      },
      meta: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.TEXT
      },     
      timestamp:
      {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('LogEntry');
  }
};