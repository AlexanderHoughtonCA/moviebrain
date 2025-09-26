const Logger = require('common/Logger.js');


const ErrorHandler = require('common/ErrorHandler.js');
const Errors = require('common/Errors.js');

class BaseController{
    constructor(name){
        this.name = name;
        this.logger = Logger;
        this.error_handler = new ErrorHandler();
    }

    handle_error = (fn, res, error)=>{
        this.log_error(fn, error.message);
        this.error_handler.handle(res, error);
    }

    log = (fn, msg)=>{
        this.log_info(this.name, "." + fn + " - " + msg);
    }

    log_debug = (fn, msg)=>{
        this.logger.debug(this.name, "." + fn + " - " + msg);
    }

    log_info = (fn, msg)=>{
        this.logger.info(this.name, "." +fn + " - " + msg);
    }

    log_warn = (fn, msg)=>{
        this.logger.warn(this.name, "." +fn + " - " + msg);
    }

    log_error = (fn, msg)=>{
        this.logger.error(this.name, "." + fn + " - " + msg);
    }

    send_response = (msg, res, context)=>{
        try{
            if(context){
                console.log("send_response - context: ", context);
            }

            if(res){
                if(msg != null){
                    console.log("send_response - res sending: ", msg);
                    res.send(msg);
                }
            }
        }
        catch(error){
            this.send_error(Errors.HTTP_INTERNAL_SERVER_ERROR.code, this.name + ".send_response - ERROR: " + error, res);
        }
    }

    send_json_response(obj, res, context){
        try{
            if(context != null){
                console.log("send_json_response - context: ", context);
            }

            if(res != null){
                if(obj != null){
                    // console.log(this.name + ".send_json_response - sending obj: ", obj);
                    res.json(obj);
                }
                else
                {
                    console.log(this.name + ".send_json_response - obj is NULL!");
                }
            }
            else{
                console.log(this.name + ".send_json_response - res is NULL!");
            }
        }
        catch(error){
            this.send_error(Errors.HTTP_INTERNAL_SERVER_ERROR.code, this.name + ".send_response - ERROR: " + error, res);
        }
    }

    send_error(error_code, msg, res, context){
        try{
            if(context != null){
                console.log("send_error - context: ", context);
            }

            this.logger.error(this.name, " - " + msg);
            
            if(res != null){
                console.log(this.name + ".send_error - res sending: ", msg);
                res.status(error_code).send({ message: msg });
            }
        }
        catch(error)
        {
            console.log(this.name + ".send_error - msg: ", msg);
            console.log(this.name + ".send_error - ERROR, COULD NOT SEND ERROR: ", error);
        }
    }

    send_bad_request(msg, res, context){
        this.send_error(Errors.HTTP_BAD_REQUEST.code, msg, res, context);
    }

    send_unauthorized(msg, res, context){
        this.send_error(Errors.HTTP_UNAUTHORIZED.code, msg, res, context);
    }

    send_forbidden(msg, res, context){
        this.send_error(Errors.HTTP_FORBIDDEN.code, msg, res, context);
    }

    send_not_found(msg, res, context){
        this.send_error(Errors.HTTP_NOT_FOUND.code, msg, res, context);
    }

    send_internal_server_error(msg, res, context){
        this.send_error(Errors.HTTP_INTERNAL_SERVER_ERROR.code, msg, res, context);
    }

}

module.exports = BaseController;