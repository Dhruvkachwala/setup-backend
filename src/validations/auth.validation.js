const Joi = require('joi');
const { password } = require('./custom.validation');
const { SOCIAL_TYPES } = require('../helper/constant.helper');

/**
 * All auth validations are exported from here 👇
 */
module.exports = {
    /**
     * Register.
     */
    register: {
        body: Joi.object().keys({
            first_name: Joi.string().trim().max(20).required(),
            last_name: Joi.string().trim().max(20).required(),
            email: Joi.string().trim().email().required(),
            password: Joi.string().trim().custom(password).required(),
        }),
    },

    /**
     * Verify OTP.
     */
    verifyOtp: {
        body: Joi.object().keys({
            email: Joi.string().email().required(),
            otp: Joi.string().trim().min(4).max(4).required(),
        }),
    },

    /**
     * Login.
     */
    login: {
        body: Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().custom(password).required(),
        }),
    },

    /**
     * Logout.
     */
    logout: {
        body: Joi.object().keys({
            refresh_token: Joi.string().trim().required(),
        }),
    },

    /**
     * Send OTP.
     */
    sendOtp: {
        body: Joi.object().keys({
            email: Joi.string().email().required(),
        }),
    },

    /**
     * Social login.
     */
    socialLogin: {
        body: Joi.object().keys({
            first_name: Joi.string().max(20).trim().required(),
            last_name: Joi.string().max(20).trim().required(),
            email: Joi.string().required(),
            social_id: Joi.string().required(),
            social_type: Joi.string()
                .valid(...Object.values(SOCIAL_TYPES))
                .required(),
        }),
    },

    /**
     * Reset password.
     */
    resetPassword: {
        body: Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().custom(password).required(),
            otp: Joi.string().trim().min(4).max(4).required(),
        }),
    },

    /**
     * Change password.
     */
    changePassword: {
        body: Joi.object().keys({
            old_password: Joi.string().custom(password).required(),
            new_password: Joi.string().custom(password).required(),
        }),
    },
};
