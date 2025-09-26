
const HTTP_BAD_REQUEST = {code: 400, defaultMessage: "Bad Request"};
const HTTP_UNAUTHORIZED =  {code: 401, defaultMessage: "Unauthorized"};
const HTTP_PAYMENT_REQUIRED =  {code: 402, defaultMessage: "Payment Required"};
const HTTP_FORBIDDEN =  {code: 403, defaultMessage: "Forbidden"};
const HTTP_NOT_FOUND =  {code: 404, defaultMessage: "Not Found"};
const HTTP_INTERNAL_SERVER_ERROR =  {code: 500, defaultMessage: "Internal Server Error"};

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        Error.captureStackTrace(this, this.constructor);
    }
}

class BadRequestError extends AppError {
    constructor(message = HTTP_BAD_REQUEST.defaultMessage) {
        super(message, HTTP_BAD_REQUEST.code);
    }
}

class UnauthorizedError extends AppError {
    constructor(message = HTTP_UNAUTHORIZED.defaultMessage) {
        super(message, HTTP_UNAUTHORIZED.code);
    }
}

class ForbiddenError extends AppError {
    constructor(message = HTTP_FORBIDDEN.defaultMessage) {
        super(message, HTTP_FORBIDDEN.code);
    }
}

class NotFoundError extends AppError {
    constructor(message = HTTP_NOT_FOUND.defaultMessage) {
        super(message, HTTP_NOT_FOUND.code);
    }
}

class InternalServerError extends AppError {
    constructor(message = HTTP_INTERNAL_SERVER_ERROR.defaultMessage) {
        super(message, HTTP_INTERNAL_SERVER_ERROR.code);
    }
}

module.exports = {
    HTTP_BAD_REQUEST, 
    HTTP_UNAUTHORIZED,
    HTTP_PAYMENT_REQUIRED,
    HTTP_FORBIDDEN,
    HTTP_NOT_FOUND,
    HTTP_INTERNAL_SERVER_ERROR,

    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    InternalServerError
};
