class ApiError extends Error {
    constructor(statusCode, error, isOperational = true, stack = '') {
        super(error);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.error = error;
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

module.exports = ApiError;
