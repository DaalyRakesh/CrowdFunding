const mongoose = require('mongoose');

// MongoDB connection URI - using MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rakeshmr1309:Rakesh123$@cluster0.mksrqza.mongodb.net/feeding-humanity?retryWrites=true&w=majority';

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            // These options help with connection issues
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s
        });
        console.log('MongoDB Atlas connected successfully');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Don't exit the process, just log the error
        console.log('Continuing without database connection. Check your MongoDB Atlas credentials and network.');
    }
};

module.exports = connectDB;