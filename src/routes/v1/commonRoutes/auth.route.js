const express = require('express');
const { authController } = require('../../../controllers/commonControllers');
const validate = require('../../../middlewares/validate');
const { authValidation } = require('../../../validations');
const { auth } = require('../../../middlewares/auth');
const { ROLES } = require('../../../helper/constant.helper');

const router = express.Router();

/**
 * Register.
 */
router.post('/register', validate(authValidation.register), authController.register);

/**
 * Verify OTP.
 */
router.post('/verify-otp', validate(authValidation.verifyOtp), authController.verifyOtp);

/**
 * Login.
 */
router.post('/login', validate(authValidation.login), authController.login);

/**
 * Logout.
 */
router.post('/logout', validate(authValidation.logout), authController.logout);

/**
 * Send OTP.
 */
router.post('/send-otp', validate(authValidation.sendOtp), authController.sendOtp);

/**
 * Social login.
 */
router.post('/social-login', validate(authValidation.socialLogin), authController.socialLogin);

/**
 * Reset password.
 */
router.put('/reset-password', validate(authValidation.resetPassword), authController.resetPassword);

/**
 * Change password.
 */
router.put(
    '/change-password',
    auth(ROLES.user, ROLES.admin),
    validate(authValidation.changePassword),
    authController.changePassword
);

module.exports = router;
