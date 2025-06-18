const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const SimpleHash = require('./simple-hash');
require('dotenv').config();

async function debugAdminLogin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/feeding-humanity');
        console.log('✅ Connected to MongoDB');

        const email = 'rakeshmr1309@gmail.com';
        const password = 'Rakesh123$';

        console.log('🔍 Looking for admin with username:', email);
        const admin = await Admin.findOne({ username: email.toLowerCase() });
        
        if (!admin) {
            console.log('❌ Admin not found');
            return;
        }

        console.log('✅ Admin found:', {
            username: admin.username,
            fullname: admin.fullname,
            hasPassword: !!admin.password,
            passwordLength: admin.password ? admin.password.length : 0,
            passwordPreview: admin.password ? admin.password.substring(0, 20) + '...' : 'No password'
        });

        console.log('🔍 Testing password comparison...');
        console.log('Input password:', password);
        console.log('Stored password hash:', admin.password);

        // Test with SimpleHash directly
        console.log('🔍 Testing SimpleHash.compare directly...');
        const simpleHashResult = await SimpleHash.compare(password, admin.password);
        console.log('SimpleHash.compare result:', simpleHashResult);

        // Test with admin method
        console.log('🔍 Testing admin.comparePassword method...');
        const adminMethodResult = await admin.comparePassword(password);
        console.log('admin.comparePassword result:', adminMethodResult);

        if (!simpleHashResult) {
            console.log('🔧 Password comparison failed. Creating new hash...');
            const newHash = await SimpleHash.hash(password, 10);
            console.log('New hash created:', newHash.substring(0, 20) + '...');
            
            admin.password = newHash;
            await admin.save();
            console.log('✅ Admin password updated');
            
            // Test again
            const newTestResult = await SimpleHash.compare(password, admin.password);
            console.log('New password test result:', newTestResult);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

debugAdminLogin(); 