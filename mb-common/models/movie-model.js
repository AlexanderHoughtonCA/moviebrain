module.exports = (sequelize, DataTypes) => {
    const Movie = sequelize.define('Movie', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        tmdb_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: true
        },
        imdb_id: {
            type: DataTypes.STRING(15),
            allowNull: true,
            unique: true
        },
        movielens_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            unique: true
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        original_title: {
            type: DataTypes.STRING,
            allowNull: true
        },
        release_date: {
            type: DataTypes.DATE,
            allowNull: true
        },
        runtime: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        language: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        overview: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        poster_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        poster_th_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        backdrop_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        backdrop_th_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        popularity: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        vote_average: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        vote_count: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'Movie',
        timestamps: true
    });

    Movie.prototype.getData = function() {
        return {
            id: this.id,
            tmdb_id: this.tmdb_id,
            imdb_id: this.imdb_id,
            title: this.title,
            original_title: this.original_title,
            release_date: this.release_date,
            runtime: this.runtime,
            language: this.language,
            overview: this.overview,
            poster_url: this.poster_url,
            poster_th_url: this.poster_th_url,
            backdrop_url: this.backdrop_url,
            popularity: this.popularity,
            vote_average: this.vote_average,
            vote_count: this.vote_count,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    };

    return Movie;
};
