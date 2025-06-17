const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function testAdminLogin() {
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

        // Test password
        const testPassword = 'Rakesh123$';
        console.log('Testing password:', testPassword);

        // Hash the test password
        const salt = await bcrypt.genSalt(10);
        const hashedTestPassword = await bcrypt.hash(testPassword, salt);
        console.log('Hashed test password:', hashedTestPassword);

        // Compare with stored password
        const isMatch = await bcrypt.compare(testPassword, admin.password);
        console.log('Password match result:', isMatch);

        // Update admin password with new hash
        admin.password = hashedTestPassword;
        await admin.save();
        console.log('Admin password updated with new hash');

        // Verify the new password works
        const verifyMatch = await bcrypt.compare(testPassword, admin.password);
        console.log('Verification match result:', verifyMatch);

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error testing admin login:', error);
    }
}

testAdminLogin(); 