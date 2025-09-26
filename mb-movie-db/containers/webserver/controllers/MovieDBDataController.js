require('module-alias/register');
require('dotenv').config();

const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const axios = require('axios');

const Utils = require('common/Utils.js');
const Logger = require('common/Logger.js');
const Constants = require('../Constants.js');

// DB setup
const db = require('common/models');

console.log("db.movies: ", db.movies);

const Movie = require('common/models/movie-model');
const BaseController = require('common/controllers/BaseController');

const DB_MovieController = require('common/controllers/db-controllers/DB_MovieController');
const DB_GenreController = require('common/controllers/db-controllers/DB_GenreController');
const DB_MovieGenreController = require('common/controllers/db-controllers/DB_MovieGenreController');
const DB_PersonController = require('common/controllers/db-controllers/DB_PersonController');
const DB_MoviePersonController = require('common/controllers/db-controllers/DB_MoviePersonController');
const DB_UserPreferenceController = require('common/controllers/db-controllers/DB_UserPreferenceController');
const DB_RatingController = require('common/controllers/db-controllers/DB_RatingController');
const DB_ApiCacheController = require('common/controllers/db-controllers/DB_ApiCacheController');

// Instantiate controllers
const movie_controller = new DB_MovieController(db);
const genre_controller = new DB_GenreController(db);
const movie_genre_controller = new DB_MovieGenreController(db);
const person_controller = new DB_PersonController(db);
const movie_person_controller = new DB_MoviePersonController(db);
const user_preference_controller = new DB_UserPreferenceController(db);
const rating_controller = new DB_RatingController(db);
const api_cache_controller = new DB_ApiCacheController(db);

class MovieDBDataController extends BaseController{
    constructor(){
        super("MovieDBDataController");

        this.log_info("constructor", "started!");
    }

    find_movie_by_title = async(title, page=0, per_page=10)=>{
        var movies = await movie_controller.get_all_like("title", title, page, per_page);

        const tmdb_movies = await this.tmdb_find_movies(title, true);
        if(tmdb_movies != null){
            movies = await movie_controller.get_all_like("title", title, page, per_page);
            movies.sort((a, b)=> a.release_date - b.release_date );

            for(const movie of movies){
                if((movie.poster_url == null) || 
                   (movie.poster_th_url == null) || 
                   (movie.backdrop_url == null) || 
                   (movie.overview == null)){
                    for(const tmdb_movie of tmdb_movies){
                        if(tmdb_movie.id == movie.tmdb_id){
                            await this.update_movie_from_tmdb(movie, tmdb_movie);
                            break;
                        }
                    }
                }
            }
        }

        // const omdb_movies = await this.omdb_find_movies(title, true);
        if(movies != null){
            // const genres = await this.get_movie_genres(movie);
            // console.log("genres: ", genres);

            // const movies = await this.get_movies_by_genre('romance');
            // console.log("\n");
            // for(var i=0; i < movies.length; ++i){
            //     console.log("movie: ", movies[i].title);
            // }
        }
        return movies;
    }
    
    find_movie_by_id = async(id)=> {
        const movie = await movie_controller.get_model(id);
        if(movie != null){
            if((movie.poster_url == null) || 
               (movie.poster_th_url == null) || 
               (movie.backdrop_url == null) || 
               (movie.overview == null)){
                
                if(movie.tmdb_id != null){
                    const tmdb_movie = await this.tmdb_get('/movie/' + movie.tmdb_id);
                    if(tmdb_movie != null){
                        await this.update_movie_from_tmdb(movie, tmdb_movie);
                    }
                }
            }
        }
        return movie;
    };

    tmdb_get = async(endpoint, params=null)=>{
        try{
            const url = Constants.MB_TMDB_API_URL + endpoint;
            const headers = {"mb-tmdb-api": process.env.MB_TMDB_API_KEY}

            const response = await axios.get(url, { headers, params });
            if(response != null){
                return response.data;
            }
            return null;
        }
        catch(error){
            this.handle_error("tmdb_get" + " - " + endpoint, null, error);
            throw new Error(error);
        }
    }

    list_movies = async(limit = 50, offset = 0)=> {
        return await movie_controller.find_all({ limit, offset });
    };

    create_movie = async(data)=> {
        return await movie_controller.create_model(data);
    };

    update_movie = async(id, data)=> {
        return await movie_controller.update_model(id, data);
    };

    delete_movie = async(id)=> {
        return await movie_controller.delete_model_by_id(id);
    };

    _find_movie_using_apis = async()=>{

    }

    omdb_find_movie = async(title, add_if_missing)=>{
        const search_result = await this.omdb_get('/search?q='+title);
        if(search_result != null){
            // console.log("MovieDBDataController.omdb_find_movie - search_result: ", search_result);
        }
        else{
            return null;
        }

        const search = search_result.Search;
        if(search != null){
            var omdb_movie = null;
            for(var i=0; i < search.length; ++i){
                const movie = search[i];
                const movie_title = movie.Title.toLowerCase().trim();

                if(movie_title == title){
                    omdb_movie = movie;
                    break;
                }
            }

            if(add_if_missing && (omdb_movie != null)){
                return await this.add_movie_from_omdb(omdb_movie);
            }
        }
        return {};
    }

    omdb_find_movies = async(title, add_if_missing)=>{
        const search_result = await this.omdb_get('/search?q='+title);        
        if(search_result != null){
            // console.log("MovieDBDataController.omdb_find_movie - search_result: ", search_result);
        }
        else{
            return null;
        }

        var movies = [];
        const search = search_result.Search;
        if(search != null){
            await Promise.all(
                search.map(async(movie)=>{
                    const movie_title = movie.Title.toLowerCase().trim();
                    if(movie_title.indexOf(title) != -1){
                        movies.push(movie);
                    }

                    if(add_if_missing){
                        await this.add_movie_from_omdb(movie);
                    }
                })
            );
        }
        return movies;
    }

    add_movie_from_omdb = async(omdb_movie)=>{
        if(omdb_movie.Title != null){
            const movie = {
                title: omdb_movie.Title,
                release_date: Utils.date_from_year(omdb_movie.Year),
                imdb_id: omdb_movie.imdbID,
                poster_url: omdb_movie.Poster
            };

            let existing = await movie_controller.get_model_where({ imdb_id: omdb_movie.imdbID });
            if(existing){
                return existing.dataValues ? existing.dataValues : existing;
            }

            const created_movie = await this.create_movie(movie);
            if(created_movie != null){
                return created_movie.dataValues;
            }
            return null;
        }
        else{
            this.log_error("add_movie_from_omdb", "OMDB movie has no title");
        }
    }

    get_movie_genres = async(movie)=>{
        const movie_genres = await movie_genre_controller.get_all_where({movie_id: movie.id});

        const genres = [];
        await Promise.all(
            movie_genres.map(async(movie_genre)=>{
                const genre = await genre_controller.get_model(movie_genre.genre_id);
                if(genre){
                    genres.push(genre);
                }
            })
        );
        return genres;
    }

    get_movies_by_genre = async(genre_name, start_page=0, per_page=10)=>{
        const movies = [];
        const genre = await genre_controller.get_model_where({name: genre_name});
        if(genre != null){
            const where = {genre_id: genre.id};
            const movie_genres = await movie_genre_controller.get_all_where(where, null, start_page, per_page);
            if(movie_genres != null){
                await Promise.all(
                    movie_genres.map(async(movie_genre)=>{
                        const movie = await movie_controller.get_model(movie_genre.movie_id);
                        if(movie){
                            movies.push(movie);
                        }
                    })
                );
            }
        }        
        return movies;
    }

    omdb_get = async(endpoint, params=null)=>{
        try{
            const url = Constants.MB_OMDB_API_URL + endpoint;
            const headers = {"mb-omdb-api": process.env.MB_OMDB_API_KEY}
            
            const response = await axios.get(url, { params, headers });
            if(response != null){
                return response.data;
            }
            return null;
        }
        catch(error){
            this.log_error("omdb_get", error.message);
        }
    }

    tmdb_find_keyword = async(keyword)=>{
        const keyword_results = await this.tmdb_get('/search/keyword?query='+keyword);
        return keyword_results;
    }

    tmdb_find_movies = async(title, add_if_missing)=>{
        if(title == null){
            return;
        }

        this.tmdb_movie_cache = [];

        title = title.trim();
        title = title.toLowerCase();

        const search_results = await this.tmdb_get('/search?q='+title);
        if(search_results != null){
            // console.log("MovieDBDataController.tmdb_find_movie - search_result: ", search_results);
        }
        else{
            console.log("MovieDBDataController.tmdb_find_movie - search_result is NULL!!!");
            return null;
        }

        var tmdb_movies = [];
        const results = search_results.results;
        if(results != null){
            for(var i=0; i < results.length; ++i){
                const tmdb_movie = results[i];
                const movie_title = tmdb_movie.title.toLowerCase().trim();
                const movie_original_title = tmdb_movie.original_title.toLowerCase().trim();

                if(add_if_missing){
                    var db_movie = await movie_controller.get_model_where({tmdb_id: tmdb_movie.id});
                    if(db_movie == null){
                        await this.add_movie_from_tmdb(tmdb_movie);
                    }
                }

                this.tmdb_movie_cache[tmdb_movie.id] = tmdb_movie;
                tmdb_movies.push(tmdb_movie);
            }
        }
        return tmdb_movies;
    }

    tmdb_find_movie = async(title, add_if_missing)=>{
        title = title.trim();
        title = title.toLowerCase();

        const search_result = await this.tmdb_get('/search?q='+title);        
        if(search_result != null){
            // console.log("MovieDBDataController.tmdb_find_movie - search_result: ", search_result);
        }
        else{
            return null;
        }

        const results = search_result.results;
        if(results != null){
            var tmdb_movie = null;
            for(var i=0; i < results.length; ++i){
                const movie = results[i];

                const movie_title = movie.title.toLowerCase().trim();
                const movie_original_title = movie.original_title.toLowerCase().trim();
                if((movie_title.indexOf(title) != -1) || 
                   (movie_original_title.indexOf(title) != -1)){
                    tmdb_movie = movie;
                    break;
                }
            }

            if(tmdb_movie != null){
                if(add_if_missing){
                    var db_movie = await movie_controller.get_model_where({tmdb_id: tmdb_movie.id});
                    if(db_movie == null){
                        return await this.add_movie_from_tmdb(tmdb_movie);
                    }
                }
                return tmdb_movie;
            }            
        }
        return null;
    }

    add_movie_from_tmdb = async(tmdb_movie)=>{
        try{
            if(tmdb_movie.title != null){
                var existing_movie= await movie_controller.get_model_where({ tmdb_id: tmdb_movie.id });
                if(existing_movie){
                    if((existing_movie.overview == null) || 
                       (existing_movie.poster_url == null) || 
                       (existing_movie.poster_th_url == null)){
                        // If the overview is missing, the rest likely
                        // is too...
                        // const found_tmdb_movie = await this.tmdb_find_movie(tmdb_movie.title, false);
                        await this.update_movie_from_tmdb(existing_movie, tmdb_movie);
                    }

                    existing_movie = await movie_controller.get_model_where({ tmdb_id: tmdb_movie.id });
                    return existing_movie;
                }

                const release_date = ((tmdb_movie.release_date!=null) && (tmdb_movie.release_date.length>0)) 
                                        ? tmdb_movie.release_date : null;

                var poster_url = null;
                var poster_th_url = null;
                if((tmdb_movie.poster_path != null) && (tmdb_movie.poster_path.indexOf('null') == -1)){
                    poster_url = Constants.TMDB_POSTER_URL + tmdb_movie.poster_path;
                    poster_th_url = Constants.TMDB_POSTER_THUMB_URL + tmdb_movie.poster_path;
                }

                var backdrop_url = null;
                var backdrop_th_url = null;
                if((tmdb_movie.backdrop_path != null) && (tmdb_movie.backdrop_path.indexOf('null') == -1)){
                    backdrop_url = Constants.TMDB_BACKDROP_URL + tmdb_movie.backdrop_path;
                }

                var movie = {
                    title: tmdb_movie.title,
                    original_title: tmdb_movie.original_title,
                    tmdb_id: tmdb_movie.id,
                    imdb_id: tmdb_movie.imdbID,
                    popularity: tmdb_movie.popularity,
                    overview: tmdb_movie.overview,
                    vote_average: tmdb_movie.vote_average,
                    vote_count: tmdb_movie.vote_count,
                    language: tmdb_movie.original_language,
                    poster_url,
                    poster_th_url,
                    backdrop_url
                };

                if(release_date != null){
                    movie.release_date = new Date(tmdb_movie.release_date);
                }

                const created_movie = await this.create_movie(movie);
                if(created_movie != null){
                    return created_movie.dataValues;
                }
            }
            else{
                this.log_error("add_movie_from_tmdb", "TMDB movie has no title");
            }
        }
        catch(error){
            console.log("add_movie_from_tmdb - ERROR: ", error);
        }
    }

    update_movie_from_tmdb = async(movie, tmdb_movie)=>{
        if(tmdb_movie != null){
            movie.original_title = tmdb_movie.original_title;
            
            if((tmdb_movie.release_date != null) && (tmdb_movie.release_date.length > 0)){
                movie.release_date = new Date(tmdb_movie.release_date);
            }

            movie.overview = tmdb_movie.overview;
            movie.vote_average = tmdb_movie.vote_average;
            movie.vote_count = tmdb_movie.vote_count;
            movie.language = tmdb_movie.original_language;
            movie.poster_url = (tmdb_movie.poster_path != null) ? Constants.TMDB_POSTER_URL + tmdb_movie.poster_path : null,
            movie.poster_th_url = (tmdb_movie.poster_path != null) ? Constants.TMDB_POSTER_THUMB_URL + tmdb_movie.poster_path : null,
            movie.backdrop_url = (tmdb_movie.backdrop_path != null) ? Constants.TMDB_BACKDROP_URL + tmdb_movie.backdrop_path : null

            await this.update_movie(movie.id, movie);
        }
    }

    // TODO: Update for crew credits
    get_person_credits = async(person_id)=>{
        const person = await person_controller.get_model(person_id);
        if(!person) {
            return null;
        }

        const tmdb_credits = await this.tmdb_get('/person/' + person.tmdb_id + '/credits');

        var cast_credits = [];
        for(var credit of tmdb_credits.cast){
            var db_movie = await movie_controller.get_model_where({tmdb_id: credit.id});
            if(db_movie){
                var poster_url = null;
                var poster_th_url = null;
                if((credit.poster_path != null) && (credit.poster_path.indexOf('null') == -1)){
                    poster_url = Constants.TMDB_POSTER_URL + credit.poster_path;
                    poster_th_url = Constants.TMDB_POSTER_THUMB_URL + credit.poster_path;
                }
                

                if(poster_url){
                    const credit_data = {
                        id: db_movie.id,
                        title: db_movie.title,
                        poster_url,
                        poster_th_url,
                        job: credit.job,
                        character: credit.character,                        
                        release_date: new Date(credit.release_date)
                    };

                    cast_credits.push(credit_data);
                }
            }
        }

        cast_credits.sort((a, b)=> b.release_date - a.release_date );
        return cast_credits;
    }

    get_person_by_id = async(person_id) => {
        try {
            let person = await person_controller.get_model(person_id);
            if(!person) {
                return null;
            }

            const tmdb_person = await this.tmdb_get('/person/' + person.tmdb_id);

            var biography = 'No biography available.';
            if(tmdb_person){
                biography = tmdb_person.biography;
            }           

            person.biography = biography;
            person = person.dataValues ? person.dataValues : person;
            return person;
        } catch(error) {
            this.log_error("get_person_by_id", error.message);
            return null;
        }
    };

    get_person_movies = async(person_id) => {
        try {
            const movie_person_links = await movie_person_controller.get_all_where({ person_id });
            const filmography = [];

            await Promise.all(
                movie_person_links.map(async(link) => {
                    const movie = await movie_controller.get_model(link.movie_id);
                    if(movie) {
                        const movie_data = movie.dataValues ? movie.dataValues : movie;
                        movie_data.character = link.character;
                        movie_data.job = link.job;
                        movie_data.credit_id = link.credit_id;
                        filmography.push(movie_data);
                    }
                })
            );

            return filmography;
        } catch(error) {
            this.log_error("get_person_movies", error.message);
            return [];
        }
    };

    get_person = async(person, movie_id)=>{
        if(person != null){
            var role = 'Crew';
            if(person.known_for_department == 'Acting'){
                role = 'Actor';
            }
            else
            if(person.known_for_department == 'Directing'){
                role = 'Director';
            }
            else
            if(person.known_for_department == 'Costume & Makeup'){
                role = 'Costume & Makeup';
            }
            else
            if(person.known_for_department == 'Writing'){
                role = 'Writer';
            }
            else
            if(person.known_for_department == 'Production'){
                role = 'Producer';
            }
            else
            if(person.known_for_departmente == 'Art'){
                role = 'Artist';
            }
            else
            if(person.known_for_department == 'Sound'){
                role = 'Sound';
            }

            var movie_person;
            var found_person = await person_controller.get_model_where({tmdb_id: person.id});
            if(found_person == null){
                const person_data = {
                    tmdb_id: person.id,
                    name: person.name,
                    popularity: person.popularity,
                    profile_url: (person.profile_path != null) ? Constants.TMDB_PROFILE_URL + person.profile_path : null,
                    profile_th_url: (person.profile_path != null) ? Constants.TMDB_PROFILE_THUMB_URL + person.profile_path : null,
                    role
                }
                found_person = await person_controller.create_model(person_data);
                if(found_person != null){
                    found_person = found_person.dataValues;
                }
                else{
                    person = {};
                }
            }

            
            if((found_person != null) && (movie_id != null)){
                movie_person = await this.get_movie_person(found_person.id, 
                                                                    movie_id, 
                                                                    person.character, 
                                                                    person.known_for_department,
                                                                    person.credit_id);
            }

            const person_data = found_person;
            if(movie_person != null){
                person_data.character = movie_person.character;
                person_data.job = movie_person.job;
                person_data.credit_id = movie_person.credit_id;
            }
            return person_data;
        }
        return null;
    }

    get_movie_person = async(person_id, movie_id, character, job, credit_id)=>{
        var movie_person = await movie_person_controller.get_model_where({person_id, movie_id});
        if(movie_person == null){
            const movie_person_data = {
                person_id,
                movie_id,
                character,
                job,
                credit_id
            }
            
            movie_person = await movie_person_controller.create_model(movie_person_data);
            movie_person = movie_person.dataValues;
        }
        return movie_person;
    }

    get_cast_by_movie_id = async(movie_id, page = 0, per_page = 10) => {
        const movie = await this.find_movie_by_id(movie_id);
        if(movie == null){
            return;
        }

        const tmdb_credits = await this.tmdb_get('/movie/' + movie.tmdb_id + '/credits');
        if(tmdb_credits == null){
            console.log("No credits found for: ", movie.title);
            return;
        }

        var cast_members = [];
        const cast = tmdb_credits.cast;

        const num_cast = (cast.length > per_page) ? per_page : cast.length;
        for(var i=0; i < num_cast; ++i){
            const cast_member = cast[i];
            const person = await this.get_person(cast_member, movie_id);
            if(person){
                cast_members.push(person);
            }
        }

        cast_members = cast_members.sort((a, b)=>{return parseFloat(b.popularity) - parseFloat(a.popularity)});
        return cast_members;
    };

    get_crew_by_movie_id = async(movie_id, page = 0, per_page = 10) => {
        const movie = await this.find_movie_by_id(movie_id);
        if(movie == null){
            return;
        }

        const tmdb_credits = await this.tmdb_get('/movie/' + movie.tmdb_id + '/credits');
        if(tmdb_credits == null){
            console.log("No credits found for: ", movie.title);
            return;
        }

        const crew_members = [];
        const found_crew = tmdb_credits.crew;
        const num_crew = (found_crew.length > per_page) ? per_page : found_crew.length;

        const seen_ids = [];

        for(let i = 0; i < num_crew; ++i){
            const crew_member = found_crew[i];

            if(seen_ids.indexOf(crew_member.id) !== -1){
                continue; // skip duplicates
            }
            seen_ids.push(crew_member.id);

            const person = await this.get_person(crew_member, movie_id);
            if(person){
                crew_members.push(person);
            }
        }

        const priority = ["Directing", "Director", "Production", "Producer", "Writing", "Writer"];
        const prioritized = [];
        const others = [];

        for(const c of crew_members){
            if(priority.includes(c.job)){
                prioritized.push(c);
            } else {
                others.push(c);
            }
        }

        prioritized.sort((a, b) => priority.indexOf(a.job) - priority.indexOf(b.job));
        others.sort((a, b) => a.job.localeCompare(b.job));

        const crew = [...prioritized, ...others];
        return crew;
    };


    get_people_also_liked = async (movie_id, limit = 10) => {
        try {
            const movie_genres = await movie_genre_controller.get_all_where({ movie_id });
            const genre_ids = movie_genres.map(mg => mg.genre_id);
            if (genre_ids.length === 0) return [];

            const related_movies = await db.movies.findAll({
            include: [{
                model: db.genres, 
                where: { id: { [Op.in]: genre_ids } },
                attributes: [],
                required: true
            }],
            where: { id: { [Op.ne]: movie_id } },
                order: db.sequelize.random(),
                distinct: true,
                subQuery: false,
                limit
            });

            for(const movie of related_movies){
                if((movie.poster_url == null) || 
                    (movie.poster_th_url == null) || 
                    (movie.backdrop_url == null) || 
                    (movie.overview == null)){
                    const tmdb_movie = await this.tmdb_get('/movie/' + movie.tmdb_id);
                    if(tmdb_movie != null){
                        await this.update_movie_from_tmdb(movie, tmdb_movie);
                    }
                }
            }
            

            return related_movies;
        } catch (error) {
            this.log_error("get_people_also_liked", error.message);
            return [];
        }
    };

    get_random_movie_with_backdrop = async() => {
        try {
            // Fetch a random movie that already has a backdrop_url
            var movie = await db.movies.findOne({
                where: {
                    backdrop_url: { [Op.ne]: null },
                    popularity: { [Op.gte]: 2 }
                },
                order: db.sequelize.random()
            });

            if(movie == null) {
                console.log("get_random_movie_with_backdrop", "No movie with backdrop_url found");
                return null;
            }

            // If the backdrop is stale/missing, refresh from TMDB
            if(movie.backdrop_url == null) {
                const tmdb_movie = await this.tmdb_get('/movie/' + movie.tmdb_id);
                if(tmdb_movie != null) {
                    await this.update_movie_from_tmdb(movie, tmdb_movie);
                    return await movie_controller.get_model(movie.id);
                }
            }

            movie = movie.dataValues;
            return movie;
        }
        catch(error) {
            this.log_error("get_random_movie_with_backdrop", error.message);
            return null;
        }
    }

    get_popular_movies = async(min_popularity = 4, limit = 12) => {
        try {
            const found_movies = await db.movies.findAll({
                where: {
                    popularity: { [Op.gte]: min_popularity },
                    poster_url: { [Op.ne]: null },
                },
                order: db.sequelize.random(),
                limit
            });

            var movies = [];
            for(const movie of found_movies){

                // This is too slow for the front page
                // TODO: Maybe spawn a separate interval to do this?
                // if((movie.poster_url == null) || 
                //     (movie.backdrop_url == null) || 
                //     (movie.overview == null)){
                //     const tmdb_movie = await this.tmdb_get('/movie/' + movie.tmdb_id);
                //     if(tmdb_movie != null){
                //         await this.update_movie_from_tmdb(movie, tmdb_movie);
                //     }
                // }

                movies.push(movie.dataValues);
            }

            // console.log("get_popular_movies - movies: ", movies);
            return movies;
        } catch(error) {
            this.log_error("get_random_popular_movies", error.message);
            return [];
        }
    }

};


module.exports = MovieDBDataController;