// Load environment variables first
require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const dns = require('dns');

// Fix DNS resolution issues - this helps with MongoDB Atlas SRV connection
dns.setDefaultResultOrder('ipv4first');

const connectDB = require('./js/db');
const authRoutes = require('./routes/authRoutes');
const donationRoutes = require('./routes/donationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const requirementRoutes = require('./routes/requirementRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');
const contactRoutes = require('./routes/contactRoutes');
const Admin = require('./models/Admin');
const Donation = require('./models/Donation');
const Payment = require('./models/Payment');
const Requirement = require('./models/Requirement');
const Feedback = require('./models/Feedback');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB().then(async () => {
    // Initialize the default admin account after successful DB connection
    try {
        await Admin.createDefaultAdmin();
    } catch (error) {
        console.error('Failed to create default admin:', error);
    }
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});