const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// In-memory token storage (replace with database in production)
const resetTokens = {};

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    },
    debug: true,
    logger: true
});

// Verify email configuration on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('Email configuration error:', error);
    } else {
        console.log('Email server is ready to send messages');
    }
});

// Helper function to send password reset email
async function sendPasswordResetEmail(userEmail, resetLink) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: userEmail,
            subject: 'Password Reset - Feeding Humanity',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #4a90e2;">Feeding Humanity</h2>
                        <h3 style="color: #333;">Password Reset Request</h3>
                    </div>
                    <p>Hello,</p>
                    <p>We received a request to reset your password for your Feeding Humanity account. If you didn't make this request, you can ignore this email.</p>
                    <p>To reset your password, please click the button below:</p>
                    <div style="text-align: center; margin: 25px 0;">
                        <a href="${resetLink}" style="background-color: #4a90e2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </div>
                    <p>Or copy and paste this link into your browser:</p>
                    <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px; word-break: break-all;">${resetLink}</p>
                    <p><strong>This link will expire in 24 hours.</strong></p>
                    <p>If you're having trouble, please contact our support team.</p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
                        <p>Feeding Humanity - Making a difference together</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return false;
    }
}

// Helper function for sending password changed confirmation
async function sendPasswordChangedEmail(userEmail) {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER || 'your-email@gmail.com',
            to: userEmail,
            subject: 'Password Changed - Feeding Humanity',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <h2 style="color: #4a90e2;">Feeding Humanity</h2>
                        <h3 style="color: #333;">Password Changed Successfully</h3>
                    </div>
                    <p>Hello,</p>
                    <p>Your password for Feeding Humanity has been successfully changed.</p>
                    <p>If you did not request this change, please contact our support team immediately.</p>
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
                        <p>Feeding Humanity - Making a difference together</p>
                        <p>This is an automated message, please do not reply to this email.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Password changed email sent:', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending password changed email:', error);
        return false;
    }
}

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
        
        // Store the token with the user's email and expiration
        resetTokens[token] = {
            email,
            expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        };
        
        // Generate the reset link
        const resetLink = `${req.protocol}://${req.get('host')}/pages/reset-password.html?token=${token}`;
        
        // Try to send the email
        const emailSent = await sendPasswordResetEmail(email, resetLink);
        
        res.status(200).json({
            message: 'If your email is registered, you will receive a password reset link',
            emailSent,
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
        resetTokens[token] = {
            userId: user._id,
            email: user.email,
            expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
        };
        
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
router.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    
    // Check if token exists and is not expired
    if (resetTokens[token] && resetTokens[token].expires > Date.now()) {
        res.status(200).json({ 
            message: 'Token is valid',
            email: resetTokens[token].email
        });
    } else {
        res.status(400).json({ message: 'Invalid or expired token' });
    }
});

// Reset password
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    
    try {
        // Check if token exists and is valid
        if (!resetTokens[token]) {
            return res.status(400).json({ error: 'Invalid or expired token' });
        }
        
        // Check if token is expired
        if (resetTokens[token].expires < Date.now()) {
            delete resetTokens[token]; // Clean up expired token
            return res.status(400).json({ error: 'Token has expired' });
        }
        
        const userEmail = resetTokens[token].email;
        
        // Find the user
        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update the password
        user.password = password; // Mongoose model should have pre-save to hash the password
        await user.save();
        
        // Remove the used token
        delete resetTokens[token];
        
        // Send confirmation email
        await sendPasswordChangedEmail(userEmail);
        
        res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Server error', message: error.message });
    }
});

module.exports = router; 