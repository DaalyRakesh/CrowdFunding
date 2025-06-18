const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const SimpleHash = require('./simple-hash');
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

        // Test password hashing and verification
        await testPasswordHashing(admin);

        // Disconnect from MongoDB
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    } catch (error) {
        console.error('Error testing admin login:', error);
    }
}

// Test password hashing and verification
async function testPasswordHashing(admin) {
    const testPassword = 'test123';
    
    // Hash the test password
    const hashedTestPassword = SimpleHash.hash(testPassword);
    console.log('Test password hashed:', hashedTestPassword);
    
    // Verify the password
    const isMatch = SimpleHash.verify(testPassword, admin.password);
    console.log('Password match:', isMatch);
    
    // Test with wrong password
    const verifyMatch = SimpleHash.verify(testPassword, admin.password);
    console.log('Wrong password match:', verifyMatch);
}

testAdminLogin(); 