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
app.use('/api/contact', contactRoutes);

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