module.exports = (sequelize, DataTypes) => {
    const UserPreference = sequelize.define('UserPreference', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            allowNull: false,
            primaryKey: true
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        preferred_genre_id: {
            type: DataTypes.UUID,
            allowNull: true
        },
        preferred_language: {
            type: DataTypes.STRING(10),
            allowNull: true
        },
        min_rating: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        max_runtime: {
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
        tableName: 'UserPreference',
        timestamps: true
    });

    UserPreference.prototype.getData = function() {
        return {
            id: this.id,
            user_id: this.user_id,
            preferred_genre_id: this.preferred_genre_id,
            preferred_language: this.preferred_language,
            min_rating: this.min_rating,
            max_runtime: this.max_runtime,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    };

    return UserPreference;
};
