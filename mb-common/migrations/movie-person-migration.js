'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('MoviePerson', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            movie_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Movie',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            person_id: {
                type: Sequelize.UUID,
                allowNull: false,
                references: {
                    model: 'Person',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            job: {
                type: Sequelize.STRING,
                allowNull: true
            },
            character: {
                type: Sequelize.STRING,
                allowNull: true
            },
            credit_id: {
                type: Sequelize.STRING,
                allowNull: true
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('MoviePerson');
    }
};
