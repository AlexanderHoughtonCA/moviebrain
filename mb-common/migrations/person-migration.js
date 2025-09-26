'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Person', {
            id: {
                type: Sequelize.UUID,
                defaultValue: Sequelize.UUIDV4,
                allowNull: false,
                primaryKey: true
            },
            tmdb_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                unique: true
            },
            imdb_id: {
                type: Sequelize.STRING(15),
                allowNull: true,
                unique: true
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            role: {
                type: Sequelize.ENUM('Actor','Director','Producer','Writer','Artist','Sound','Costume & Makeup','Crew'),
                allowNull: false
            },
            popularity: {
                type: Sequelize.FLOAT,
                allowNull: true
            },
            profile_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            profile_th_url: {
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
        await queryInterface.dropTable('Person');
    }
};
