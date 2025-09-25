const express = require('express');
const { userController } = require('../../../controllers/adminControllers');
const { auth } = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { userValidation } = require('../../../validations');
const { ROLES } = require('../../../helper/constant.helper');

const router = express.Router();

/**
 * Get user list.
 */
router.get(
    '/list',
    auth(ROLES.admin),
    validate(userValidation.getAllUser),
    userController.getAllUser
);

/**
 * Get single user.
 */
router.get(
    '/get/:userId',
    auth(ROLES.admin),
    validate(userValidation.getUserById),
    userController.getUserById
);

/**
 * Block/Unblock user.
 */
router.patch(
    '/block/:userId',
    auth(ROLES.admin),
    validate(userValidation.getUserById),
    userController.blockUser
);

/**
 * Delete user(SOFT DELETE).
 */
router.delete(
    '/delete/:userId',
    auth(ROLES.admin),
    validate(userValidation.getUserById),
    userController.deleteUser
);

module.exports = router;
