const mongoose = require('mongoose');
const User = require('./models/User');
const SimpleHash = require('./simple-hash');
require('dotenv').config();

async function testLogin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/feeding-humanity');
        console.log('✅ Connected to MongoDB');

        // Find the user
        const user = await User.findOne({ email: 'rakesh@gmail.com' });
        
        if (!user) {
            console.log('❌ User rakesh@gmail.com not found');
            return;
        }

        console.log('✅ User found:', {
            email: user.email,
            fullname: user.fullname,
            hasPassword: !!user.password,
            passwordLength: user.password ? user.password.length : 0
        });

        // Test password comparison
        const testPassword = 'password123'; // Try a common password
        const isPasswordValid = await SimpleHash.compare(testPassword, user.password);
        console.log('Password test result:', isPasswordValid);

        if (!isPasswordValid) {
            console.log('🔧 Resetting password for rakesh@gmail.com...');
            const newPassword = 'Rakesh123';
            const hashedPassword = await SimpleHash.hash(newPassword, 10);
            
            user.password = hashedPassword;
            await user.save();
            
            console.log('✅ Password reset successfully!');
            console.log('New credentials:');
            console.log('Email: rakesh@gmail.com');
            console.log('Password: Rakesh123');
        } else {
            console.log('✅ Password is working correctly');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

testLogin(); 