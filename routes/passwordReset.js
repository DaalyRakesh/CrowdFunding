const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const User = require('../models/User');
const SimpleHash = require('../simple-hash');
const Admin = require('../models/Admin');

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
        console.log('Password reset requested for:', email);
        
        // Check if user exists
        let user = await User.findOne({ email });
        let isAdmin = false;
        
        if (!user) {
            // If not found in User, check Admin
            const admin = await Admin.findOne({ username: email.toLowerCase() });
            if (!admin) {
                console.log('No user or admin found with email:', email);
            return res.status(200).json({ 
                message: 'If your email is registered, you will receive a password reset link',
                exists: false 
            });
            }
            console.log('Admin found for password reset:', admin.username);
            // Create a temporary user object for admin
            user = {
                email: admin.username,
                resetPasswordToken: admin.resetPasswordToken,
                resetPasswordExpires: admin.resetPasswordExpires,
                save: async function() {
                    admin.resetPasswordToken = this.resetPasswordToken;
                    admin.resetPasswordExpires = this.resetPasswordExpires;
                    return admin.save();
                }
            };
            isAdmin = true;
        }
        
        // Generate a token
        const token = crypto.randomBytes(32).toString('hex');
        console.log('Generated reset token for:', email);
        
        // Store the token and expiration
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await user.save();
        
        // Generate the reset link
        const resetLink = `${req.protocol}://${req.get('host')}/pages/reset-password.html?token=${token}${isAdmin ? '&isAdmin=true' : ''}`;
        console.log('Reset link generated:', resetLink);
        
        // Send the password reset email
        const result = await emailService.sendPasswordResetEmail(email, resetLink);
        console.log('Password reset email sent:', result.success);
        
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
        const { email, isAdmin } = req.query;
        let user = null;
        let admin = null;
        if (isAdmin === 'true') {
            admin = await Admin.findOne({ username: email.toLowerCase() });
            if (!admin) return res.status(404).json({ message: 'Admin not found' });
        } else {
            user = await User.findOne({ email });
            if (!user) return res.status(404).json({ message: 'User not found' });
        }
        
        // Generate a secure token
        const token = crypto.randomBytes(32).toString('hex');
        
        if (isAdmin === 'true') {
            admin.resetPasswordToken = token;
            admin.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000;
            await admin.save();
        } else {
        user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000;
        await user.save();
        }
        
        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/pages/reset-password.html?token=${token}&isAdmin=${isAdmin === 'true'}`;
        
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
        
        // First check User collection
        let user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (user) {
            return res.status(200).json({ 
                message: 'Token is valid',
                email: user.email
            });
        }

        // If not found in User, check Admin collection
        const admin = await Admin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (admin) {
            return res.status(200).json({ 
                message: 'Token is valid',
                email: admin.username
            });
        }
        
            res.status(400).json({ message: 'Invalid or expired token' });
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
        console.log('Password reset attempt for token:', token);
        
        // First check User collection
        let user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (user) {
            console.log('User found for password reset:', user.email);
        // Hash the new password
        const hashedPassword = await SimpleHash.hash(password, 10);
        
        // Update the password and clear reset token
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        
        // Send confirmation email
        const result = await emailService.sendPasswordChangeConfirmationEmail(user.email);
            console.log('Password reset successful for user:', user.email);
            
            return res.status(200).json({ 
                message: 'Password has been reset successfully',
                emailSent: result.success
            });
        }

        // If not found in User, check Admin collection
        const admin = await Admin.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (admin) {
            console.log('Admin found for password reset:', admin.username);
            // Hash the new password
            const hashedPassword = await SimpleHash.hash(password, 10);
            
            // Update the password and clear reset token
            admin.password = hashedPassword;
            admin.resetPasswordToken = null;
            admin.resetPasswordExpires = null;
            await admin.save();
            
            // Send confirmation email
            const result = await emailService.sendPasswordChangeConfirmationEmail(admin.username);
            console.log('Password reset successful for admin:', admin.username);
            
            return res.status(200).json({ 
            message: 'Password has been reset successfully',
            emailSent: result.success
        });
        }
        
        console.log('No valid token found for password reset');
        return res.status(400).json({ message: 'Invalid or expired token' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
});

module.exports = router; 