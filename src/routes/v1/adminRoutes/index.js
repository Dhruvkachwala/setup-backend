const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');

const router = express.Router();

router.use('/auth', authRoutes); // Auth routes.
router.use('/user', userRoutes); // User routes.

module.exports = router;
