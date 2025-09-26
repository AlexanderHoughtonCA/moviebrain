module.exports = (sequelize, DataTypes) => {
    const ApiCache = sequelize.define('ApiCache', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        source: {
            type: DataTypes.ENUM('TMDB', 'OMDB'),
            allowNull: false
        },
        external_id: {
            type: DataTypes.STRING,
            allowNull: false
        },
        response: {
            type: DataTypes.JSON,
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
        tableName: 'ApiCache',
        timestamps: true
    });

    ApiCache.prototype.getData = function() {
        return {
            id: this.id,
            source: this.source,
            external_id: this.external_id,
            response: this.response,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    };

    return ApiCache;
};
