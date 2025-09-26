const fs = require('fs');
const path = require('path');
const https = require('https');
const unzipper = require('unzipper');
const csv = require('csv-parser');
const { v4: uuidv4 } = require('uuid');

require('module-alias/register');
const db = require('common/models');

const api_key_controller = require('common/controllers/db-controllers/DB_ApiKeyController');

const DATASET_URL = 'https://files.grouplens.org/datasets/movielens/ml-latest-small.zip';
const ZIP_FILE = path.join(__dirname, 'ml-latest-small.zip');
const EXTRACT_DIR = path.join(__dirname, 'ml-latest-small');

async function downloadDataset() {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(ZIP_FILE);
        https.get(DATASET_URL, response => {
            response.pipe(file);
            file.on('finish', () => file.close(resolve));
        }).on('error', reject);
    });
}

async function extractDataset() {
    return fs.createReadStream(ZIP_FILE)
        .pipe(unzipper.Extract({ path: __dirname }))
        .promise();
}

async function importMoviesAndGenres() {
    return new Promise((resolve, reject) => {
        const moviesFile = path.join(EXTRACT_DIR, 'movies.csv');
        const movies = [];
        const genresMap = new Map();
        const movie_genres = [];

        fs.createReadStream(moviesFile)
            .pipe(csv())
            .on('data', (row) => {
                let title = row.title;
                let year = null;

                const match = row.title.match(/\((\d{4})\)$/);
                if (match) {
                    year = match[1];
                    title = row.title.replace(/\(\d{4}\)$/, '').trim();
                }

                const movieId = uuidv4();
                movies.push({
                    id: movieId,
                    movielens_id: row.movieId,
                    title,
                    release_date: year ? new Date(`${year}-01-01`) : null,
                    overview: null,
                    language: 'en',
                    popularity: 0 // default to 0
                });

                if (row.genres && row.genres !== '(no genres listed)') {
                    const parts = row.genres.split('|');
                    for (const g of parts) {
                        if (!genresMap.has(g)) {
                            genresMap.set(g, uuidv4());
                        }
                        movie_genres.push({
                            id: uuidv4(),
                            movie_id: movieId,
                            genre_id: genresMap.get(g)
                        });
                    }
                }
            })
            .on('end', async () => {
                try {
                    await db.movies.bulkCreate(movies, { ignoreDuplicates: true });
                    console.log(`Imported ${movies.length} movies`);

                    const genreRecords = Array.from(genresMap.entries()).map(([name, id]) => ({
                        id,
                        name
                    }));
                    await db.genres.bulkCreate(genreRecords, { ignoreDuplicates: true });
                    console.log(`Imported ${genreRecords.length} genres`);

                    await db.movie_genres.bulkCreate(movie_genres, { ignoreDuplicates: true });
                    console.log(`Linked ${movie_genres.length} movie–genre pairs`);

                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
    });
}

async function importLinks() {
    const linksFile = path.join(EXTRACT_DIR, 'links.csv');
    const updates = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(linksFile)
            .pipe(csv())
            .on('data', (row) => {
                updates.push({
                    movielens_id: row.movieId,
                    imdb_id: row.imdbId ? `tt${row.imdbId}` : null,
                    tmdb_id: row.tmdbId || null
                });
            })
            .on('end', async () => {
                try {
                    let success = 0;
                    let skipped = 0;

                    for (const row of updates) {
                        try {
                            await db.movies.update(
                                {
                                    imdb_id: row.imdb_id,
                                    tmdb_id: row.tmdb_id
                                },
                                { where: { movielens_id: row.movielens_id } }
                            );
                            success++;
                        } catch (err) {
                            if (err.name === 'SequelizeUniqueConstraintError') {
                                console.warn(`Skipping duplicate tmdb_id ${row.tmdb_id} (movielens_id ${row.movielens_id})`);
                                skipped++;
                            } else {
                                throw err;
                            }
                        }
                    }

                    console.log(`Updated ${success} movies with IMDb/TMDB IDs, skipped ${skipped} duplicates`);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
    });
}

async function importRatings() {
    const ratingsFile = path.join(EXTRACT_DIR, 'ratings.csv');
    const ratings = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(ratingsFile)
            .pipe(csv())
            .on('data', (row) => {
                ratings.push({
                    id: uuidv4(),
                    user_id: row.userId,
                    movielens_id: row.movieId,
                    score: row.rating
                });
            })
            .on('end', async () => {
                try {
                    // Insert ratings and link to movies
                    for (const rating of ratings) {
                        const movie = await db.movies.findOne({ where: { movielens_id: rating.movielens_id } });
                        if (movie) {
                            await db.ratings.create({
                                id: rating.id,
                                user_id: rating.user_id,
                                movie_id: movie.id,
                                source: 'movielens',
                                value: rating.score.toString()
                            });
                        }
                    }

                    // Bulk update popularity in one query
                    await db.sequelize.query(`
                        UPDATE Movie m
                        LEFT JOIN (
                          SELECT movie_id, COUNT(*) AS rating_count
                          FROM Rating
                          GROUP BY movie_id
                        ) r ON m.id = r.movie_id
                        SET m.popularity = COALESCE(r.rating_count, 0)
                    `);

                    console.log(`Imported ${ratings.length} ratings`);
                    console.log(`Updated popularity for all movies`);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
    });
}


async function importTags() {
    const tagsFile = path.join(EXTRACT_DIR, 'tags.csv');
    const tags = [];

    return new Promise((resolve, reject) => {
        fs.createReadStream(tagsFile)
            .pipe(csv())
            .on('data', (row) => {
                tags.push({
                    id: uuidv4(),
                    user_id: row.userId,
                    movielens_id: row.movieId,
                    tag: row.tag,
                    createdAt: new Date(parseInt(row.timestamp) * 1000),
                    updatedAt: new Date(parseInt(row.timestamp) * 1000)
                });
            })
            .on('end', async () => {
                try {
                    for (const tag of tags) {
                        const movie = await db.movies.findOne({ where: { movielens_id: tag.movielens_id } });
                        if (movie) {
                            await db.tags.create({
                                id: tag.id,
                                user_id: tag.user_id,
                                movie_id: movie.id,
                                tag: tag.tag,
                                createdAt: tag.createdAt,
                                updatedAt: tag.updatedAt
                            });
                        }
                    }
                    console.log(`Imported ${tags.length} tags`);
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
    });
}

(async () => {
    try {
        await db.sequelize.authenticate();
        console.log('DB connected.');

        if (!fs.existsSync(ZIP_FILE)) {
            console.log('Downloading dataset...');
            await downloadDataset();
            console.log('Extracting dataset...');
            await extractDataset();
        }

        await importMoviesAndGenres();
        await importLinks();
        await importRatings();
        await importTags();

        console.log('Creating ApiKeys...');
        const mb_db_key = await api_key_controller.create_api_key("mb-movie-db");
        console.log("Created API key for", "mb-movie-db", ":", mb_db_key.key);

        const tmdb_db_key = await api_key_controller.create_api_key("tmdb-movie-db");
        console.log("Created API key for", "tmdb-movie-db", ":", tmdb_db_key.key);

        const omdb_db_key = await api_key_controller.create_api_key("omdb-movie-db");
        console.log("Created API key for", "omdb-movie-db", ":", omdb_db_key.key);

        console.log('MovieLens import complete.');
        process.exit(0);
    } catch (error) {
        console.error('Error during import:', error);
        process.exit(1);
    }
})();
