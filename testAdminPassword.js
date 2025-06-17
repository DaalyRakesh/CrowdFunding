const mongoose = require('mongoose');
const Admin = require('./models/Admin');
require('dotenv').config();

async function testAdminPassword() {
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

        console.log('Admin found:', {
            username: admin.username,
            hasPassword: !!admin.password,
            passwordLength: admin.password ? admin.password.length : 0
        });

        // Test password comparison
        const testPassword = 'Rakesh123$';
        console.log('Testing password comparison with:', testPassword);
        
        const isMatch = await admin.comparePassword(testPassword);
        console.log('Password match result:', isMatch);

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error testing admin password:', error);
    }
}

testAdminPassword(); 