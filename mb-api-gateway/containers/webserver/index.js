require('module-alias/register');
require('dotenv').config();

const ErrorHandler = require('common/ErrorHandler.js');
const error_handler = new ErrorHandler();

const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4770;

var cors = require('cors');

const allowed_origins = [
  'http://localhost:3997',
  'http://192.168.0.2:3997',
  'https://project_tld',
  'https://www.project_tld'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowed_origins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Preflight handler
app.options('*', (req, res) => {
  if (req.headers.origin && allowed_origins.includes(req.headers.origin)) {
    res.header("Access-Control-Allow-Origin", req.headers.origin);
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Credentials", "true");
    return res.sendStatus(204);
  } else {
    return res.sendStatus(403);
  }
});

// Middleware to parse incoming JSON
app.use(express.json());
app.use(express.urlencoded({limit: '2mb', extended: true}));

// Placeholder URLs for microservices
const services = {
    authentication: 'https://auth.project_tld',
    movie_db: 'https://db.project_tld'

    // recommendations: 'http://localhost:4001', // Node.js service
    // reviews: 'http://localhost:4002', // Placeholder for future TypeScript service
    // suggester: 'http://mb-suggester.default.svc.cluster.local:4777', // Java Spring Boot service, put this in Nginx config?
    // suggester: 'http://mb-suggester:4777', // Java Spring Boot service    
    // preferences: 'http://localhost:4773', //  Node.js service
};

// Helper functions
movie_db_post = async(endpoint, body)=>{
    const headers = {"mb-movie-db": process.env.MB_MOVIE_DB_API_KEY};
    const response = await axios.post(services.movie_db + endpoint, body, {headers});
    return response
}

movie_db_get = async(endpoint, req, res)=>{
    const headers = {"mb-movie-db": process.env.MB_MOVIE_DB_API_KEY}
    const response = await axios.get(services.movie_db + endpoint, {headers});
    return response
}

// ----------------------
// AUTH MIDDLEWARE
// ----------------------
async function authenticate(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(401).json({ error: 'Missing Authorization header' });
    }

    try {
        const response = await axios.post(services.authentication + '/auth/verify', { token });
        if (response.data && response.data.valid) {
            req.user = response.data.decoded;
            return next();
        } else {
            return res.status(401).json({ error: 'Invalid token' });
        }
    } catch (error) {
        console.error('Auth verify failed:', error.message);
        return next(error);
    }
}

// Route: User registration
app.post('/api/auth/register', async(req, res, next) => {
    try {
        const response = await axios.post(services.authentication + '/register', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error registering user:', error.message);
        next(error);
    }
});

// Route: User login
app.post('/api/auth/login', async(req, res, next) => {
    try {
        const response = await axios.post(services.authentication + '/login', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error logging in:', error.message);
        next(error);
    }
});

// Route: Get movie recommendations
app.get('/api/recommendations', async(req, res, next) => {
    try {
        const response = await movie_db_get(services.recommendations + '/recommend', { params: req.query });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching recommendations:', error.message);
        next(error);
    }
});

// Route: Get user reviews (public for now)
app.get('/api/reviews', async(req, res, next) => {
    try {
        const response = await movie_db_get(services.reviews + '/reviews');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching reviews:', error.message);
        next(error);
    }
});

// Route: Submit user review (protected)
app.post('/api/reviews', authenticate, async(req, res, next) => {
    try {
        const response = await movie_db_post(services.reviews + '/reviews', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error submitting review:', error.message);
        next(error);
    }
});

// Route: search for a movie
app.post('/api/movie_by_title', async(req, res, next) => {
    try {
        const response = await movie_db_post('/movie_by_title', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching movie by title:', error.message);
        next(error);
    }
});

app.get('/api/movie/:id', async(req, res, next) => {
    try {
        const response = await movie_db_get('/movie/' + req.params.id);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching movie:', error.message);
        next(error);
    }
});

app.get('/api/person/:id', async(req, res, next) => {
    try {
        const response = await movie_db_get('/person/' + req.params.id);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching person:', error.message);
        next(error);
    }
});

app.get('/api/person/credits/:id', async(req, res, next) => {
    try {
        const person_id = req.params.id;
        const response = await movie_db_get('/person/credits/' + person_id);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching person:', error.message);
        next(error);
    }
});

// req.params.id is the movie id
app.get('/api/movie/cast/:id', async(req, res, next) => {
    try {
        const movie_id = req.params.id;
        const page = req.query.page;
        const per_page = req.query.per_page;

        const limit = per_page;
        const offset = page * per_page;
        const url =  '/cast/'+movie_id 
                                      + "?limit="+limit
                                      + "&offset="+offset;
        const response = await movie_db_get(url);

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching cast:', error.message);
        next(error);
    }
});

app.get('/api/movie/crew/:id', async(req, res, next) => {
    try {
        const movie_id = req.params.id;
        const page = req.query.page;
        const per_page = req.query.per_page;

        const limit = per_page;
        const offset = page * per_page;
        const url = '/crew/'+movie_id 
                                      + "?offset="+offset
                                      + "&limit="+limit;
        const response = await movie_db_get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching crew:', error.message);
        next(error);
    }
});

app.get('/api/movie/also_liked/:id', async(req, res, next) => {
    try {
        const movie_id = req.params.id;
        const limit = req.query.limit;
        const url = '/also_liked/' + movie_id + "?limit=" + limit;
        const response = await movie_db_get(url);

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching crew:', error.message);
        next(error);
    }
});

app.get('/api/movies/popular', async(req, res, next) => {
    try {
        const response = await movie_db_get('/popular');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching movie:', error.message);
        next(error);
    }
});

app.get('/api/movies/recommended', async(req, res, next) => {
    try {
        const response = await movie_db_get('/popular');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching movie:', error.message);
        next(error);
    }
});

app.get('/api/genres', async(req, res, next) => {
    try {
        // const response = await movie_db_get('/genres');
        // res.json(response.data);        
        res.json([]);
    } catch (error) {
        console.error('Error fetching movie:', error.message);
        next(error);
    }
});

// Route: Fetch detailed movie data
app.get('/api/api/movie-data', async(req, res, next) => {
    try {
        const response = await movie_db_get(services.data_fetcher + '/movie-data', { params: req.query });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching movie data:', error.message);
        next(error);
    }
});

// Route: Get user preferences (public test stub)
app.get('/api/api/preferences', authenticate, async(req, res, next) => {
    next(error);
});

// Route: Save user preferences (protected)
app.post('/api/preferences', authenticate, async(req, res, next) => {
    try {
        const response = await movie_db_post(services.preferences + '/preferences', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error saving preferences:', error.message);
        next(error);
    }
});

// Route: Get hero banner for top of 
app.get('/api/get-hero-banner', async(req, res, next) => {
    try {
        const response = await movie_db_get('/get-hero-banner/');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching movie:', error.message);
        next(error);
    }
});


// if(process.env.NODE_ENV === 'production')
{
    // Serve static assets, if in production
    app.use(express.static('./client/build'));

    app.get('*', (req, res) =>{
        res.sendFile(path.resolve(__dirname, './client', 'build', 'index.html'));
    });
}


app.use((err, req, res, next) => {
    error_handler.handle(res, err);
});

// Start the API Gateway
app.listen(PORT, () => console.log(`API Gateway running on port ${PORT}`));
