const config = require('../config/config');
const httpStatus = require('http-status');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const { Token, Role } = require('../models');
const ApiError = require('../utils/apiError');
const { ROLES, TOKEN_TYPES } = require('../helper/constant.helper');
const { generateMessage } = require('../helper/function.helper');

/**
 * Generate token.
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {string} [secret]
 * @returns {string}
 */
const generateToken = (userId, expires, type, role, secret = config.jwt.secret) => {
    const payload = {
        sub: userId,
        iat: moment().unix(),
        exp: expires.unix(),
        type,
        role,
    };
    return jwt.sign(payload, secret);
};

/**
 * Save a token.
 * @param {string} token
 * @param {ObjectId} userId
 * @param {Moment} expires
 * @param {string} type
 * @param {boolean} [blacklisted]
 * @returns {Promise<Token>}
 */
const saveToken = async (token, userId, expires, type, blacklisted = false) => {
    return await Token.findOneAndUpdate(
        { user: userId },
        {
            token,
            user: userId,
            expires: expires.toDate(),
            type,
            blacklisted,
        },
        { upsert: true, new: true }
    );
};

/**
 * Generate 4 digit OTP.
 * @returns
 */
const generateOtp = () => ('0'.repeat(4) + Math.floor(Math.random() * 10 ** 4)).slice(-4);

/**
 * Store otp in token table for verify user.
 * @param {object} user
 * @returns {Promise}
 */
exports.generateOtpToken = async (user) => {
    const expires = moment().add(process.env.OTP_EXPIRATION_MINUTES, 'minutes');
    const otp = generateOtp();
    await saveToken(otp, user._id, expires, TOKEN_TYPES.verifyOtp);
    return otp;
};

/**
 * Delete user's token
 * @param {import('mongoose').ObjectId} userId
 * @returns {Promise<Token>}
 */
exports.deleteToken = async (userId) => Token.findOneAndDelete({ user: userId });

/**
 * Get token by filter.
 * @param {object} filter
 * @returns {Promise<Token>}
 */
exports.getToken = async (filter) => Token.findOne(filter);

/**
 * Generate auth tokens.
 * @param {User} user
 * @returns {Promise<Object>}
 */
exports.generateAuthTokens = async (user) => {
    const roleDetails = await Role.findOne({ _id: user.role }); // Get role by _id.

    if (!roleDetails) {
        throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('not_found', 'role')); // If role doesn't exist, throw an error.
    }

    const accessTokenExpires = moment().add(process.env.JWT_ACCESS_EXPIRATION_YEARS, 'year'); // Set access_token's expire time.
    const accessToken = generateToken(
        user._id,
        accessTokenExpires,
        TOKEN_TYPES.access,
        roleDetails && (roleDetails.role == ROLES.user ? ROLES.user : ROLES.admin)
    ); // Generate a new access token from user's unique id and role's name for authenticate.

    const refreshTokenExpires = moment().add(config.jwt.refreshExpirationDays, 'days'); // Set refresh_token's expire time.
    const refreshToken = generateToken(
        user._id,
        refreshTokenExpires,
        TOKEN_TYPES.refresh,
        roleDetails && (roleDetails.role == ROLES.user ? ROLES.user : ROLES.admin)
    ); // Generate a new refresh token from user's unique id and role's name for get new access token.

    await saveToken(refreshToken, user._id, refreshTokenExpires, TOKEN_TYPES.refresh); // Create or update token.

    return {
        access: {
            token: accessToken,
            expires: accessTokenExpires.toDate(),
        },
        refresh: {
            token: refreshToken,
            expires: refreshTokenExpires.toDate(),
        },
    };
};
