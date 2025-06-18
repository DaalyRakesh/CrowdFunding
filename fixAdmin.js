const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const SimpleHash = require('./simple-hash');
require('dotenv').config();

async function fixAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crowdfunding');
        console.log('Connected to MongoDB');

        // Delete existing admin
        await Admin.deleteMany({});
        console.log('Deleted existing admin accounts');

        // Create new admin with exact password
        const admin = new Admin({
            username: 'rakeshmr1309@gmail.com',
            password: 'Rakesh123$',
            fullname: 'Admin User'
        });

        // Save admin
        await admin.save();
        console.log('Created new admin account');

        // Verify password works
        const isMatch = await admin.comparePassword('Rakesh123$');
        console.log('Password verification result:', isMatch);

        if (!isMatch) {
            // If password verification fails, try direct SimpleHash comparison
            const storedAdmin = await Admin.findOne({ username: 'rakeshmr1309@gmail.com' });
            const directMatch = SimpleHash.verify('Rakesh123$', storedAdmin.password);
            console.log('Direct SimpleHash comparison result:', directMatch);
        }

        // Test login process
        const testAdmin = await Admin.findOne({ username: 'rakeshmr1309@gmail.com' });
        if (testAdmin) {
            const loginMatch = await testAdmin.comparePassword('Rakesh123$');
            console.log('Login test result:', loginMatch);
        }

        console.log('Admin fix complete');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

fixAdmin(); 