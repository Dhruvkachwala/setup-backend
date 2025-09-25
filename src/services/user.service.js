const { ROLES, FILES_FOLDER, FILE_QUALITY } = require('../helper/constant.helper');
const { User } = require('../models');
const { getRoleByName } = require('./role.service');

let userRoleId, adminRoleId;

/**
 * This IIFE function must be called after the role seeder has run.
 */
(async () => {
    userRoleId = (await getRoleByName(ROLES.user))._id;
    adminRoleId = (await getRoleByName(ROLES.admin))._id;
})();
console.log(`==========>`,);

/**
 * Get admin by email.
 * @param {String} email
 * @returns {Promise<Admin>}
 */
exports.getAdminByEmail = async (email) => {
    return User.findOne({ email, role: adminRoleId, deleted_at: null });
};

/**
 * Get user by _id.
 * @param {import('mongoose').ObjectId} userId
 * @returns {Promise<User>}
 */
exports.getUserById = async (userId) => {
    return User.findOne({ _id: userId, role: userRoleId, deleted_at: null });
};

/**
 * Get user by email.
 * @param {email} email
 * @returns {Promise<User>}
 */
exports.getUserByEmail = async (email) => {
    return User.findOne({ email, role: userRoleId, deleted_at: null });
};

/**
 * Get user by filter.
 * @param {Object} filter
 * @returns {Promise<User>}
 */
exports.getUser = async (filter) => {
    return User.findOne({ ...filter, role: userRoleId, deleted_at: null });
};

/**
 * Get users by filter.
 * @param {Object} filter
 * @returns {Promise<User>}
 */
exports.getUsers = async (filter) => {
    return User.find({ ...filter, role: userRoleId, deleted_at: null });
};
/**
 * Create image URLs.
 * @param {Object} user
 * @param {Object} imageKeys
 * @returns
 */
exports.createImageURL = (user, imageKeys) => {
    let basePath = `${process.env.BASE_URL}/${FILES_FOLDER.userImages}/${user._id}/`;

    if (imageKeys && user?.image) {
        if (imageKeys.org) {
            user.orgImage = `${basePath}${user.image}`;
        }

        if (imageKeys.large) {
            user.largeImage = `${basePath}${user.image.replace('org', FILE_QUALITY.large.type)}`;
        }

        if (imageKeys.small) {
            user.smallImage = `${basePath}${user.image.replace('org', FILE_QUALITY.small.type)}`;
        }

        delete user.image;
    }

    return user;
};

/**
 * Get users with pagination.
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
exports.paginate = async (filter, options, imageKeys) => {
    let users = await User.paginate({ ...filter, role: userRoleId, deleted_at: null }, options);

    if (Object.values(imageKeys).length) {
        users = JSON.parse(JSON.stringify(users)); // Data parse.

        users.results = users.results.map((ele) => this.createImageURL(ele, imageKeys)); // Create images URLs.
    }

    return users;
};

/**
 * Create a user.
 * @param {Object} data
 * @returns {Promise<User>}
 */
exports.createUser = async (data) => {
    return User.create({ role: userRoleId, ...data });
};

/**
 * Update user by _id.
 * @param {import('mongoose').ObjectId} userId
 * @param {Object} data
 * @returns {Promise<User>}
 */
exports.updateUserById = async (userId, data) => {
    return User.findOneAndUpdate({ _id: userId, deleted_at: null }, { $set: data }, { new: true });
};

/**
 * Delete a user(HARD DELETE).
 * @param {import('mongoose').ObjectId} userId
 * @returns {Promise<User>}
 */
exports.deleteUser = async (userId) => {
    return User.deleteOne({ _id: userId, deleted_at: null });
};
