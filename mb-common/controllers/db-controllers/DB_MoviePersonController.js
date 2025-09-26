const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const DBModelController = require('common/controllers/db-controllers/DB_ModelController');

const ErrorHandler = require('common/ErrorHandler.js');
const Errors = require('common/Errors.js');

const { v4: uuidv4 } = require('uuid');
const error_handler
 = new ErrorHandler();

class DB_MoviePersonController extends DBModelController {
    constructor(db) {
        super(db.movie_people);
    }
   
    getData = async(id)=> {
        const result = await this.find_model_by_id(id);
        if(result != null) {
            return result;
        }
        return null;
    };
}

module.exports = DB_MoviePersonController;
