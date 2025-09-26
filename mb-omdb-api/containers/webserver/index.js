require('module-alias/register');

const ErrorHandler = require('common/ErrorHandler.js');
const error_handler = new ErrorHandler();

const express = require('express');
const axios = require('axios');
const body_parser = require('body-parser');
const db = require('common/models');

const api_keys = require('common/controllers/db-controllers/DB_ApiKeyController');

const Constants = require('./Constants.js');

const app = express();
const port = process.env.PORT || 4775;

app.use(body_parser.json());

// Enforce api key checking
app.use(async(req, res, next) => {
    await api_keys.check_header_api_key("mb-omdb-api", req, res, next)
})

const omdb_base_url = 'https://www.omdbapi.com/';
const omdb_api_key = Constants.OMDB_API_KEY;

async function omdb_get(params = {}) {
    const response = await axios.get(omdb_base_url, {
        params: { apikey: omdb_api_key, ...params }
    });

    if((response != null) && (response.data != null)){
        return response.data;
    }
    return {error: "no data"};
}


// Search movies/series/episodes by title
app.get('/search', async(req, res, next) => {
    try {
        const query = req.query.q;
        const type = req.query.type ? req.query.type : "movie";
        const year = req.query.year ? req.query.year : "";
        const page = req.query.page ? req.query.year : "";
        const params = { s: query, type, y: year, page };

        const response = await omdb_get(params);
        res.json(response);
    }
    catch(error) {
        next(error);
    }
});

// Get details by IMDb ID
app.get('/movie/:id', async(req, res, next) => {
    try {
        const plot = req.query.plot || 'full';
        const type = req.query.type;
        const tomatoes = req.query.tomatoes;

        const response = await omdb_get({ i: req.params.id, plot, type, tomatoes });
        res.json(response.data);
    }
    catch(error) {
        next(error);
    }
});

// Get details by title
app.get('/movie/title/:title', async(req, res, next) => {
    try {
        const plot = req.query.plot || 'full';
        const type = req.query.type;
        const year = req.query.year;
        const tomatoes = req.query.tomatoes;

        const response = await omdb_get({ t: req.params.title, plot, type, y: year, tomatoes });
        res.json(response.data);
    }
    catch(error) {
        next(error);
    }
});

// Get season details (for series)
app.get('/series/:id/season/:season', async(req, res, next) => {
    try {
        const response = await omdb_get({ i: req.params.id, season: req.params.season });
        res.json(response.data);
    }
    catch(error) {
        next(error);
    }
});

// Get specific episode details (for series)
app.get('/series/:id/season/:season/episode/:episode', async(req, res, next) => {
    try {
        const response = await omdb_get({ 
            i: req.params.id, 
            season: req.params.season, 
            episode: req.params.episode 
        });
        res.json(response.data);
    }
    catch(error) {
        next(error);
    }
});

// "Popular movies" approximation using OMDb (sort by imdbVotes)
app.get('/movies/popular', async(req, res, next) => {
    try {
        const searchResponse = await omdb_get({ s: 'the', type: 'movie', page: 1 });
        if (!searchResponse.data.Search) {
            return res.json({ results: [] });
        }

        const detailed = await Promise.all(
            searchResponse.data.Search.map(item => omdb_get({ i: item.imdbID }))
        );

        const sorted = detailed
            .map(r => r.data)
            .filter(m => m.imdbVotes && m.imdbVotes !== 'N/A')
            .sort((a, b) => {
                const votesA = parseInt((a.imdbVotes || '0').replace(/,/g, ''));
                const votesB = parseInt((b.imdbVotes || '0').replace(/,/g, ''));
                return votesB - votesA;
            });

        res.json({ results: sorted });
    }
    catch(error) {
        next(error);
    }
});

// "Top rated movies" approximation using OMDb (sort by imdbRating)
app.get('/movies/top_rated', async(req, res, next) => {
    try {
        const searchResponse = await omdb_get({ s: 'the', type: 'movie', page: 1 });
        if (!searchResponse.data.Search) {
            return res.json({ results: [] });
        }

        const detailed = await Promise.all(
            searchResponse.data.Search.map(item => omdb_get({ i: item.imdbID }))
        );

        const sorted = detailed
            .map(r => r.data)
            .filter(m => m.imdbRating && m.imdbRating !== 'N/A')
            .sort((a, b) => parseFloat(b.imdbRating) - parseFloat(a.imdbRating));

        res.json({ results: sorted });
    }
    catch(error) {
        next(error);
    }
});

// OMDb cannot provide upcoming or now_playing movies, return 501
app.get('/movies/upcoming', (req, res, next) => {
    res.status(501).json({ error: "Not implemented in OMDb API" });
});

app.get('/movies/now_playing', (req, res, next) => {
    res.status(501).json({ error: "Not implemented in OMDb API" });
});

app.use((err, req, res, next) => {
    error_handler.handle(res, err);
});

app.listen(port, () => {
    console.log(`mb-omdb-api service running on port ${port}`);
});

