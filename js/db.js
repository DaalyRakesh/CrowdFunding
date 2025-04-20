const mongoose = require('mongoose');

// MongoDB connection URI - using MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rakeshmr1309:Rakesh123$@cluster0.mksrqza.mongodb.net/feeding-humanity?retryWrites=true&w=majority';

// Connect to MongoDB
const connectDB = async () => {
    try {
        // Check if we're already connected
        if (mongoose.connection.readyState === 1) {
            console.log('MongoDB is already connected');
            return;
        }
        
        console.log('Connecting to MongoDB Atlas...');
        
        // Connection options
        const options = {
            serverSelectionTimeoutMS: 10000, // Increased timeout to 10s
            socketTimeoutMS: 45000, // Close sockets after 45s
            // Added options for better reliability
            retryWrites: true,
            writeConcern: { w: 'majority' },
            retryReads: true,
            maxPoolSize: 10 // Maximum number of connections in the pool
        };
        
        await mongoose.connect(MONGODB_URI, options);
        
        console.log('MongoDB Atlas connected successfully');
        
        // Test database connection by performing a simple operation
        try {
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log(`Connected to database with ${collections.length} collections`);
        } catch (testError) {
            console.error('Failed to verify database connection:', testError);
        }
        
        // Add connection event listeners
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
        // Handle application termination
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed due to app termination');
            process.exit(0);
        });
        
    } catch (error) {
        console.error('MongoDB connection error details:', error);
        
        // More specific error handling
        if (error.name === 'MongoServerSelectionError') {
            console.error('Could not connect to any MongoDB server. Check network or credentials.');
        } else if (error.name === 'MongoNetworkError') {
            console.error('Network issue encountered when connecting to MongoDB.');
        } else if (error.name === 'MongoError' && error.code === 18) {
            console.error('Authentication failed. Check your MongoDB username and password.');
        } else if (error.message && error.message.includes('ENOTFOUND')) {
            console.error('DNS lookup failed. Check your connection and MongoDB Atlas hostname.');
        }
        
        // Don't exit the process, just log the error
        console.log('Continuing without database connection. Check your MongoDB Atlas credentials and network.');
    }
};

module.exports = connectDB;