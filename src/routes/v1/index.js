const express = require('express');
const commonRoutes = require('./commonRoutes');
const adminRoutes = require('./adminRoutes');
const userRoutes = require('./userRoutes');

const router = express.Router();

/** Common routes */
router.use('/', commonRoutes);

/** Admin routes */
router.use('/admin', adminRoutes);

/** Normal user routes */
router.use('/user', userRoutes);

module.exports = router;
