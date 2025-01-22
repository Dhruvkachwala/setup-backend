const express = require('express');
const { authController } = require('../../../controllers/adminControllers');
const validate = require('../../../middlewares/validate');
const { authValidation } = require('../../../validations');
const { auth } = require('../../../middlewares/auth');
const { ROLES } = require('../../../helper/constant.helper');

const router = express.Router();

/**
 * Login.
 */
router.post('/login', validate(authValidation.login), authController.adminLogin);

module.exports = router;
