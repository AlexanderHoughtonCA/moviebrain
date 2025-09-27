# MovieBrain

MovieBrain is a test project designed for experimenting with microservices architecture.
It integrates multiple data sources (TMDB, OMDB, MovieLens) and provides a set of backend services that can be deployed together under Kubernetes.

## Features

- **JWT token authentication** - Keeping things simple for now, proper email registration and password reset coming soon.
- **API Keys** – Most microservices have internal API key protection via Express middleware
- **Username, Password and search validation** - Via Express middleware
- **Movie Database Service** – stores movies, cast and crew and database import script
- **TMDB Service** – fetches movie and person data from The Movie Database API, cached in local DB
- **OMDB Service** – supplements movie metadata from the Open Movie Database API, cached in local DB
- **Common Module** – shared Sequelize models, migrations, and utilities  
- **Kubernetes Ready** – each service has a `deploy/` folder with manifests for K8S and build scripts to build the Docker images

## Architecture

Each microservice runs independently and is orchestrated together in Kubernetes for production.
The project has been deployed on a bare-metal Kubernetes cluster with the MetalLB load balancer for IP address
assignment.  
Kubernetes deployment files are available in each service's deploy folder.  
Replace `docker_private_registry_url` in the deployment files with your private docker registry or Docker Hub url.

The services are:

### mb-common
Not a runnable service, but shared Sequelize models, migrations, and utilities  

### mb-api-gateway
Express-based API gateway used by the movie brain website.

### mb-authentication
Used by mb-api-gateway for username and password authentication via JWT tokens.

### mb-movie-db
Core movie database microservice (includes import scripts), used by api gateway.

### mb-tmdb-api
TMDB API microservice - Used by mb-movie-db to download movie data from themoviedb.org when needed.  
The user will need to specify a key from TMDB and replace the value for TMDB_API_KEY in:  
mb-tmdb-api/containers/webserver/.env 
TMDB api keys can be obtained at:
https://www.themoviedb.org/

### mb-omdb-api
OMDB API microservice - used as a fallback when data cannot be found with TMDB.  
The user will need to specify a key from OMDB and replace the value for OMDB_API_KEY in:  
mb-omdb-api/containers/webserver/.env
OMDB api keys can be obtained at:
https://www.omdbapi.com/

All services other than mb-common, have two main folders:  
**containers/** - package.json, index.js, Dockerfile and Docker image build script  
**deploy/** - Kubernetes deployment scripts


## Tech Stack

- **Backend:** Node.js, Express, Sequelize, MySQL
- **Infrastructure:** Docker, Kubernetes, Ingress  
- **External APIs:** TMDB, OMDB  

## Setup Instructions

### Clone the Repository
```
git clone git@github.com:AlexanderHoughtonCA/moviebrain.git
cd moviebrain
```

### Install Dependencies
Each microservice has its own `package.json`. From the service folder:
```
npm install
```

### Environment Variables
- `mb-tmdb-api/.env` → must contain a valid TMDB API key (`TMDB_API_KEY`).  
- `mb-omdb-api/.env` → must contain a valid OMDB API key (`OMDB_API_KEY`).  
- `mb-movie-db` import scripts generate temporary keys `MB_TMDB_API_KEY` and `MB_OMDB_API_KEY` for internal use.  (See below)

Each service also requires database connection details for Sequelize, see config folder in the relevant services
and enter values for DB_USER, DB_HOST, DB_PORT etc.  
While the microservices should strictly speaking have their own databases, to keep things simple, they all use the same DB.
See db-common for Sequelize models and migrations.

### Data import & Movie Brain Api Key Generation
The following script will import data from Movie Lens and create API keys for mb-movie-db, mb-tmdb-api and mb-omdb-api.  
**The import script may take a while, please be patient, it will indicate completion with: 'MovieLens import complete.'**  

1. Navigate to mb-movie-db/containers/webserver/
2. chmod a+x ./import-movielens.js
3. ./import-movielens.js
4. Copy and paste mb-movie-db api key into MB_MOVIE_DB_API_KEY in mb-api-gateway/containers/webserver/.env
5. Copy and paste mb-tmdb-api api key into MB_TMDB_API_KEY in mb-movie-db/containers/webserver/.env
6. Copy and paste mb-omdb-api api key into MB_OMDB_API_KEY in mb-movie-db/containers/webserver/.env

### MySQL DB Sequelize Migration
Assuming the DB has been created, run the Sequelize migrations as follows:

1. Navigate to mb-movie-db/containers/webserver/
2. chmod a+x ./migrate-db.sh
3. ./migrate-db.sh


### Run Locally
Start each microservice individually, in a separate terminal or tab, from its containers/webserver folder:
```
node ./index.js
```


### Kubernetes Deployment
For each service, build the docker image by running the build script, e.g.  
mb-movie-db/containers/webserver/build-mb-movie-db.sh

Each microservice includes a `deploy/` folder containing manifests. Apply them per service:
```
kubectl apply -f mb-api-gateway/deploy/
kubectl apply -f mb-authentication/deploy/
...
```

## Usage

- API Gateway runs on port **4770** (configurable).  
- Endpoints provide movie search, person data, authentication.  

Example endpoints:
- `GET /movie_by_title?title=Inception`  
- `GET /person/:id`  
- `POST /auth/login`  

## Notes

- This repository contains **backend services only**. The React frontend is maintained in a separate repository.  
- MovieBrain is primarily for **testing and experimentation** with a microservices architecture.

## License

MovieBrain is released under the MIT License. See the [LICENSE](LICENSE) file for details.
