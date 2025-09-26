const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const DBModelController = require('common/controllers/db-controllers/DB_ModelController');

const ErrorHandler = require('common/ErrorHandler.js');
const Errors = require('common/Errors.js');

const { v4: uuidv4 } = require('uuid');
const error_handler
 = new ErrorHandler();

class DB_PersonController extends DBModelController {
    constructor(db) {
        super(db.people);
    }
}

module.exports = DB_PersonController;
