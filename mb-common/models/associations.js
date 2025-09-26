module.exports = (db) => {
    // Guard utility: only wire an association if both models exist
    const has = (a, b) => db[a] && db[b];

    // Movies ↔ Genres (many-to-many) via MovieGenre join table
    if (has('movies', 'genres')) {
        db.movies.belongsToMany(db.genres, {
            through: 'MovieGenre',
            foreignKey: 'movie_id',
            otherKey: 'genre_id'
        });
        db.genres.belongsToMany(db.movies, {
            through: 'MovieGenre',
            foreignKey: 'genre_id',
            otherKey: 'movie_id'
        });
    }

    // Movies ↔ People (many-to-many) via MoviePerson join table
    if (has('movies', 'people')) {
        db.movies.belongsToMany(db.people, {
            through: 'MoviePerson',
            foreignKey: 'movie_id',
            otherKey: 'person_id'
        });
        db.people.belongsToMany(db.movies, {
            through: 'MoviePerson',
            foreignKey: 'person_id',
            otherKey: 'movie_id'
        });
    }

    // Movies ↔ Tags (one-to-many)
    if (has('movies', 'tags')) {
        db.movies.hasMany(db.tags, { foreignKey: 'movie_id' });
        db.tags.belongsTo(db.movies, { foreignKey: 'movie_id' });
    }

    // Movies ↔ Ratings (one-to-many)
    if (has('movies', 'ratings')) {
        db.movies.hasMany(db.ratings, { foreignKey: 'movie_id' });
        db.ratings.belongsTo(db.movies, { foreignKey: 'movie_id' });
    }

    // Movies ↔ ApiCaches (one-to-many) using Movie.tmdb_id ↔ ApiCache.external_id
    if (has('movies', 'apicaches')) {
        db.movies.hasMany(db.apicaches, { foreignKey: 'external_id', sourceKey: 'tmdb_id' });
        db.apicaches.belongsTo(db.movies, { foreignKey: 'external_id', targetKey: 'tmdb_id' });
    }

    // UserPreferences ↔ Genres (one-to-many)
    if (has('userpreferences', 'genres')) {
        db.userpreferences.belongsTo(db.genres, { foreignKey: 'preferred_genre_id' });
        db.genres.hasMany(db.userpreferences, { foreignKey: 'preferred_genre_id' });
    }
};
