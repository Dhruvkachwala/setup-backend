const Joi = require('joi');
const { objectId } = require('./custom.validation');

/**
 * All user validations are exported from here 👇
 */
module.exports = {
    /**
     * Get all users.
     */
    getAllUser: {
        query: Joi.object().keys({
            page: Joi.number().default(1).allow(''),
            limit: Joi.number().default(10).allow(''),
            search: Joi.string().trim().allow(''),
            sort_by: Joi.string().trim().allow(''),
            is_block: Joi.boolean().allow(''),
        }),
    },

    /**
     * Get single user by _id.
     */
    getUserById: {
        params: Joi.object().keys({
            userId: Joi.string().custom(objectId),
        }),
    },

    /**
     * Update user.
     */
    updateUser: {
        body: Joi.object()
            .keys({
                first_name: Joi.string().max(20).trim().required(),
                last_name: Joi.string().max(20).trim().required(),
                address: Joi.string().max(20).trim().allow(''),
            })
            .min(1),
    },
};
