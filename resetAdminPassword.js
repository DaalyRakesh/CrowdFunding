const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const SimpleHash = require('./simple-hash');
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

        const admin = new Admin({
            username: 'rakeshmr1309@gmail.com',
            fullname: 'Admin User'
        });

        // Hash the new password
        const hashedPassword = SimpleHash.hash(newPassword);
        
        // Update the admin's password
        admin.password = hashedPassword;
        await admin.save();
        
        console.log('Admin password reset successfully!');
        console.log('New password:', newPassword);
        
        // Verify the new password works
        const isMatch = SimpleHash.verify(newPassword, admin.password);
        console.log('Password verification test:', isMatch);

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error resetting admin password:', error);
    }
}

resetAdminPassword(); 