module.exports = (sequelize, DataTypes) => {
    const Tag = sequelize.define('Tag', {
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
        tag: {
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
        tableName: 'Tag',
        timestamps: true
    });

    Tag.prototype.getData = function() {
        return {
            id: this.id,
            movie_id: this.movie_id,
            user_id: this.user_id,
            tag: this.tag,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    };

    return Tag;
};
