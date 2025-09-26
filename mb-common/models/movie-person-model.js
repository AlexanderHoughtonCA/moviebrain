module.exports = (sequelize, DataTypes) => {
    const MoviePerson = sequelize.define('MoviePerson', {
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
        person_id: {
            type: DataTypes.UUID,
            allowNull: false
        },
        job: {
            type: DataTypes.STRING,
            allowNull: true
        },
        character: {
            type: DataTypes.STRING,
            allowNull: true
        },
        credit_id: {
            type: DataTypes.STRING,
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
        tableName: 'MoviePerson',
        timestamps: true
    });

    MoviePerson.prototype.getData = function() {
        return {
            id: this.id,
            movie_id: this.movie_id,
            person_id: this.person_id,
            job: this.job,
            character: this.character,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    };

    return MoviePerson;
};
