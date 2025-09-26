const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const DBModelController = require('common/controllers/db-controllers/DB_ModelController');

const ErrorHandler = require('common/ErrorHandler.js');
const Errors = require('common/Errors.js');

const { v4: uuidv4 } = require('uuid');
const error_handler
 = new ErrorHandler();

class DB_ApiCacheController extends DBModelController {
    constructor(db) {
        super(db.api_caches);
    }

    create_api_cache = async(data, res, on_success, on_error)=> {
        try {
            if(data == null) {
                const error = 'create_api_cache - Error: data is null';
                console.log(error);
                if(on_error != null) {
                    on_error(error);
                }
                return;
            }

            const saved_cache = await this.db_type.create(data);

            if(on_success != null) {
                on_success(saved_cache);
            }

            if(res != null) {
                res.send(saved_cache.dataValues);
            }
        }
        catch(error) {
            const error_msg = 'create_api_cache - Error creating api cache: ' + error;
            console.log(error_msg);
            if(on_error != null) {
                on_error(error_msg);
            }

            if(res != null) {
                ErrorHandler.handle(res, error);
            }
        }
    };

    get_api_cache_by_id = async(id, res, on_success, on_error)=> {
        try {
            const cache = await this.get_model2(id);

            if(cache) {
                if(on_success != null) {
                    on_success(cache);
                }

                if(res != null) {
                    res.send(cache.dataValues);
                }
            }
            else {
                const error = 'ApiCache not found';
                console.log('get_api_cache_by_id -', error);
                if(on_error != null) {
                    on_error(error);
                }
            }
        }
        catch(error) {
            console.log('get_api_cache_by_id - error:', error);
            if(on_error != null) {
                on_error(error);
            }

            if(res != null) {
                ErrorHandler.handle(res, error);
            }
        }
    };

    delete_api_cache = async(id, res, on_success, on_error)=> {
        try {
            const deleted = await this.delete_model_by_id(id);

            if(deleted) {
                if(on_success != null) {
                    on_success(deleted);
                }

                if(res != null) {
                    res.send({ message: 'ApiCache deleted successfully' });
                }
            }
            else {
                const error = 'ApiCache not found';
                console.log('delete_api_cache -', error);
                if(on_error != null) {
                    on_error(error);
                }
            }
        }
        catch(error) {
            console.log('delete_api_cache - error:', error);
            if(on_error != null) {
                on_error(error);
            }

            if(res != null) {
                ErrorHandler.handle(res, error);
            }
        }
    };

    getData = async(id)=> {
        const result = await this.find_model_by_id(id);
        if(result != null) {
            return result;
        }
        return null;
    };
}

module.exports = DB_ApiCacheController;
