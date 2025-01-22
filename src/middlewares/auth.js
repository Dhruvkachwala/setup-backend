const passport = require('passport');
const httpStatus = require('http-status');
const Role = require('../models/role.model');
// const { Permission } = require('../models');
// const { validateAccessPermission } = require('../services/auth.service');
const ApiError = require('../utils/apiError');
const { generateMessage } = require('../helper/function.helper');

// const verifyCallback = (req, resolve, reject, requiredRights, next) => async (err, user, info) => {
//     try {
//         let requireRights = requiredRights;
//         // /**
//         //  * if route have optional, then check the auth token exists or valid
//         //  * 1. no need to check the permissions if requiredRights have optional and no auth user
//         //  * 2. remove optional from requiredRights if have optional and auth user have value and check the permissions
//         //  * 3. if requiredRights have not optional and no auth user then gives an error for required authentication
//         //  */
//         if (requiredRights.includes('optional')) {
//             if (user) {
//                 requireRights = requiredRights.filter((e) => e !== 'optional');
//             } else {
//                 return resolve();
//             }
//         }

//         if (err || info || !user) {
//             return reject(new ApiError(httpStatus.UNAUTHORIZED, messages.pleaseAuthenticate));
//         }
//         req.user = user;

//         const permissionExists = await Permission.findOne({ slug: requireRights })
//         if (permissionExists) {
//             /** check user have access permission */
//             await validateAccessPermission(permissionExists._id, user.role);
//             return resolve();
//         }
//         throw new ApiError(httpStatus.FORBIDDEN, messages.notPermission);
//     } catch (error) {
//         next(error);
//     }
// };

const verifyCallback = (req, resolve, reject, requiredRights) => async (err, user, info) => {
    if (err || info || !user) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, generateMessage('unauthorized')));
    }

    const role = await Role.findOne({ _id: user.role }); // Get role by _id.

    if (!role) {
        return reject(new ApiError(httpStatus.NOT_FOUND, generateMessage('not_found', 'role'))); // If role doesn't exist, throw an error.
    }

    if (!requiredRights.includes(role.role)) {
        return reject(new ApiError(httpStatus.FORBIDDEN, generateMessage('forbidden'))); // If user role doesn't include in role require rights, throw an error.
    }

    if (user?.isBlock) {
        return reject(new ApiError(httpStatus.UNAUTHORIZED, generateMessage('account_blocked'))); // If user is block, throw an error.
    }

    req.user = user;
    req.user.role = role;

    resolve();
};

/**
 * Auth middleware.
 * @param  {Array} requiredRights
 * @returns
 */
exports.auth =
    (...requiredRights) =>
    async (req, res, next) => {
        return new Promise((resolve, reject) => {
            passport.authenticate(
                'jwt',
                { session: false },
                verifyCallback(req, resolve, reject, requiredRights)
            )(req, res, next);
        })
            .then(() => next())
            .catch((err) => next(err));
    };

/**
 * If token then decode else give access to get
 * @returns
 */
exports.authorizeV3 = () => async (req, res, next) => {
    const token = req.headers.authorization;

    if (token) {
        return new Promise(() => {
            passport.authenticate('jwt', { session: false })(req, res, next);
        })
            .then(() => next())
            .catch((err) => next(err));
    }

    next();
};
