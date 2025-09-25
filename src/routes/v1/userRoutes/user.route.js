const express = require('express');
const { userController } = require('../../../controllers/userControllers');
const { auth } = require('../../../middlewares/auth');
const validate = require('../../../middlewares/validate');
const { userValidation } = require('../../../validations');
const { ROLES } = require('../../../helper/constant.helper');
const { fileUpload, fileValidation } = require('../../../middlewares/upload');

const router = express.Router();

/**
 * Get user.
 */
router.get('/get', auth(ROLES.user), userController.getUser);

/**
 * Update user.
 */
router.put(
    '/update',
    auth(ROLES.user),
    fileUpload.single('user_image'),
    fileValidation('single', { size: 1000000, ext: ['jpg', 'jpeg', 'png', 'tiff', 'heic'] }),
    validate(userValidation.updateUser),
    userController.updateUser
);

module.exports = router;
