'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('UserPreference', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.UUID,
                allowNull: false
            },
            preferred_genre_id: {
                type: Sequelize.UUID,
                allowNull: true,
                references: {
                    model: 'Genre',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            preferred_language: {
                type: Sequelize.STRING(10),
                allowNull: true
            },
            min_rating: {
                type: Sequelize.FLOAT,
                allowNull: true
            },
            max_runtime: {
                type: Sequelize.INTEGER,
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
        await queryInterface.dropTable('UserPreference');
    }
};
