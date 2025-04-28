const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// User routes
router.post('/login', authController.loginUser);
router.post('/register', authController.registerUser);
router.get('/check-admin', authController.checkAdmin);
router.get('/users', authController.getAllUsers);
router.get('/admins', authController.getAllAdmins);
router.post('/toggle-admin', authController.toggleAdmin);
router.delete('/users/:id', authController.deleteUser);
router.get('/user', authController.getUserByEmail);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.validateResetToken);
router.post('/reset-password/:token', authController.resetPassword);
router.get('/direct-reset-link', authController.getDirectResetLink);

module.exports = router;