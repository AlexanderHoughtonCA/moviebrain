const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const DBModelController = require('common/controllers/db-controllers/DB_ModelController');

const ErrorHandler = require('common/ErrorHandler.js');
// const Errors = require('common/Errors.js');

const { v4: uuidv4 } = require('uuid');
const error_handler = new ErrorHandler();

class DB_MovieController extends DBModelController {
    constructor(db) {
        super(db.movies);
    }

    getData = async(id)=> {
        const result = await this.get_model(id);
        if(result != null) {
            return result;
        }
        return null;
    };
}

module.exports = DB_MovieController;
