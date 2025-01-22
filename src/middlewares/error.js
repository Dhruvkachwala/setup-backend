const mongoose = require('mongoose');
const httpStatus = require('http-status');
const config = require('../config/config');
const ApiError = require('../utils/apiError');

const errorConverter = (err, req, res, next) => {
    let error = err;
    if (!(error instanceof ApiError)) {
        const statusCode =
            error.statusCode || error instanceof mongoose.Error
                ? httpStatus.BAD_REQUEST
                : httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || httpStatus[statusCode];
        error = new ApiError(statusCode, message, false, err.stack);
    }
    next(error);
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
    let { statusCode = 500, message, error } = err;

    // res.locals.errorMessage = err.message;

    const response = {
        success: false,
        message: error,
        // ...(config.env === 'development' && { stack: err.stack }),
        stack: err.stack,
    };

    res.status(statusCode).json(response);
};

module.exports = {
    errorConverter,
    errorHandler,
};
