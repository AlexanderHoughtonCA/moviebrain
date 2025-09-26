require('module-alias/register');

const express = require('express');
const axios = require('axios');
const body_parser = require('body-parser');
const db = require('common/models');

const api_keys = require('common/controllers/db-controllers/DB_ApiKeyController');

const ErrorHandler = require('common/ErrorHandler.js');
const error_handler = new ErrorHandler();

const Constants = require('./Constants.js');

const app = express();
const port = process.env.PORT || 4776;

app.use(body_parser.json());

const tmdb_base_url = 'https://api.themoviedb.org/3';
const tmdb_api_key = Constants.TMDB_API_KEY;

// Fetches from themoviedb.org
function tmdb_get(path, extra_params = {}) {
    const url = `${tmdb_base_url}${path}`;
    return axios.get(url, {
        params: { api_key: tmdb_api_key, ...extra_params }
    });
}

// Enforce api key checking
app.use(async(req, res, next) => {
    await api_keys.check_header_api_key("mb-tmdb-api", req, res, next)
})

// Movie details by ID
app.get('/movie/:id', async(req, res, next) => {
    try {
        const url = `/movie/${req.params.id}`;
        const response = await tmdb_get(url);
        res.json(response.data);
    }
    catch(error) {
        next(error);
    }
});

// Search movies by query
app.get('/search', async(req, res, next) => {
    try {
        const query = req.query.q;
        const response = await tmdb_get('/search/movie', { query });
        res.json(response.data);
    }
    catch(error) {
        next(error);
    }
});

// Popular movies
app.get('/movies/popular', async(req, res, next) => {
    try {
        const response = await tmdb_get('/movie/popular');
        res.json(response.data);
    }
    catch(error) {
        next(error);
    }
});

// Top rated movies
app.get('/movies/top_rated', async(req, res, next) => {
    try {
        const response = await tmdb_get('/movie/top_rated');
        res.json(response.data);
    }
    catch(error) {
        next(error);
    }
});

// Upcoming movies
app.get('/movies/upcoming', async(req, res, next) => {
    try {
        const response = await tmdb_get('/movie/upcoming');
        res.json(response.data);
    }
    catch(error) {
        next(error);
    }
});

// Now playing movies
app.get('/movies/now_playing', async(req, res, next) => {
    try {
        const response = await tmdb_get('/movie/now_playing');
        res.json(response.data);
    }
    catch(error) {
        next(error);
    }
});

// Person details by ID
app.get('/person/:id', async(req, res, next) => {
    try {
        const response = await tmdb_get(`/person/${req.params.id}`);
        res.json(response.data);
    }
    catch(error) {
        next(error);
    }
});

// Get movie credits (cast/crew) for a person
app.get('/person/:id/credits', async(req, res, next) => {
    try {
        const response = await tmdb_get(`/person/${req.params.id}/credits`);        
        res.json(response.data);
    }
    catch(error) {
        next(error);
    }
});

// Get movie credits (cast/crew)
app.get('/movie/:id/credits', async(req, res, next) => {
    try {
        const response = await tmdb_get(`/movie/${req.params.id}/credits`);
        res.json(response.data);
    }
    catch(error) {
        next(error);
    }
});

// Get recommendations for a movie
app.get('/movie/:id/recommendations', async(req, res, next) => {
    try {
        const response = await tmdb_get(`/movie/${req.params.id}/recommendations`);
        res.json(response.data);
    }
    catch(error) {
        next(error);
    }
});

// Get similar movies
app.get('/movie/:id/similar', async(req, res, next) => {
    try {
        const response = await tmdb_get(`/movie/${req.params.id}/similar`);
        res.json(response.data);
    }
    catch(error) {
        next(error);
    }
});

app.use((err, req, res, next) => {
    error_handler.handle(res, err);
});

app.listen(port, () => {
    console.log(`mb-tmdb-api service running on port ${port}`);
});
