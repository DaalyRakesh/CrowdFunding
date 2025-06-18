const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const SimpleHash = require('./simple-hash');
require('dotenv').config();

async function ensureAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crowdfunding');
        console.log('Connected to MongoDB');

        // Delete all existing admin accounts
        await Admin.deleteMany({});
        console.log('Cleared existing admin accounts');

        // Create new admin account with password 'Rakesh123$'
        const admin = new Admin({
            username: 'rakeshmr1309@gmail.com',
            password: 'Rakesh123$',
            fullname: 'Admin User'
        });

        // Save the admin account
        await admin.save();
        console.log('Created new admin account');

        // Verify the password works
        const isMatch = await admin.comparePassword('Rakesh123$');
        console.log('Password verification result:', isMatch);

        // Test password reset
        const resetToken = 'test-reset-token';
        admin.resetPasswordToken = resetToken;
        admin.resetPasswordExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
        await admin.save();
        console.log('Set reset token for admin');

        // Verify reset token
        const adminWithToken = await Admin.findOne({
            resetPasswordToken: resetToken,
            resetPasswordExpires: { $gt: Date.now() }
        });
        console.log('Found admin with reset token:', !!adminWithToken);

        // Reset password
        const newPassword = 'NewPassword123$';
        const hashedPassword = SimpleHash.hash(newPassword);
        admin.password = hashedPassword;
        admin.resetPasswordToken = null;
        admin.resetPasswordExpires = null;
        await admin.save();
        console.log('Reset admin password');

        // Verify new password works
        const isNewPasswordMatch = await admin.comparePassword(newPassword);
        console.log('New password verification result:', isNewPasswordMatch);

        console.log('Admin account setup complete');
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

ensureAdmin(); 