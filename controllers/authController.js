const User = require('../models/User');
const Admin = require('../models/Admin');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

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

module.exports = { 
    loginUser, 
    registerUser, 
    checkAdmin, 
    getAllUsers,
    getAllAdmins,
    toggleAdmin, 
    deleteUser,
    getUserByEmail
};