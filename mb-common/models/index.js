'use strict';

require('dotenv').config();

const env = process.env.NODE_ENV;
// console.log("moviebrain_models - env: ", env);

const db = {};

const Sequelize = require('sequelize');
// console.log("process.env: ", process.env);

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false
    }
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

const ApiKey = require('./apikey-model.js');
db.apikeys = ApiKey(db.sequelize, Sequelize);

const User = require('./user-model.js');
db.users = User(db.sequelize, Sequelize);

const Movie = require('./movie-model.js');
db.movies = Movie(db.sequelize, Sequelize);

const Tag = require('./tag-model.js');
db.tags = Tag(db.sequelize, Sequelize);

const Person = require('./person-model.js');
db.people = Person(db.sequelize, Sequelize);

const MoviePerson = require('./movie-person-model.js');
db.movie_people = MoviePerson(db.sequelize, Sequelize);

const Genre = require('./genre-model.js');
db.genres = Genre(db.sequelize, Sequelize);

const MovieGenre = require('./movie-genre-model.js');
db.movie_genres = MovieGenre(db.sequelize, Sequelize);

const Rating = require('./rating-model.js');
db.ratings = Rating(db.sequelize, Sequelize);

const UserPreference = require('./user-preference-model.js');
db.user_preferences = UserPreference(db.sequelize, Sequelize);

const ApiCache = require('./api-cache-model.js');
db.api_caches = ApiCache(db.sequelize, Sequelize);


db.movies.belongsToMany(db.people, { 
  through: db.movie_people, 
  foreignKey: 'movie_id', 
  otherKey: 'person_id' 
});

db.people.belongsToMany(db.movies, { 
  through: db.movie_people, 
  foreignKey: 'person_id', 
  otherKey: 'movie_id' 
});

db.movies.belongsToMany(db.genres, { 
  through: db.movie_genres, 
  foreignKey: 'movie_id', 
  otherKey: 'genre_id' 
});

db.genres.belongsToMany(db.movies, { 
  through: db.movie_genres, 
  foreignKey: 'genre_id', 
  otherKey: 'movie_id' 
});

db.movies.hasMany(db.ratings, { foreignKey: 'movie_id' });
db.ratings.belongsTo(db.movies, { foreignKey: 'movie_id' });

db.user_preferences.belongsTo(db.people, { foreignKey: 'person_id' });
db.people.hasMany(db.user_preferences, { foreignKey: 'person_id' });

// console.log("db: ", Object.keys(db));

module.exports = db;

