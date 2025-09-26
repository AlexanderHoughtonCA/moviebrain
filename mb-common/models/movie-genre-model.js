module.exports = (sequelize, DataTypes) => {
    const MovieGenre = sequelize.define('MovieGenre', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        movie_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        genre_id: {
            type: DataTypes.UUID,
            allowNull: false
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
        tableName: 'MovieGenre',
        timestamps: true
    });

    MovieGenre.prototype.getData = function() {
        return {
            id: this.id,
            movie_id: this.movie_id,
            genre_id: this.genre_id,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    };

    return MovieGenre;
};
