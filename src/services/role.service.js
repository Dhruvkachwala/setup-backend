const httpStatus = require('http-status');
const { Role } = require('../models');
const ApiError = require('../utils/apiError');
const { generateMessage } = require('../helper/function.helper');

/**
 * Get role by name.
 * @param {String} roleName
 * @returns {Promise<Role>}
 */
exports.getRoleByName = async (roleName) => {
    const role = await Role.findOne({ role: roleName, deleted_at: null });

    if (!role) {
        throw new ApiError(httpStatus.NOT_FOUND, generateMessage('not_found', 'role')); // If role doesn't exist, throw an error.
    }

    return role;
};
