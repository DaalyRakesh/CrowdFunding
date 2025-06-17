const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function resetAdminPassword() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crowdfunding');
        console.log('Connected to MongoDB');

        // Delete existing admin
        await Admin.deleteOne({ username: 'rakeshmr1309@gmail.com' });
        console.log('Deleted existing admin account');

        // Create new admin with fresh password
        const newPassword = 'Rakesh123$';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const admin = new Admin({
            username: 'rakeshmr1309@gmail.com',
            password: hashedPassword,
            fullname: 'Admin User'
        });

        await admin.save();
        console.log('New admin account created with password:', newPassword);

        // Verify the password works
        const isMatch = await bcrypt.compare(newPassword, admin.password);
        console.log('Password verification result:', isMatch);

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error resetting admin password:', error);
    }
}

resetAdminPassword(); 