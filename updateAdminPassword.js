const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function updateAdminPassword() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crowdfunding');
        console.log('Connected to MongoDB');

        // Find the admin account
        const admin = await Admin.findOne({ username: 'rakeshmr1309@gmail.com' });
        if (!admin) {
            console.log('Admin account not found');
            return;
        }

        // Update the password
        admin.password = 'Rakesh123$';
        await admin.save();
        console.log('Admin password updated successfully');

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error updating admin password:', error);
    }
}

updateAdminPassword(); 