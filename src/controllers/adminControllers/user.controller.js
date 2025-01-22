const httpStatus = require('http-status');
const { userService } = require('../../services');
const ApiError = require('../../utils/apiError');
const catchAsync = require('../../utils/catchAsync');
const { generateMessage, str2regex } = require('../../helper/function.helper');

/**
 * All users controllers are exported from here 👇
 */
module.exports = {
    /**
     * GET: Get all user.
     */
    getAllUser: catchAsync(async (req, res) => {
        let { search, is_block, ...options } = req.query;

        const filter = {};

        if (search) {
            search = str2regex(search); // The search string is converted to a regex string.

            filter.$or = [
                { first_name: { $regex: search, $options: 'i' } },
                { last_name: { $regex: search, $options: 'i' } },
            ];
        }

        if (typeof is_block === 'boolean') {
            filter.is_block = is_block;
        }

        res.status(httpStatus.OK).json({
            success: true,
            message: generateMessage('get', 'users'),
            data: await userService.paginate(filter, options, {
                org: 1,
                small: 1,
            }), // Get users with pagination.,
        });
    }),

    /**
     * GET: Get single user.
     */
    getUserById: catchAsync(async (req, res) => {
        const userExist = await userService.getUserById(req.params.userId);

        if (!userExist) {
            throw new ApiError(httpStatus.NOT_FOUND, generateMessage('not_found', 'user')); // If user doesn't exist, throw an error.
        }

        res.status(httpStatus.OK).json({
            success: true,
            message: generateMessage('get', 'user'),
            data: userExist,
        });
    }),

    /**
     * PATCH: Block/Unblock user.
     */
    blockUser: catchAsync(async (req, res) => {
        const userId = req.params.userId,
            userExist = await userService.getUserById(userId); // Get user by _id.

        if (!userExist) {
            throw new ApiError(httpStatus.NOT_FOUND, generateMessage('not_found', 'user')); // If user doesn't exist, throw an error.
        }

        res.status(httpStatus.OK).json({
            success: true,
            message: generateMessage(userExist.is_block ? 'unblocked' : 'blocked', 'user'),
            data: await userService.updateUserById(userId, {
                is_block: userExist.is_block ? false : true,
            }), // Update user by _id (block/unBLock).
        });
    }),

    /**
     * DELETE: Delete user by _id (SOFT DELETE).
     */
    deleteUser: catchAsync(async (req, res) => {
        const userId = req.params.userId,
            userExist = await userService.getUserById(userId); // Get user by _id.

        if (!userExist) {
            throw new ApiError(httpStatus.NOT_FOUND, generateMessage('not_found', 'user')); // If user doesn't exist, throw an error.
        }

        await userService.updateUserById(userId, { deleted_at: new Date() }); // Update user by _id (Delete user).

        res.status(httpStatus.OK).json({
            success: true,
            message: generateMessage('deleted', 'user'),
        });
    }),
};
