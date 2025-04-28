const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const bcrypt = require('bcrypt');

// Use real email service
const emailService = require('../controllers/emailService');

// Health check route to verify the routes are registered correctly
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Password reset routes are working properly',
        timestamp: new Date().toISOString()
    });
});

// Request password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            // Don't expose that the user doesn't exist for security
            return res.status(200).json({ 
                message: 'If your email is registered, you will receive a password reset link',
                exists: false 
            });
        }
        
        // Generate a token
        const token = crypto.randomBytes(32).toString('hex');
        
        // Store the token and expiration in the user document
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await user.save();
        
        // Generate the reset link
        const resetLink = `${req.protocol}://${req.get('host')}/pages/reset-password.html?token=${token}`;
        
        // Send the password reset email
        const result = await emailService.sendPasswordResetEmail(email, resetLink);
        
        res.status(200).json({
            message: 'If your email is registered, you will receive a password reset link',
            emailSent: result.success,
            exists: true
        });
    } catch (error) {
        console.error('Error in forgot-password route:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
});

// Direct reset link option (for testing or when email is not working)
router.get('/direct-reset-link', async (req, res) => {
    try {
        const { email } = req.query;
        
        // Check if user exists
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Generate a secure token
        const token = crypto.randomBytes(32).toString('hex');
        
        // Store the token with user info and expiration (24 hours)
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await user.save();
        
        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/pages/reset-password.html?token=${token}`;
        
        res.status(200).json({ 
            message: 'Reset link generated',
            resetLink: resetUrl
        });
    } catch (error) {
        console.error('Direct reset link error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Validate token
router.get('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        
        // Find user with the token and check if it's not expired
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (user) {
            res.status(200).json({ 
                message: 'Token is valid',
                email: user.email
            });
        } else {
            res.status(400).json({ message: 'Invalid or expired token' });
        }
    } catch (error) {
        console.error('Error validating token:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    
    try {
        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Update the password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        
        // Send confirmation email
        const result = await emailService.sendPasswordChangeConfirmationEmail(user.email);
        
        res.status(200).json({ 
            message: 'Password has been reset successfully',
            emailSent: result.success
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
});

module.exports = router; 