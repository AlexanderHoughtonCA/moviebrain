'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('Movie', {
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
            movielens_id: {
                type: Sequelize.INTEGER,
                allowNull: true,
                unique: true
            },
            title: {
                type: Sequelize.STRING,
                allowNull: false
            },
            original_title: {
                type: Sequelize.STRING,
                allowNull: true
            },
            release_date: {
                type: Sequelize.DATE,
                allowNull: true
            },
            runtime: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            language: {
                type: Sequelize.STRING(10),
                allowNull: true
            },
            overview: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            poster_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            poster_th_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            backdrop_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            backdrop_th_url: {
                type: Sequelize.STRING,
                allowNull: true
            },
            popularity: {
                type: Sequelize.FLOAT,
                allowNull: true
            },
            vote_average: {
                type: Sequelize.FLOAT,
                allowNull: true
            },
            vote_count: {
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
        await queryInterface.dropTable('Movie');
    }
};
