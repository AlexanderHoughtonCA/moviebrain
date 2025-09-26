require('module-alias/register');
require('dotenv').config();

const ErrorHandler = require('common/ErrorHandler.js');
const error_handler = new ErrorHandler();

const express = require('express');
const body_parser = require('body-parser');

const RequestValidator = require("common/RequestValidator");
const request_validator = new RequestValidator();

const api_keys = require('common/controllers/db-controllers/DB_ApiKeyController');

const MovieDBDataController = require('./controllers/MovieDBDataController');
const movie_db_data_controller = new MovieDBDataController();

const app = express();
const port = process.env.PORT || 4774;

app.use(body_parser.json());

const check_api_key = async(req, res, next)=>{
    return await api_keys.check_header_api_key("mb-movie-db", req, res, next);
}

// Find movie by title
app.post('/movie_by_title',
        check_api_key,
        request_validator.validate_search, 
        async(req, res, next) => {
    try {
        const {search, page, per_page} = req.body;

        console.log("/movie_by_title - search: ", search);

        const movies = await movie_db_data_controller.find_movie_by_title(search, page, per_page);
        res.json(movies);
    }
    catch(error) {
        next(error);
    }
});

// Find movie by id
app.get('/movie/:id', 
        check_api_key,
        request_validator.validate_id,
        async(req, res, next) => {
    try {
        const movie = await movie_db_data_controller.find_movie_by_id(req.params.id);
        res.json(movie);
    }
    catch(error){
        next(error);
    }
});

// List movies
app.get('/movies', check_api_key, async(req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const movies = await movie_db_data_controller.list_movies(limit, offset);
        res.json(movies);
    }
    catch(error){ 
       next(error);
    }
});

// Create movie
app.post('/movie', check_api_key, async(req, res, next) => {
    try {
        const created = await movie_db_data_controller.create_movie(req.body);
        res.json(created);
    }
    catch(error){ 
       next(error);
    }
});

// Update movie
app.put('/movie/:id', 
    check_api_key,
    request_validator.validate_id,
    async(req, res, next) => {
    try {
        const updated = await movie_db_data_controller.update_movie(req.params.id, req.body);
        res.json(updated);
    }
    catch(error) {next(error);}
});

// Delete movie
app.delete('/movie/:id', 
    check_api_key,
    request_validator.validate_id,
    async(req, res, next) => {
    try {
        const deleted = await movie_db_data_controller.delete_movie(req.params.id);
        res.json({ deleted });
    }
    catch(error){ 
       next(error);
    }
});


// Find person by id
app.get('/person/:id', 
    check_api_key,
    request_validator.validate_id,
    async(req, res, next) => {
    try {
        const person_id = req.params.id;       
        const person = await movie_db_data_controller.get_person_by_id(person_id);
        res.json(person);
    }
    catch(error){ 
       next(error);
    }
});

// Find credits by person
app.get('/person/credits/:id', 
    check_api_key,
    request_validator.validate_id,
    async(req, res, next) => {
    try {
        const person_id = req.params.id;
        const person = await movie_db_data_controller.get_person_credits(person_id);

        res.json(person);
    }
    catch(error){ 
       next(error);
    }
});


// Find cast by movie id
app.get('/cast/:id', 
    check_api_key,
    request_validator.validate_id,
    async(req, res, next) => {
    try {
        const movie_id = req.params.id;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const cast = await movie_db_data_controller.get_cast_by_movie_id(movie_id, offset, limit);

        res.json(cast);
    }
    catch(error){
        next(error);
    }
});

app.get('/crew/:id', 
    check_api_key,
    request_validator.validate_id,
    async(req, res, next) => {
    try {
        const movie_id = req.params.id;
        const offset = parseInt(req.query.offset) || 0;
        const limit = parseInt(req.query.limit) || 50;

        const crew = await movie_db_data_controller.get_crew_by_movie_id(movie_id, offset, limit);
        res.json(crew);
    }
    catch(error){
        next(error);
    }
});

app.get('/also_liked/:id', 
    check_api_key,
    request_validator.validate_id,
    async(req, res, next) => {
    try {
        const movie_id = req.params.id;
        const limit = parseInt(req.query.limit) || 10;        
        const also_liked = await movie_db_data_controller.get_people_also_liked(movie_id, limit);
        res.json(also_liked);
    }
    catch(error){
        next(error);
    }
});

app.get('/get-hero-banner', check_api_key, async(req, res, next) => {
    try {       
        const movie = await movie_db_data_controller.get_random_movie_with_backdrop();
        if(movie != null){
            res.json({movie_id: movie.id, banner: movie.backdrop_url});
        }
        else{
            const error_msg = "/get-hero-banner - ERROR: No suitable movie found!";
            console.log(error_msg);
            res.json({error: error_msg});
        }
    }
    catch(error){
        next(error);
    }
});

app.get('/popular', check_api_key, async(req, res, next) => {
    try {
        const popular = await movie_db_data_controller.get_popular_movies();
        if(popular != null){
            res.json(popular);
        }
        else{
            const error_msg = "/popular - ERROR: No suitable movie found!";
            console.log(error_msg);
            res.json({error: error_msg});
        }
    }
    catch(error){
        next(error);
    }
});

// Error handler middleware Has to go last
app.use((err, req, res, next) => {
    error_handler.handle(res, err);
});

app.listen(port, () => {
    console.log(`mb-movie-db service running on port ${port}`);
});







