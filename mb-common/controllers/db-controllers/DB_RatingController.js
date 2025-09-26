const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const DBModelController = require('common/controllers/db-controllers/DB_ModelController');

const ErrorHandler = require('common/ErrorHandler.js');
const Errors = require('common/Errors.js');

const { v4: uuidv4 } = require('uuid');
const error_handler
 = new ErrorHandler();

class DB_RatingController extends DBModelController {
    constructor(db) {
        super(db.ratings);
    }

    create_rating = async(data, res, on_success, on_error)=> {
        try {
            if(data == null) {
                const error = 'create_rating - Error: data is null';
                console.log(error);
                if(on_error != null) {
                    on_error(error);
                }
                return;
            }

            const saved_rating = await this.db_type.create(data);

            if(on_success != null) {
                on_success(saved_rating);
            }

            if(res != null) {
                res.send(saved_rating.dataValues);
            }
        }
        catch(error) {
            const error_msg = 'create_rating - Error creating rating: ' + error;
            console.log(error_msg);
            if(on_error != null) {
                on_error(error_msg);
            }

            if(res != null) {
                ErrorHandler.handle(res, error);
            }
        }
    };

    get_rating_by_id = async(id, res, on_success, on_error)=> {
        try {
            const rating = await this.get_model2(id);

            if(rating) {
                if(on_success != null) {
                    on_success(rating);
                }

                if(res != null) {
                    res.send(rating.dataValues);
                }
            }
            else {
                const error = 'Rating not found';
                console.log('get_rating_by_id -', error);
                if(on_error != null) {
                    on_error(error);
                }
            }
        }
        catch(error) {
            console.log('get_rating_by_id - error:', error);
            if(on_error != null) {
                on_error(error);
            }

            if(res != null) {
                ErrorHandler.handle(res, error);
            }
        }
    };

    delete_rating = async(id, res, on_success, on_error)=> {
        try {
            const deleted = await this.delete_model_by_id(id);

            if(deleted) {
                if(on_success != null) {
                    on_success(deleted);
                }

                if(res != null) {
                    res.send({ message: 'Rating deleted successfully' });
                }
            }
            else {
                const error = 'Rating not found';
                console.log('delete_rating -', error);
                if(on_error != null) {
                    on_error(error);
                }
            }
        }
        catch(error) {
            console.log('delete_rating - error:', error);
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

module.exports = DB_RatingController;
