const httpStatus = require('http-status');
const { userService, tokenService, emailService } = require('../../services');
const ApiError = require('../../utils/apiError');
const catchAsync = require('../../utils/catchAsync');
const bcrypt = require('bcryptjs');
const { TOKEN_TYPES } = require('../../helper/constant.helper');
const { generateMessage } = require('../../helper/function.helper');

/**
 * All user controllers are exported from here 👇
 */
module.exports = {
    /**
     * POST: Register.
     */
    register: catchAsync(async (req, res) => {
        const { body } = req;
        const emailExist = await userService.getUserByEmail(body.email); // Get user by email.

        if (emailExist) {
            throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('already_taken', 'email')); // If email already exist, throw an error.
        }

        const user = await userService.createUser(body); // User create.

        const otp = await tokenService.generateOtpToken(user); // Generate OTP.

        const mailSent = await emailService.sendVerifyEmail({ ...body, otp, subject: 'Register!' }); // Send mail on requested email by users.

        if (!mailSent) {
            await userService.deleteUser(user._id); // Delete user.

            await tokenService.deleteToken(user._id); // Delete token.

            throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('something_went_wrong', '')); // If mail doesn't send, throw an error.
        }

        res.status(httpStatus.CREATED).json({
            success: true,
            message: generateMessage('otp_sent', 'email'),
        });
    }),

    /**
     * POST: Verify OTP.
     */
    verifyOtp: catchAsync(async (req, res) => {
        const { email, otp } = req.body;

        let emailExist = await userService.getUserByEmail(email); // Get user by email.

        if (!emailExist) {
            throw new ApiError(httpStatus.NOT_FOUND, generateMessage('not_found', 'email')); // If email doesn't exist, throw an error.
        }

        if (emailExist.is_block) {
            throw new ApiError(httpStatus.UNAUTHORIZED, generateMessage('account_blocked')); // If the user is blocked, throw an error.
        }

        let token = await tokenService.getToken({
            type: TOKEN_TYPES.verifyOtp,
            user: emailExist._id,
        });

        if (!token) {
            throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('something_went_wrong')); // If token doesn't exist, throw an error.
        }

        if (token.token !== otp) {
            throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('invalid', 'otp')); // If otp doesn't match, throw an error.
        }

        if (token.expires <= new Date()) {
            throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('expired', 'otp')); // If otp expired, throw an error.
        }

        if (!emailExist.is_email_verified) {
            emailExist = await userService.updateUserById(emailExist._id, {
                is_email_verified: true,
            }); // If user isEmailVerified is false, Update (isEmailVerified: true) user by _id.
        }

        const tokens = await tokenService.generateAuthTokens(emailExist); // Generate auth token.

        res.status(httpStatus.OK).json({
            success: true,
            message: generateMessage('verified_successfully', 'otp'),
            data: { user: emailExist, tokens },
        });
    }),

    /**
     * POST: Login.
     */
    login: catchAsync(async (req, res) => {
        const { body } = req;

        let resMessage,
            data = {};

        let emailExist = await userService.getUserByEmail(body.email); // Get user by email.

        if (!emailExist) {
            throw new ApiError(httpStatus.NOT_FOUND, generateMessage('not_found', 'email')); // If email doesn't exist, throw an error.
        }

        if (emailExist.isBlock) {
            throw new ApiError(httpStatus.UNAUTHORIZED, generateMessage('account_blocked')); // If the user is blocked, throw an error.
        }

        if (!emailExist.is_email_verified) {
            const otp = await tokenService.generateOtpToken(emailExist); // Generate OTP.

            const mailSent = await emailService.sendVerifyEmail({
                ...body,
                otp,
                subject: 'Login!',
            }); // Send mail on requested email by users.

            if (!mailSent) {
                throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('something_went_wrong')); // If mail doesn't send, throw an error.
            }

            resMessage = generateMessage('otp_sent', 'email');
        } else {
            if (!emailExist.password || !(await emailExist.isPasswordMatch(body.password))) {
                throw new ApiError(httpStatus.UNAUTHORIZED, generateMessage('wrong', 'password')); // If password doesn't match the user's password, throw an error.
            }

            data.user = emailExist;
            data.tokens = await tokenService.generateAuthTokens(emailExist); // Generate auth token.

            resMessage = generateMessage('successful', 'login');
        }

        res.status(httpStatus.OK).json({ success: true, message: resMessage, data });
    }),

    /**
     * POST: Logout.
     */
    logout: catchAsync(async (req, res) => {
        const refreshToken = await tokenService.getToken({
            token: req.body.refresh_token,
            type: TOKEN_TYPES.refresh,
            blacklisted: false,
        }); // Get refresh token by filter.

        if (!refreshToken) {
            throw new ApiError(httpStatus.NOT_FOUND, generateMessage('not_found', 'refresh_token')); // If refresh token doesn't exist, throw an error.
        }

        await tokenService.deleteToken(refreshToken.user); // Delete token.

        res.status(httpStatus.NO_CONTENT).json({
            success: true,
            message: generateMessage('successful', 'logout'),
        });
    }),

    /**
     * POST: Send OTP.
     */
    sendOtp: catchAsync(async (req, res) => {
        const { body } = req,
            emailExist = await userService.getUserByEmail(body.email); // Get user by email.

        if (!emailExist) {
            throw new ApiError(httpStatus.NOT_FOUND, generateMessage('not_found', 'email')); // If email doesn't exist, throw an error.
        }

        if (emailExist.is_block) {
            throw new ApiError(httpStatus.UNAUTHORIZED, generateMessage('account_blocked')); // If the user is blocked, throw an error.
        }

        const otp = await tokenService.generateOtpToken(emailExist); // Generate otp.

        const mailSent = await emailService.sendVerifyEmail({
            ...body,
            otp,
            subject: 'Verify Mail!',
        }); // Send mail on requested email by users.

        if (!mailSent) {
            throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('something_went_wrong')); // If mail doesn't send, throw an error.
        }

        res.status(httpStatus.OK).json({
            success: true,
            message: generateMessage('otp_sent', 'email'),
        });
    }),

    /**
     * POST: Social login.
     */
    socialLogin: catchAsync(async (req, res) => {
        const { body } = req;
        let user = await userService.getUserByEmail(body.email); // Get user by email.

        user = !user
            ? await userService.createUser({
                  first_name: body.first_name,
                  last_name: body.last_name,
                  email: body.email,
                  social_id: body.social_id,
                  social_type: body.social_type,
                  is_email_verified: true,
              })
            : await userService.updateUserById(user._id, {
                  social_id: body.social_id,
                  social_type: body.social_type,
                  is_email_verified: true,
              });

        const tokens = await tokenService.generateAuthTokens(user); // Generate tokens.

        res.status(httpStatus.OK).json({
            success: true,
            message: generateMessage('successful', 'login'),
            data: { user, tokens },
        });
    }),

    /**
     * PUT: Reset password.
     */
    resetPassword: catchAsync(async (req, res) => {
        const { body } = req;

        const emailExist = await userService.getUserByEmail(body.email); // Get user by email.

        if (!emailExist) {
            throw new ApiError(httpStatus.NOT_FOUND, generateMessage('not_found', 'email')); // If email doesn't exist, throw an error.
        }

        if (emailExist.is_block) {
            throw new ApiError(httpStatus.UNAUTHORIZED, generateMessage('account_blocked')); // If the user is blocked, throw an error.
        }

        let token = await tokenService.getToken({
            type: TOKEN_TYPES.verifyOtp,
            user: emailExist._id,
        }); // Get token by type and user.

        if (!token) {
            throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('something_went_wrong')); // If token doesn't exist, throw an error.
        }

        if (token.token !== body.otp) {
            throw new ApiError(httpStatus.BAD_REQUEST, generateMessage('invalid', 'otp')); // If otp doesn't match, throw an error.
        }

        const bcryptPassword = await bcrypt.hash(body.password, 8); // New password bcrypt.

        await userService.updateUserById(emailExist._id, { password: bcryptPassword }); // Update user password by _id.

        res.status(httpStatus.OK).json({
            success: true,
            message: generateMessage('reset', 'password'),
        });
    }),

    /**
     * PUT: Change password.
     */
    changePassword: catchAsync(async (req, res) => {
        const { user, body } = req;

        if (!(await user.isPasswordMatch(body.old_password))) {
            throw new ApiError(httpStatus.UNAUTHORIZED, generateMessage('wrong', 'password')); // If password doesn't match the user's password, throw an error.
        }

        const bcryptPassword = await bcrypt.hash(body.new_password, 8); // New password bcrypt.

        await userService.updateUserById(user._id, { password: bcryptPassword }); // Update user password by _id.

        res.status(httpStatus.OK).json({
            success: true,
            message: generateMessage('change', 'password'),
        });
    }),
};

/*
Example: localization API error message.
const login = catchAsync(async (req, res) => {
    const { email, password } = req.body;
    let resMessage,
        data = {};

    const reqT = req.i18n.t;

    let emailExist = await userService.getUserByEmail(email); // Get user by email.

    if (!emailExist) {
        throw new ApiError(httpStatus.NOT_FOUND, generateMessage(reqT, 'not_found', 'email')); // If email doesn't exist, throw an error.
    }

    if (emailExist.isBlock) {
        throw new ApiError(httpStatus.UNAUTHORIZED, generateMessage(reqT, 'account_blocked')); // If the user is blocked, throw an error.
    }

    if (!emailExist.isEmailVerified) {
        const otp = await tokenService.generateOtpToken(emailExist); // Generate OTP.

        const mailSent = await emailService.sendVerifyEmail({
            ...req.body,
            otp,
            subject: 'Login!',
        }); // Send mail on requested email by users.

        if (!mailSent) {
            throw new ApiError(
                httpStatus.BAD_REQUEST,
                generateMessage(reqT, 'something_went_wrong')
            ); // If mail doesn't send, throw an error.
        }

        resMessage = generateMessage(reqT, 'otp_sent', 'email');
    } else {
        if (!emailExist.password || !(await emailExist.isPasswordMatch(password))) {
            throw new ApiError(httpStatus.UNAUTHORIZED, generateMessage(reqT, 'wrong', 'password')); // If password doesn't match the user's password, throw an error.
        }

        data.user = emailExist;
        data.tokens = await tokenService.generateAuthTokens(emailExist); // Generate auth token.

        resMessage = generateMessage(reqT, 'successful', 'login');
    }

    res.status(httpStatus.OK).json({ success: true, message: resMessage, data });
});
*/
