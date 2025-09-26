require('dotenv').config();

let MB_MOVIE_DB_SERVICE_NAME = 'mb-movie-db';

let OMDB_API_KEY = process.env.OMDB_API_KEY;
let MB_OMDB_API_URL = 'https://omdb.project_tld';
let MB_TMDB_API_URL = 'https://tmdb.project_tld';

let TMDB_API_KEY = process.env.TMDB_API_KEY;
let TMDB_API_URL = 'https://api.themoviedb.org/3';
let TMDB_POSTER_URL = 'https://image.tmdb.org/t/p/original';
let TMDB_BACKDROP_URL = 'https://image.tmdb.org/t/p/w1280';
let TMDB_PROFILE_URL = 'https://image.tmdb.org/t/p/w1280';

let TMDB_POSTER_THUMB_URL = 'https://image.tmdb.org/t/p/w342';
let TMDB_PROFILE_THUMB_URL = 'https://image.tmdb.org/t/p/w342';

module.exports = {
    MB_MOVIE_DB_SERVICE_NAME,
    OMDB_API_KEY,
    MB_OMDB_API_URL,
    MB_TMDB_API_URL,
    TMDB_API_KEY,
    TMDB_API_URL,
    TMDB_POSTER_URL,
    TMDB_POSTER_THUMB_URL,
    TMDB_BACKDROP_URL,
    TMDB_PROFILE_URL,
    TMDB_PROFILE_THUMB_URL
};






