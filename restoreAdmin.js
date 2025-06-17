const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function restoreAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crowdfunding');
        console.log('Connected to MongoDB');

        // Delete any existing admin accounts
        await Admin.deleteMany({});
        console.log('Cleared existing admin accounts');

        // Create admin with known working credentials
        const admin = new Admin({
            username: 'rakeshmr1309@gmail.com',
            password: 'Rakesh123$',
            fullname: 'Admin User'
        });

        // Save the admin
        await admin.save();
        console.log('Restored admin account with working credentials');

        // Verify the password works
        const isMatch = await admin.comparePassword('Rakesh123$');
        console.log('Password verification result:', isMatch);

        if (isMatch) {
            console.log('Admin account restored successfully!');
            console.log('Login credentials:');
            console.log('Email: rakeshmr1309@gmail.com');
            console.log('Password: Rakesh123$');
            console.log('URL: http://localhost:5000/pages/login.html?admin=true');
        } else {
            console.log('Warning: Password verification failed after restore');
        }
    } catch (error) {
        console.error('Error restoring admin:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

restoreAdmin(); 