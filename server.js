// Load environment variables first
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dns = require('dns');
const mongoose = require('./js/db');

// Fix DNS resolution issues - this helps with MongoDB Atlas SRV connection
dns.setDefaultResultOrder('ipv4first');

const authRoutes = require('./routes/authRoutes');
const donationRoutes = require('./routes/donationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const requirementRoutes = require('./routes/requirementRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const contactRoutes = require('./routes/contactRoutes');
const passwordResetRoutes = require('./routes/passwordReset');
const Admin = require('./models/Admin');
const Donation = require('./models/Donation');
const Payment = require('./models/Payment');
const Requirement = require('./models/Requirement');
const Feedback = require('./models/Feedback');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize the default admin account after successful DB connection
mongoose.connection.once('open', async () => {
    try {
        console.log('MongoDB connected successfully');
        await Admin.createDefaultAdmin();
        console.log('Default admin account initialized');
    } catch (error) {
        console.error('Failed to create default admin:', error);
    }
});

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
});

// Middleware to parse request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/requirements', requirementRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/admin/feedback', feedbackRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/password', passwordResetRoutes);

// Admin dashboard statistics endpoint
app.get('/api/admin/dashboard/stats', async (req, res) => {
    try {
        // Get donation count
        const donationCount = await Donation.countDocuments();
        
        // Get payment total
        const paymentResult = await Payment.aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const paymentTotal = paymentResult.length > 0 ? paymentResult[0].total : 0;
        
        // Get requirement count
        const requirementCount = await Requirement.countDocuments();
        
        // Get feedback count
        const feedbackCount = await Feedback.countDocuments();
        
        // Get user count
        const userCount = await User.countDocuments({ isAdmin: false });
        
        // Return all stats
        res.json({
            donations: {
                count: donationCount
            },
            payments: {
                total: paymentTotal
            },
            requirements: {
                count: requirementCount
            },
            feedback: {
                count: feedbackCount
            },
            users: {
                count: userCount
            }
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// API endpoint to get users for admin dashboard
app.get('/api/admin/users', async (req, res) => {
    try {
        // Get all users who are not admins
        const users = await User.find({ isAdmin: false })
            .select('fullname email firstName lastName createdAt')
            .sort({ createdAt: -1 })
            .limit(10);
        
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve HTML files directly
app.get('/pages/:page', (req, res) => {
    res.sendFile(path.join(__dirname, 'pages', req.params.page));
});

// Add graceful error handling for email service failures
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    // Check if it's an email service error
    if (err.message && err.message.includes('email')) {
        return res.status(500).json({
            error: 'Server error',
            message: 'The email service is currently unavailable. Please try again later or contact support.'
        });
    }
    
    // Default error handler
    res.status(500).json({
        error: 'Server error',
        message: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred' 
            : err.message
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});