const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function createNewAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crowdfunding');
        console.log('Connected to MongoDB');

        // Delete any existing admin
        await Admin.deleteMany({});
        console.log('Cleared existing admin accounts');

        // Create new admin
        const admin = new Admin({
            username: 'rakeshmr1309@gmail.com',
            password: 'Rakesh123$',
            fullname: 'Admin User'
        });

        await admin.save();
        console.log('New admin account created');

        // Verify the password works
        const isMatch = await admin.comparePassword('Rakesh123$');
        console.log('Password verification result:', isMatch);

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error creating new admin:', error);
    }
}

createNewAdmin(); 