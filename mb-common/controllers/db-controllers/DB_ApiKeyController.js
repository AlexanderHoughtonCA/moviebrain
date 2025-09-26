const DBModelController = require('./DB_ModelController');

const bcrypt = require('bcryptjs');
const salt_rounds = 10;

const { v4: uuidv4 } = require('uuid');

const db = require('common/models');

class DBApiKeyController extends DBModelController{
    constructor(){
        super(db.apikeys);
    }

    // Function to create a new API key entry
    create_api_key = async(name)=>{
        const raw_api_key = uuidv4();
        const data = {
            name,
            key: raw_api_key,
            hashed_key: bcrypt.hashSync(raw_api_key, salt_rounds)
        }

        const db_api_key = await this.create_model(data);
        return db_api_key;
    }

    // NOTE: Don't forget to add "apikey"
    //       to the request Access-Control-Allow-Headers request header
    //       for all  endpoints that need to use this
    check_header_api_key = async(name, req, res, next)=>{
        const api_key = req.headers[name];

        // console.log("check_header_api_key - api_key: ", api_key);

        if(api_key && api_key.length > 0) {
            const valid = await this.check_api_key(api_key);
            // console.log("check_header_api_key - valid: ", valid);

            if(valid){
                return next();
            } else {
                console.log("check_header_api_key - Access Denied for", req.url);
            }
        }
        
        return this.send_unauthorized("Access Denied", res);        
    }

    check_api_key = async(api_key)=>{
        const db_api_key = await this.get_model_where({ key: api_key });
        if(db_api_key){
            const result = await bcrypt.compare(api_key, db_api_key.hashed_key);
            return result;
        }
        return false;
    }

    async get_api_key_by_name(name, res){
        const result = await this.get_model_where({name});
        try{
            if(result){
                const data = {
                    id: result.id,
                    name: result.name,
                    hashed_key: result.hashed_key,
                    description: result.description
                };
                
                if(res != null){
                    this.send_json_response(data, res);
                }
            }
        }
        catch(error){
           this.handle_error("get_api_key", res, error);
        }
    }

    async get_api_key(id, res){
        const result = await this.get_model(id);
        try{
            if(result){
                const data = {
                    id: result.id,
                    name: result.name,
                    hashed_key: result.hashed_key,
                    description: result.description
                };
                
                if(res != null){
                    this.send_json_response(data, res);
                }
            }
        }
        catch(error){
           this.handle_error("get_api_key", res, error);
        }
    }

    // Function to delete an API key
    delete_api_key = async(id, res)=>{
        await this.delete_model_by_id(id, res);    
    }
}

module.exports = new DBApiKeyController;
