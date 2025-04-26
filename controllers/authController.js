const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure email transporter
let transporter;
try {
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
        tls: {
            rejectUnauthorized: false // Helps with some SSL issues
        },
        debug: true // Enable debug output
    });

    // Verify the configuration is correct
    transporter.verify(function(error, success) {
        if (error) {
            console.error('Email transporter verification failed:', error);
        } else {
            console.log('Email server is ready to send messages');
        }
    });
} catch (error) {
    console.error('Failed to create email transporter:', error);
}

const loginUser = async (req, res) => {
    const { email, password, isAdminLogin } = req.body;

    // If this is an admin login attempt, use the admin authentication flow
    if (isAdminLogin) {
        return loginAdmin(req, res);
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });

        // Check if the user exists
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare the provided password with the stored hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (isPasswordValid) {
            // Authentication successful
            return res.status(200).json({ 
                message: 'Login successful', 
                userId: user._id,
                isAdmin: false // Regular users are never admins now
            });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Separate admin login function
const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        console.log('Admin login attempt:', email);
        
        // Find the admin by username (which is an email)
        const admin = await Admin.findOne({ username: email.toLowerCase() });
        
        // Check if admin exists
        if (!admin) {
            console.log('Admin not found:', email);
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }
        
        // Compare the password
        const isPasswordValid = await admin.comparePassword(password);
        
        if (isPasswordValid) {
            console.log('Admin login successful:', email);
            return res.status(200).json({
                message: 'Login successful',
                userId: admin._id,
                isAdmin: true,
                fullname: admin.fullname
            });
        } else {
            console.log('Admin password invalid for:', email);
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }
    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({ message: 'Server error during admin login' });
    }
};

const registerUser = async (req, res) => {
    console.log('Registration attempt:', req.body);
    const { fullname, email, password } = req.body;

    // Validate input
    if (!fullname || !email || !password) {
        console.log('Missing required fields');
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check MongoDB connection state
    if (mongoose.connection.readyState !== 1) {
        console.error('MongoDB is not connected. Current state:', mongoose.connection.readyState);
        return res.status(500).json({ message: 'Database connection error. Please try again later.' });
    }

    try {
        // Check if user already exists using the static method
        console.log('Checking if email exists:', email);
        const emailExists = await User.emailExists(email);
        
        if (emailExists) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        // Check if an admin exists with this email
        const adminWithSameEmail = await Admin.findOne({ username: email.toLowerCase() });
        if (adminWithSameEmail) {
            console.log('Email already registered as admin:', email);
            return res.status(400).json({ message: 'This email is reserved for administrator use' });
        }

        // Hash the password
        console.log('Hashing password...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        console.log('Creating new user object...');
        const newUser = new User({
            fullname,
            email,
            password: hashedPassword,
            isAdmin: false // Users registered through signup are never admins now
        });

        console.log('Validating user object...');
        const validationError = newUser.validateSync();
        if (validationError) {
            console.error('Validation error:', validationError);
            const errorMessages = Object.values(validationError.errors).map(err => err.message);
            return res.status(400).json({ message: 'Validation error', errors: errorMessages });
        }

        console.log('Saving new user:', { fullname, email, isAdmin: false });
        
        // Save the user to the database
        try {
        const savedUser = await newUser.save();
        console.log('User saved successfully:', savedUser._id);

            // Return success response with user ID and admin status
            return res.status(201).json({ 
            message: 'User registered successfully', 
            userId: savedUser._id,
                isAdmin: false
            });
        } catch (saveError) {
            console.error('Database save error:', saveError);
            
            // Check for MongoDB specific errors
            if (saveError.name === 'MongoServerError') {
                if (saveError.code === 11000) {
                    // Duplicate key error (likely email)
                    return res.status(400).json({ 
                        message: 'Email already in use. Please use a different email address.' 
                    });
                }
            }
            
            // Handle validation errors
            if (saveError.name === 'ValidationError') {
                const validationErrors = Object.values(saveError.errors).map(err => err.message);
                return res.status(400).json({ 
                    message: 'Validation error', 
                    errors: validationErrors 
                });
            }
            
            throw saveError; // Re-throw for the outer catch
        }
    } catch (error) {
        console.error('Registration error details:', error.name, error.message);
        if (error.errors) {
            // Log validation errors
            Object.keys(error.errors).forEach(field => {
                console.error(`Field ${field} error:`, error.errors[field].message);
            });
        }
        return res.status(500).json({ message: 'Server error during registration. Please try again later.' });
    }
};

// Check if a user is an admin
const checkAdmin = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // First check if the email is an admin
        const admin = await Admin.findOne({ username: email.toLowerCase() });
        if (admin) {
            return res.status(200).json({ isAdmin: true });
        }

        // If not an admin, check if it's a regular user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Regular users are never admins now
        res.status(200).json({ isAdmin: false });
    } catch (error) {
        console.error('Admin check error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all admins (admin only)
const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json(admins);
    } catch (error) {
        console.error('Get admins error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Toggle admin status
const toggleAdmin = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        user.isAdmin = !user.isAdmin;
        await user.save();
        
        res.status(200).json({ 
            message: `User admin status updated successfully`,
            isAdmin: user.isAdmin
        });
    } catch (error) {
        console.error('Toggle admin error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a user
const deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await User.findByIdAndDelete(userId);
        if (!result) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user by email
const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        // First check if this is an admin
        const admin = await Admin.findOne({ username: email.toLowerCase() }).select('-password');
        if (admin) {
            return res.status(200).json({
                fullname: admin.fullname,
                email: admin.username,
                isAdmin: true
            });
        }

        // If not an admin, look for a regular user
        const user = await User.findOne({ email }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Get user by email error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Forgot Password - Send reset email
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }
        
        console.log(`Password reset requested for email: ${email}`);
        console.log(`Email configuration: Using ${process.env.EMAIL_USER} for sending`);
        
        // Find the user by email
        const user = await User.findOne({ email });
        
        // Check if user is registered
        if (!user) {
            console.log(`Password reset attempted for non-existent email: ${email}`);
            // For security, don't reveal if the email doesn't exist, but log it for administrators
            return res.status(200).json({ 
                message: 'If an account exists with that email, a password reset link has been sent.',
                // Include a hidden field that the client can check if needed
                exists: false 
            });
        }
        
        // User exists, proceed with reset token creation
        console.log(`Password reset initiated for registered user: ${email}`);
        
        // Generate a reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        
        // Set token expiration (1 hour from now)
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour in milliseconds
        
        // Save the token and expiry to the user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(resetTokenExpiry);
        await user.save();
        
        // Create the reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/pages/reset-password.html?token=${resetToken}`;
        console.log(`Reset URL generated: ${resetUrl}`);
        
        // Email message content
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Password Reset - Feeding Humanity',
            html: `
                <h1>You requested a password reset</h1>
                <p>Please click the link below to reset your password:</p>
                <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4a90e2; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
            `
        };
        
        console.log('Attempting to send password reset email...');
        
        // Send the email
        try {
            await transporter.sendMail(mailOptions);
            console.log(`Password reset email successfully sent to: ${user.email}`);
        } catch (emailError) {
            console.error('Error sending password reset email:', emailError);
            console.error('Email configuration error. Check EMAIL_USER and EMAIL_PASS in .env file');
            
            // For Gmail users, you might need to:
            console.log('Note: For Gmail accounts, you need to:');
            console.log('1. Enable 2-Step Verification');
            console.log('2. Generate an App Password at https://myaccount.google.com/apppasswords');
            console.log('3. Use that App Password in your .env file');
            
            // Return a specific error for administrators while keeping the user message secure
            return res.status(200).json({ 
                message: 'If an account exists with that email, a password reset link has been sent.',
                adminMessage: 'Email sending failed. Check server logs.',
                exists: true
            });
        }
        
        // Return success message
        return res.status(200).json({ 
            message: 'If an account exists with that email, a password reset link has been sent.',
            exists: true // This won't be shown to the user but can be used by the client
        });
        
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Validate Reset Token
const validateResetToken = async (req, res) => {
    try {
        const { token } = req.params;
        
        if (!token) {
            return res.status(400).json({ 
                message: 'No reset token provided.' 
            });
        }
        
        // First check if any user has this token (to verify it's a valid token)
        const userWithToken = await User.findOne({ 
            resetPasswordToken: token
        });
        
        if (!userWithToken) {
            return res.status(400).json({ 
                message: 'Password reset token is invalid.' 
            });
        }
        
        // Now check if the token is still valid (not expired)
        const user = await User.findOne({ 
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Token expiry date greater than current time
        });
        
        if (!user) {
            return res.status(400).json({ 
                message: 'Password reset token has expired. Please request a new one.' 
            });
        }
        
        // Token is valid
        return res.status(200).json({ 
            message: 'Token is valid',
            email: user.email 
        });
        
    } catch (error) {
        console.error('Validate reset token error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        
        if (!token) {
            return res.status(400).json({ message: 'No reset token provided' });
        }
        
        if (!password) {
            return res.status(400).json({ message: 'Password is required' });
        }
        
        // Validate password strength
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }
        
        // First check if any user has this token (to verify it's a valid token)
        const userWithToken = await User.findOne({ 
            resetPasswordToken: token
        });
        
        if (!userWithToken) {
            return res.status(400).json({ 
                message: 'Password reset token is invalid.' 
            });
        }
        
        // Now check if the token is still valid (not expired)
        const user = await User.findOne({ 
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() } // Token expiry date greater than current time
        });
        
        if (!user) {
            return res.status(400).json({ 
                message: 'Password reset token has expired. Please request a new one.' 
            });
        }
        
        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Update user's password and clear reset token fields
        user.password = hashedPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();
        
        // Send confirmation email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your password has been changed - Feeding Humanity',
            html: `
                <h1>Password Change Confirmation</h1>
                <p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>
                <p>If you did not make this change, please contact support immediately.</p>
            `
        };
        
        try {
            await transporter.sendMail(mailOptions);
            console.log(`Password change confirmation email sent to: ${user.email}`);
        } catch (emailError) {
            console.error('Error sending password change confirmation email:', emailError);
            // Don't expose the error to the user
        }
        
        // Return success message
        return res.status(200).json({ 
            message: 'Password has been reset successfully. You can now log in with your new password.' 
        });
        
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get direct password reset link (for testing only - DO NOT use in production)
const getDirectResetLink = async (req, res) => {
    try {
        const { email } = req.query;
        
        console.log(`Direct reset link requested for email: ${email}`);
        
        if (!email) {
            console.log('Direct reset link request missing email parameter');
            return res.status(400).json({ 
                message: 'Email is required',
                error: 'MISSING_EMAIL'
            });
        }
        
        // Find the user by email
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log(`Direct reset link requested for non-existent email: ${email}`);
            return res.status(404).json({ 
                message: 'No user found with this email address. Please make sure you have registered.',
                error: 'USER_NOT_FOUND'
            });
        }
        
        console.log(`User found for direct reset link: ${user._id}`);
        
        // Generate a reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        console.log(`Reset token generated: ${resetToken.substring(0, 8)}...`);
        
        // Set token expiration (1 hour from now)
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour in milliseconds
        
        // Save the token and expiry to the user
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(resetTokenExpiry);
        
        try {
            await user.save();
            console.log(`Reset token saved to user document: ${user._id}`);
        } catch (saveError) {
            console.error('Error saving reset token to user:', saveError);
            return res.status(500).json({ 
                message: 'Error saving reset token',
                error: 'TOKEN_SAVE_ERROR'
            });
        }
        
        // Create the reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}/pages/reset-password.html?token=${resetToken}`;
        console.log(`Reset URL generated: ${resetUrl}`);
        
        // Return the reset link directly
        return res.status(200).json({ 
            message: 'Password reset link generated successfully',
            resetLink: resetUrl
        });
        
    } catch (error) {
        console.error('Get direct reset link error:', error);
        res.status(500).json({ 
            message: 'Server error while generating reset link',
            error: error.message || 'UNKNOWN_ERROR'
        });
    }
};

module.exports = { 
    loginUser, 
    registerUser, 
    checkAdmin, 
    getAllUsers, 
    getAllAdmins,
    toggleAdmin, 
    deleteUser,
    getUserByEmail,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getDirectResetLink
};