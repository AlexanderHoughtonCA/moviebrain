module.exports = (sequelize, DataTypes) => {
    const Person = sequelize.define('Person', {
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
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: {
            type: DataTypes.ENUM('Actor','Director','Producer','Writer','Artist','Sound','Costume & Makeup','Crew'),
            allowNull: false
        },
        popularity: {
            type: DataTypes.FLOAT,
            allowNull: true
        },
        profile_url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        profile_th_url: {
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
        tableName: 'Person',
        timestamps: true
    });

    Person.prototype.getData = function() {
        return {
            id: this.id,
            tmdb_id: this.tmdb_id,
            imdb_id: this.imdb_id,
            name: this.name,
            role: this.role,
            profile_url: this.profile_url,
            profile_th_url: this.profile_th_url,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    };

    return Person;
};
