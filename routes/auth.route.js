const express = require('express');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/users', authController.signup)
router.post('/verifyEmail', authController.verifyOtp)
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/changePassword', authController.changePassword);

module.exports = router;