const User = require('../models/User');
const bcrypt = require('bcrypt');

const loginUser = async (req, res) => {
    const { email, password } = req.body;

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
                isAdmin: user.isAdmin 
            });
        } else {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
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

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Check if this is the first user (make them admin)
        const totalUsers = await User.countDocuments();
        const isAdmin = totalUsers === 0;

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            fullname,
            email,
            password: hashedPassword,
            isAdmin
        });

        console.log('Saving new user:', { fullname, email, isAdmin });
        
        // Save the user to the database
        const savedUser = await newUser.save();
        console.log('User saved successfully:', savedUser._id);

        res.status(201).json({ 
            message: 'User registered successfully', 
            userId: savedUser._id,
            isAdmin: savedUser.isAdmin
        });
    } catch (error) {
        console.error('Registration error details:', error.name, error.message);
        if (error.errors) {
            // Log validation errors
            Object.keys(error.errors).forEach(field => {
                console.error(`Field ${field} error:`, error.errors[field].message);
            });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Check if a user is an admin
const checkAdmin = async (req, res) => {
    try {
        const { email } = req.query;
        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ isAdmin: user.isAdmin });
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
    toggleAdmin, 
    deleteUser,
    getUserByEmail
};