const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const db = require('common/models');

const DBModelController = require('common/controllers/db-controllers/DB_ModelController');

class DB_UserController extends DBModelController {
    constructor() {
        super(db.users);
    }

   
}

module.exports = DB_UserController;
