const express = require('express');
const userRoutes = require('./user.route');

const router = express.Router();

router.use('/', userRoutes); // User routes.

module.exports = router;
