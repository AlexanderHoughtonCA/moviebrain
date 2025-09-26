const Errors = require('./Errors.js');
const Logger = require('./Logger.js');

class ErrorHandler
{
    constructor(){
        this.logger = Logger;
    }

    handle = (res, error)=>{
        if (!error.statusCode && error.response?.status) {
            error.statusCode = error.response.status;
        }

        switch(error.statusCode){
            case(Errors.HTTP_BAD_REQUEST.code):
                this.sendBadRequest(res, error);
            break;

            case(Errors.HTTP_UNAUTHORIZED.code):
                this.sendUnauthorized(res, error);
            break;

            case(Errors.HTTP_FORBIDDEN.code):
                this.sendForbidden(res, error);
            break;

            case(Errors.HTTP_NOT_FOUND.code):
                this.sendNotFound(res, error);
            break;

            case(Errors.HTTP_INTERNAL_SERVER_ERROR.code):
                this.sendInternalServerError(res, error);
            break
            
            default:
                this.sendInternalServerError(res, error);
            break;
        }
    }

    sendBadRequest = (res, error, errorMsg)=>{
        this.handleError(res, Errors.HTTP_BAD_REQUEST, error, errorMsg);
    }

    sendUnauthorized = (res, error, errorMsg)=>{
        this.handleError(res, Errors.HTTP_UNAUTHORIZED, error, errorMsg);
    }

    sendForbidden = (res, error, errorMsg)=>{
        this.handleError(res, Errors.HTTP_FORBIDDEN, error, errorMsg);
    }

    sendNotFound = (res, error, errorMsg)=>{
        this.handleError(res, Errors.HTTP_NOT_FOUND, error, errorMsg);
    }

    sendInternalServerError = (res, error, errorMsg)=>{
        this.handleError(res, Errors.HTTP_INTERNAL_SERVER_ERROR, error, errorMsg);
    }

    handleError = (res, errorType, error, errorMsg)=>{
        var sendErrorMessage = errorMsg;
        if(sendErrorMessage == null){
            sendErrorMessage = error.message;
            if(sendErrorMessage == null){
                sendErrorMessage = errorType.defaultMessage;
            }
        }
        
        var errorObj = {code: errorType.code, message: sendErrorMessage, callstack: error.stack};
        if((errorMsg == null) && (sendErrorMessage != errorType.defaultMessage)){
            errorObj.errorType = errorType.defaultMessage;
        }

        this.logger.error("ERROR: ", errorObj.message);
        this.logger.error("Call stack: \n", error.stack);
        
        var sendErrorObj = {code: errorType.code, message: sendErrorMessage};
        if((errorMsg == null) && (sendErrorMessage != errorType.defaultMessage)){
            sendErrorObj.errorType = errorType.defaultMessage;
        }

        if(res){
            return res.status(sendErrorObj.code).send({
                code: errorType.code,
                message: sendErrorMessage
            });
        }
    }
};

module.exports = ErrorHandler;