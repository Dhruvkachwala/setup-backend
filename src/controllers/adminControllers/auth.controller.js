const httpStatus = require('http-status');
const { userService, tokenService } = require('../../services');
const ApiError = require('../../utils/apiError');
const catchAsync = require('../../utils/catchAsync');
const { generateMessage } = require('../../helper/function.helper');

/**
 * All admin controllers are exported from here 👇
 */
module.exports = {
    /**
     * POST: Admin login.
     */
    adminLogin: catchAsync(async (req, res) => {
        const { body } = req;
        let data = {};

        let emailExist = await userService.getAdminByEmail(body.email); // Get admin by email.

        if (!emailExist) {
            throw new ApiError(httpStatus.NOT_FOUND, generateMessage('not_found', 'email')); // If email doesn't exist, throw an error.
        }

        if (!emailExist.password || !(await emailExist.isPasswordMatch(body.password))) {
            throw new ApiError(httpStatus.UNAUTHORIZED, generateMessage('wrong', 'password')); // If password doesn't match the admin's password, throw an error.
        }

        data.user = emailExist;
        data.tokens = await tokenService.generateAuthTokens(emailExist); // Generate auth tokens.

        res.status(httpStatus.OK).json({
            success: true,
            message: generateMessage('successful', 'login'),
            data,
        });
    }),
};
