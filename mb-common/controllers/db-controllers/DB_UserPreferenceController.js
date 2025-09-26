const Sequelize = require('sequelize');
const Op = Sequelize.Op;

const DBModelController = require('common/controllers/db-controllers/DB_ModelController.js');

const ErrorHandler = require('common/ErrorHandler.js');
const Errors = require('common/Errors.js');

const { v4: uuidv4 } = require('uuid');
const errorHandler = new ErrorHandler();

class DB_UserPreferenceController extends DBModelController {
    constructor(db) {
        super(db.user_preferences);
    }

    create_user_preference = async(data, res, on_success, on_error)=> {
        try {
            if(data == null) {
                const error = 'create_user_preference - Error: data is null';
                console.log(error);
                if(on_error != null) on_error(error);
                return;
            }

            const saved_preference = await this.db_type.create(data);

            if(on_success != null) on_success(saved_preference);
            if(res != null) res.send(saved_preference.dataValues);
        }
        catch(error) {
            const error_msg = 'create_user_preference - Error creating preference: ' + error;
            console.log(error_msg);
            if(on_error != null) on_error(error_msg);
            if(res != null) errorHandler.handle(res, error);
        }
    };

    get_preference_by_id = async(id, res, on_success, on_error)=> {
        try {
            const preference = await this.get_model2(id);

            if(preference) {
                if(on_success != null) on_success(preference);
                if(res != null) res.send(preference.dataValues);
            }
            else {
                const error = 'Preference not found';
                console.log('get_preference_by_id -', error);
                if(on_error != null) on_error(error);
            }
        }
        catch(error) {
            console.log('get_preference_by_id - error:', error);
            if(on_error != null) on_error(error);
            if(res != null) errorHandler.handle(res, error);
        }
    };

    delete_preference = async(id, res, on_success, on_error)=> {
        try {
            const deleted = await this.delete_model_by_id(id);

            if(deleted) {
                if(on_success != null) on_success(deleted);
                if(res != null) res.send({ message: 'Preference deleted successfully' });
            }
            else {
                const error = 'Preference not found';
                console.log('delete_preference -', error);
                if(on_error != null) on_error(error);
            }
        }
        catch(error) {
            console.log('delete_preference - error:', error);
            if(on_error != null) on_error(error);
            if(res != null) errorHandler.handle(res, error);
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

module.exports = DB_UserPreferenceController;