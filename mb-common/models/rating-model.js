module.exports = (sequelize, DataTypes) => {
    const Rating = sequelize.define('Rating', {
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
        user_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        source: {
            type: DataTypes.STRING,
            allowNull: false
        },
        value: {
            type: DataTypes.STRING,
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
        tableName: 'Rating',
        timestamps: true
    });

    Rating.prototype.getData = function() {
        return {
            id: this.id,
            movie_id: this.movie_id,
            user_id: this.user_id,
            source: this.source,
            value: this.value,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    };

    return Rating;
};
