const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.loginUser);
router.post('/register', authController.registerUser);
router.get('/check-admin', authController.checkAdmin);
router.get('/users', authController.getAllUsers);
router.get('/admins', authController.getAllAdmins);
router.get('/user', authController.getUserByEmail);
router.put('/toggle-admin/:userId', authController.toggleAdmin);
router.delete('/user/:userId', authController.deleteUser);

module.exports = router;